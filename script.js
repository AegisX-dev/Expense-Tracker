// Expense Tracker Pro - Stable Version
class ExpenseTrackerPro {
    constructor() {
        // Prevent multiple instances
        if (window.expenseTrackerInstance) {
            return window.expenseTrackerInstance;
        }
        
        // Core data
        this.transactions = [];
        this.budgets = [];
        this.settings = {
            theme: 'light',
            currency: 'USD',
            autoSave: true,
            budgetAlerts: true,
            monthlySummary: true
        };
        
        // UI state
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredTransactions = [...this.transactions];
        this.currentFilters = {
            category: 'all',
            type: 'all',
            search: '',
            sortBy: 'date-desc',
            dateRange: '30'
        };
        
        // Charts
        this.charts = {
            trend: null,
            category: null
        };
        
        // Previous period data for percentage calculations
        this.previousPeriodData = null;
        
        // Alert tracking
        this.alertsShown = [];
        
        // Currency conversion rates (base: USD)
        this.exchangeRates = {
            'USD': 1.00,
            'EUR': 0.85,
            'GBP': 0.73,
            'JPY': 110.00,
            'CAD': 1.25,
            'AUD': 1.35
        };
        
        // Prevent infinite loops
        this.initialized = false;
        this.updating = false;
        
        // Store globally
        window.expenseTrackerInstance = this;
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.safeInitialize());
        } else {
            this.safeInitialize();
        }
    }
    
    safeInitialize() {
        if (this.initialized) return;
        this.initialized = true;
        
        try {
            this.loadData();
            this.filteredTransactions = [...this.transactions];
            this.setupBasicEventListeners();
            this.applyTheme();
            this.safeUpdateDisplay();
            this.setDefaultDate();
            this.checkMonthlySummary();
            this.updateExchangeRatesDisplay();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('expenseTracker_transactions');
            if (saved) this.transactions = JSON.parse(saved);
            
            const savedBudgets = localStorage.getItem('expenseTracker_budgets');
            if (savedBudgets) this.budgets = JSON.parse(savedBudgets);
            
            const savedSettings = localStorage.getItem('expenseTracker_settings');
            if (savedSettings) this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    saveData() {
        if (!this.settings.autoSave) return;
        try {
            localStorage.setItem('expenseTracker_transactions', JSON.stringify(this.transactions));
            localStorage.setItem('expenseTracker_budgets', JSON.stringify(this.budgets));
            localStorage.setItem('expenseTracker_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    setupBasicEventListeners() {
        // Transaction form
        const form = document.getElementById('transaction-form');
        if (form && !form.hasListener) {
            form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
            form.hasListener = true;
        }
        
        // Budget form
        const budgetForm = document.getElementById('budget-creation-form');
        if (budgetForm && !budgetForm.hasListener) {
            budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
            budgetForm.hasListener = true;
        }
        
        // Search functionality
        const searchInput = document.getElementById('search-transactions');
        if (searchInput && !searchInput.hasListener) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.hasListener = true;
        }
        
        // Filter selects
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter && !categoryFilter.hasListener) {
            categoryFilter.addEventListener('change', () => this.onCategoryFilterChange());
            categoryFilter.hasListener = true;
        }
        
        const typeFilter = document.getElementById('filter-type');
        if (typeFilter && !typeFilter.hasListener) {
            typeFilter.addEventListener('change', () => this.onTypeFilterChange());
            typeFilter.hasListener = true;
        }
        
        // Date range selector
        const dateRange = document.getElementById('date-range');
        if (dateRange && !dateRange.hasListener) {
            dateRange.addEventListener('change', () => this.handleDateRangeChange());
            dateRange.hasListener = true;
        }
        
        // Currency selector
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect && !currencySelect.hasListener) {
            currencySelect.addEventListener('change', () => this.updateCurrency());
            currencySelect.value = this.settings.currency;
            currencySelect.hasListener = true;
        }
        
        // Budget alerts toggle
        const budgetAlerts = document.getElementById('budget-alerts');
        if (budgetAlerts && !budgetAlerts.hasListener) {
            budgetAlerts.addEventListener('change', () => this.toggleBudgetAlerts());
            budgetAlerts.checked = this.settings.budgetAlerts;
            budgetAlerts.hasListener = true;
        }
        
        // Monthly summary toggle
        const monthlySummary = document.getElementById('monthly-summary');
        if (monthlySummary && !monthlySummary.hasListener) {
            monthlySummary.addEventListener('change', () => this.toggleMonthlySummary());
            monthlySummary.checked = this.settings.monthlySummary;
            monthlySummary.hasListener = true;
        }
        
        // Navigation
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (!link.hasListener) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateTo(link.getAttribute('data-page'));
                });
                link.hasListener = true;
            }
        });
        
        // Clear error message when form is reset or fields are changed
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            const formInputs = form?.querySelectorAll('input, select');
            formInputs?.forEach(input => {
                if (!input.hasErrorListener) {
                    input.addEventListener('input', () => {
                        if (errorMessage.style.display === 'block') {
                            errorMessage.style.display = 'none';
                            errorMessage.textContent = '';
                        }
                    });
                    input.hasErrorListener = true;
                }
            });
        }
    }
    
    navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        
        const targetPage = document.getElementById(page);
        const targetLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
        
        if (targetPage && targetLink) {
            targetPage.classList.add('active');
            targetLink.classList.add('active');
            this.safeUpdateDisplay();
        }
    }
    
    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('type')?.value;
        const date = document.getElementById('date')?.value;
        const description = document.getElementById('description')?.value?.trim();
        let category = document.getElementById('category')?.value;
        const customCategory = document.getElementById('custom-category')?.value?.trim();
        const amount = parseFloat(document.getElementById('amount')?.value);
        const paymentMethod = document.getElementById('payment-method')?.value;
        const errorMessage = document.getElementById('error-message');
        
        // Handle custom category
        if (category === 'custom' && customCategory) {
            category = customCategory;
        }
        
        // Validate input
        if (!date || !description || !category || isNaN(amount) || amount <= 0) {
            if (errorMessage) {
                errorMessage.textContent = 'Please fill in all fields with valid data.';
                errorMessage.style.display = 'block';
            } else {
                alert('Please fill in all fields with valid data.');
            }
            return;
        }
        
        // Always hide error message on successful validation
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }
        
        this.addTransaction({
            id: Date.now() + Math.random(),
            type: type || 'expense',
            date,
            description,
            category,
            amount,
            paymentMethod: paymentMethod || 'cash',
            timestamp: new Date().toISOString()
        });
        
        e.target.reset();
        this.toggleQuickAdd();
        this.setDefaultDate();
    }
    
    handleBudgetSubmit(e) {
        e.preventDefault();
        
        const category = document.getElementById('budget-category')?.value;
        const amount = parseFloat(document.getElementById('budget-amount')?.value);
        
        if (!category || isNaN(amount) || amount <= 0) {
            alert('Please fill in all budget fields correctly.');
            return;
        }
        
        // Check if budget already exists for this category
        const existingIndex = this.budgets.findIndex(b => b.category === category);
        
        if (existingIndex !== -1) {
            this.budgets[existingIndex].amount = amount;
            this.showToast(`Budget for ${category} updated to ${this.formatCurrency(amount)}`, 'success');
        } else {
            this.budgets.push({
                id: Date.now() + Math.random(),
                category,
                amount,
                createdAt: new Date().toISOString()
            });
            this.showToast(`Budget for ${category} set to ${this.formatCurrency(amount)}`, 'success');
        }
        
        e.target.reset();
        this.toggleBudgetForm();
        this.saveData();
        this.safeUpdateDisplay();
    }
    
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.filteredTransactions = [...this.transactions]; // Reset filtered to show all
        this.saveData();
        this.safeUpdateDisplay();
    }
    
    deleteTransaction(id) {
        if (!confirm('Delete this transaction?')) return;
        
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const deletedTransaction = this.transactions[index];
            this.transactions.splice(index, 1);
            
            // Also remove from filtered transactions
            const filteredIndex = this.filteredTransactions.findIndex(t => t.id === id);
            if (filteredIndex !== -1) {
                this.filteredTransactions.splice(filteredIndex, 1);
            }
            
            this.saveData();
            this.safeUpdateDisplay();
            this.showToast(`Transaction "${deletedTransaction.description}" deleted successfully`, 'success');
        }
    }
    
    safeUpdateDisplay() {
        if (this.updating) return;
        this.updating = true;
        
        try {
            this.updateDashboard();
            this.updateTransactionsList();
            this.updateCategories();
            this.updateBudgetDisplay();
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            this.updating = false;
        }
    }
    
    handleSearch(query) {
        this.currentFilters.search = query.toLowerCase();
        this.filterTransactions();
    }
    
    filterTransactions() {
        if (this.updating) return;
        
        let filtered = [...this.transactions];
        
        // Apply category filter
        if (this.currentFilters.category !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentFilters.category);
        }
        
        // Apply type filter
        if (this.currentFilters.type !== 'all') {
            filtered = filtered.filter(t => t.type === this.currentFilters.type);
        }
        
        // Apply search filter
        if (this.currentFilters.search) {
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(this.currentFilters.search) ||
                t.category.toLowerCase().includes(this.currentFilters.search)
            );
        }
        
        // Apply sorting
        const [field, direction] = this.currentFilters.sortBy.split('-');
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (field) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                default:
                    return 0;
            }
            
            if (direction === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
        
        this.filteredTransactions = filtered;
        this.currentPage = 1;
        this.safeUpdateDisplay();
    }
    
    onCategoryFilterChange() {
        const select = document.getElementById('filter-category');
        if (select) {
            this.currentFilters.category = select.value;
            this.filterTransactions();
        }
    }
    
    onTypeFilterChange() {
        const select = document.getElementById('filter-type');
        if (select) {
            this.currentFilters.type = select.value;
            this.filterTransactions();
        }
    }
    
    onSortChange() {
        const select = document.getElementById('sort-by');
        if (select) {
            this.currentFilters.sortBy = select.value;
            this.filterTransactions();
        }
    }
    
    updateDashboard() {
        const dateRange = this.currentFilters.dateRange;
        const { current, previous } = this.getFilteredDataByDateRange(dateRange);
        
        const totalIncome = current.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = current.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        const prevIncome = previous.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const prevExpenses = previous.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const prevBalance = prevIncome - prevExpenses;
        
        // Calculate percentage changes
        const incomeChange = this.calculatePercentageChange(totalIncome, prevIncome);
        const expenseChange = this.calculatePercentageChange(totalExpenses, prevExpenses);
        const balanceChange = this.calculatePercentageChange(balance, prevBalance);
        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
        const prevSavingsRate = prevIncome > 0 ? ((prevBalance / prevIncome) * 100) : 0;
        const savingsChange = this.calculatePercentageChange(savingsRate, prevSavingsRate);
        
        this.updateElement('dashboard-income', this.formatCurrency(totalIncome));
        this.updateElement('dashboard-expenses', this.formatCurrency(totalExpenses));
        this.updateElement('dashboard-balance', this.formatCurrency(balance));
        this.updateElement('dashboard-savings', `${savingsRate.toFixed(1)}%`);
        
        // Update percentage changes
        this.updatePercentageChange('income-change', incomeChange);
        this.updatePercentageChange('expense-change', expenseChange);
        this.updatePercentageChange('balance-change', balanceChange);
        this.updatePercentageChange('savings-change', savingsChange);
        
        // Update charts
        this.updateDashboardCharts(current);
        this.updateRecentTransactions();
    }
    
    updateTransactionsList() {
        const list = document.getElementById('transaction-list');
        if (!list) return;
        
        // Clear existing content
        list.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        if (pageTransactions.length === 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) emptyState.style.display = 'block';
            list.innerHTML = '<li style="text-align: center; color: #666;">No transactions found</li>';
            return;
        }
        
        const emptyState = document.getElementById('empty-state');
        if (emptyState) emptyState.style.display = 'none';
        
        pageTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${this.formatDate(transaction.date)} • ${transaction.category} • ${transaction.paymentMethod || 'Cash'}</p>
                    </div>
                    <div class="transaction-amount">
                        <div class="amount ${transaction.type}">${this.formatCurrency(transaction.amount)}</div>
                    </div>
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" onclick="app.deleteTransaction(${transaction.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
        
        this.updatePagination();
        this.updateTransactionsSummary();
    }
    
    updateCategories() {
        const filterSelect = document.getElementById('filter-category');
        if (!filterSelect) return;
        
        const uniqueCategories = [...new Set(this.transactions.map(t => t.category))].sort();
        const currentValue = filterSelect.value;
        
        filterSelect.innerHTML = '<option value="all">All Categories</option>';
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterSelect.appendChild(option);
        });
        
        if (uniqueCategories.includes(currentValue)) {
            filterSelect.value = currentValue;
        }
    }
    
    updateBudgetDisplay() {
        const budgetList = document.getElementById('budget-list');
        if (!budgetList) return;
        
        budgetList.innerHTML = '';
        
        if (this.budgets.length === 0) {
            const emptyState = document.getElementById('empty-budget-state');
            if (emptyState) emptyState.style.display = 'block';
            this.updateBudgetSummary();
            return;
        }
        
        const emptyState = document.getElementById('empty-budget-state');
        if (emptyState) emptyState.style.display = 'none';
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let totalBudget = 0;
        let totalSpent = 0;
        
        this.budgets.forEach(budget => {
            const monthlySpent = this.transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.type === 'expense' && 
                           t.category === budget.category &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            
            const percentUsed = (monthlySpent / budget.amount) * 100;
            const remaining = budget.amount - monthlySpent;
            
            totalBudget += budget.amount;
            totalSpent += monthlySpent;
            
            // Budget alerts
            if (this.settings.budgetAlerts) {
                if (percentUsed >= 100 && !this.alertsShown?.includes(`${budget.category}-over`)) {
                    this.showToast(`Budget exceeded for ${budget.category}! You've spent ${this.formatCurrency(monthlySpent)} of ${this.formatCurrency(budget.amount)}`, 'error');
                    this.markAlertShown(`${budget.category}-over`);
                } else if (percentUsed >= 80 && percentUsed < 100 && !this.alertsShown?.includes(`${budget.category}-warning`)) {
                    this.showToast(`Warning: You've used ${percentUsed.toFixed(1)}% of your ${budget.category} budget`, 'warning');
                    this.markAlertShown(`${budget.category}-warning`);
                }
            }
            
            let progressClass = 'good';
            if (percentUsed >= 100) progressClass = 'danger';
            else if (percentUsed >= 80) progressClass = 'warning';
            
            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            budgetItem.innerHTML = `
                <div class="budget-item-header">
                    <h4>${budget.category}</h4>
                    <button class="delete-btn" onclick="app.deleteBudget('${budget.category}')" title="Delete Budget">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentUsed, 100)}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.875rem;">
                        <span>Spent: ${this.formatCurrency(monthlySpent)}</span>
                        <span>Budget: ${this.formatCurrency(budget.amount)}</span>
                    </div>
                    <div style="text-align: center; margin-top: 4px; font-weight: 600; color: ${remaining >= 0 ? 'var(--success-color)' : 'var(--error-color)'}">
                        ${remaining >= 0 ? 'Remaining' : 'Over'}: ${this.formatCurrency(Math.abs(remaining))}
                    </div>
                </div>
            `;
            budgetList.appendChild(budgetItem);
        });
        
        this.updateBudgetSummary(totalBudget, totalSpent);
    }
    
    updateBudgetSummary(totalBudget = 0, totalSpent = 0) {
        const totalRemaining = totalBudget - totalSpent;
        
        this.updateElement('total-budget', this.formatCurrency(totalBudget));
        this.updateElement('total-spent', this.formatCurrency(totalSpent));
        this.updateElement('total-remaining', this.formatCurrency(totalRemaining));
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        this.updateElement('page-info', `Page ${this.currentPage} of ${totalPages}`);
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }
    
    updateTransactionsSummary() {
        this.updateElement('total-transactions', this.transactions.length);
        this.updateElement('filtered-transactions', this.filteredTransactions.length);
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && element.textContent !== content) {
            element.textContent = content;
        }
    }
    
    formatCurrency(amount) {
        const currencies = {
            'USD': { symbol: '$', decimals: 2 },
            'EUR': { symbol: '€', decimals: 2 },
            'GBP': { symbol: '£', decimals: 2 },
            'JPY': { symbol: '¥', decimals: 0 },
            'CAD': { symbol: 'C$', decimals: 2 },
            'AUD': { symbol: 'A$', decimals: 2 }
        };
        
        const currencyInfo = currencies[this.settings.currency] || currencies['USD'];
        const formattedAmount = amount.toFixed(currencyInfo.decimals);
        
        return `${currencyInfo.symbol}${formattedAmount}`;
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
    
    // New helper methods for enhanced functionality
    getFilteredDataByDateRange(range) {
        const now = new Date();
        const days = range === 'all' ? 999999 : parseInt(range);
        
        const currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - days);
        
        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - days);
        const previousEnd = new Date(currentStart);
        
        const current = this.transactions.filter(t => {
            const date = new Date(t.date);
            return range === 'all' || date >= currentStart;
        });
        
        const previous = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date >= previousStart && date < previousEnd;
        });
        
        return { current, previous };
    }
    
    calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    }
    
    updatePercentageChange(elementId, change) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const isPositive = change >= 0;
        const displayChange = Math.abs(change).toFixed(1);
        
        element.textContent = `${isPositive ? '+' : '-'}${displayChange}%`;
        element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
    }
    
    handleDateRangeChange() {
        const select = document.getElementById('date-range');
        if (select) {
            this.currentFilters.dateRange = select.value;
            this.safeUpdateDisplay();
        }
    }
    
    updateDashboardCharts(data) {
        this.updateTrendChart(data);
        this.updateCategoryChart(data);
    }
    
    updateTrendChart(data) {
        const canvas = document.getElementById('trend-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }
        
        // Group data by date
        const dailyData = {};
        data.forEach(t => {
            const date = t.date;
            if (!dailyData[date]) {
                dailyData[date] = { income: 0, expense: 0 };
            }
            dailyData[date][t.type] += t.amount;
        });
        
        const sortedDates = Object.keys(dailyData).sort();
        const labels = sortedDates.map(date => new Date(date).toLocaleDateString());
        const incomeData = sortedDates.map(date => dailyData[date].income);
        const expenseData = sortedDates.map(date => dailyData[date].expense);
        
        this.charts.trend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'var(--success-color)',
                    backgroundColor: 'var(--success-color)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: 'var(--error-color)',
                    backgroundColor: 'var(--error-color)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }
    
    updateCategoryChart(data) {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        // Group expenses by category
        const categoryData = {};
        data.filter(t => t.type === 'expense').forEach(t => {
            categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        });
        
        const labels = Object.keys(categoryData);
        const amounts = Object.values(categoryData);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];
        
        this.charts.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    updateRecentTransactions() {
        const container = document.getElementById('recent-transactions-list');
        if (!container) return;
        
        const recent = this.transactions.slice(0, 5);
        container.innerHTML = '';
        
        if (recent.length === 0) {
            container.innerHTML = '<p>No recent transactions</p>';
            return;
        }
        
        recent.forEach(t => {
            const div = document.createElement('div');
            div.className = 'recent-transaction';
            div.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-description">${t.description}</span>
                    <span class="transaction-category">${t.category}</span>
                </div>
                <span class="transaction-amount ${t.type}">${this.formatCurrency(t.amount)}</span>
            `;
            container.appendChild(div);
        });
    }
    
    // Currency and settings methods
    updateCurrency() {
        const select = document.getElementById('currency-select');
        if (!select) return;
        
        const newCurrency = select.value;
        const oldCurrency = this.settings.currency;
        
        if (newCurrency === oldCurrency) return;
        
        // Show confirmation dialog for currency conversion
        const conversionRate = this.getConversionRate(oldCurrency, newCurrency);
        const sampleAmount = 100;
        const convertedSample = (sampleAmount * conversionRate).toFixed(2);
        
        const message = `This will convert ALL existing amounts from ${oldCurrency} to ${newCurrency}.\n\nExample: ${this.formatCurrencyWithSymbol(sampleAmount, oldCurrency)} → ${this.formatCurrencyWithSymbol(parseFloat(convertedSample), newCurrency)}\n\nThis action cannot be undone. Continue?`;
        
        if (!confirm(message)) {
            // Reset select to previous value
            select.value = oldCurrency;
            return;
        }
        
        // Show loading
        this.showLoadingSpinner('Converting currency...');
        
        // Convert all amounts
        this.convertAllAmounts(oldCurrency, newCurrency);
        
        // Update settings
        this.settings.currency = newCurrency;
        this.saveData();
        this.safeUpdateDisplay();
        
        // Hide loading and show success
        this.hideLoadingSpinner();
        this.showToast(`Currency converted from ${oldCurrency} to ${newCurrency}`, 'success');
    }
    
    formatCurrencyWithSymbol(amount, currency) {
        const currencies = {
            'USD': { symbol: '$', decimals: 2 },
            'EUR': { symbol: '€', decimals: 2 },
            'GBP': { symbol: '£', decimals: 2 },
            'JPY': { symbol: '¥', decimals: 0 },
            'CAD': { symbol: 'C$', decimals: 2 },
            'AUD': { symbol: 'A$', decimals: 2 }
        };
        
        const currencyInfo = currencies[currency] || currencies['USD'];
        const formattedAmount = amount.toFixed(currencyInfo.decimals);
        
        return `${currencyInfo.symbol}${formattedAmount}`;
    }
    
    convertAllAmounts(fromCurrency, toCurrency) {
        const conversionRate = this.getConversionRate(fromCurrency, toCurrency);
        
        // Convert transaction amounts
        this.transactions.forEach(transaction => {
            transaction.amount = parseFloat((transaction.amount * conversionRate).toFixed(2));
        });
        
        // Convert budget amounts
        this.budgets.forEach(budget => {
            budget.amount = parseFloat((budget.amount * conversionRate).toFixed(2));
        });
        
        // Update filtered transactions
        this.filteredTransactions = [...this.transactions];
    }
    
    getConversionRate(fromCurrency, toCurrency) {
        // Convert from source currency to USD, then to target currency
        const fromRate = this.exchangeRates[fromCurrency] || 1;
        const toRate = this.exchangeRates[toCurrency] || 1;
        
        // Convert to USD first, then to target currency
        return toRate / fromRate;
    }
    
    updateExchangeRates() {
        // This function can be enhanced to fetch real-time rates from an API
        // For now, using static rates with last update timestamp
        const button = document.querySelector('.update-rates-btn');
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real application, you would fetch from an API like:
            // fetch('https://api.exchangerate-api.com/v4/latest/USD')
            
            // For demonstration, slightly randomize rates
            const baseRates = {
                'USD': 1.00,
                'EUR': 0.85,
                'GBP': 0.73,
                'JPY': 110.00,
                'CAD': 1.25,
                'AUD': 1.35
            };
            
            // Add small random variation (±2%)
            Object.keys(baseRates).forEach(currency => {
                if (currency !== 'USD') {
                    const variation = (Math.random() - 0.5) * 0.04; // ±2%
                    this.exchangeRates[currency] = parseFloat((baseRates[currency] * (1 + variation)).toFixed(4));
                }
            });
            
            this.exchangeRates.lastUpdated = new Date().toISOString();
            this.updateExchangeRatesDisplay();
            this.saveData();
            
            if (button) {
                button.classList.remove('loading');
                button.disabled = false;
            }
            
            this.showToast('Exchange rates updated successfully', 'success');
        }, 1500);
    }
    
    updateExchangeRatesDisplay() {
        const container = document.getElementById('exchange-rates');
        if (!container) return;
        
        const currencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
        const currencySymbols = {
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CAD': 'C$',
            'AUD': 'A$'
        };
        
        container.innerHTML = '';
        
        currencies.forEach(currency => {
            const rate = this.exchangeRates[currency];
            const symbol = currencySymbols[currency];
            const div = document.createElement('div');
            div.className = 'rate-item';
            div.textContent = `${currency}: ${symbol}${rate.toFixed(currency === 'JPY' ? 2 : 4)}`;
            container.appendChild(div);
        });
        
        // Add last updated info if available
        if (this.exchangeRates.lastUpdated) {
            const lastUpdated = new Date(this.exchangeRates.lastUpdated);
            const timeString = lastUpdated.toLocaleTimeString();
            const updateInfo = document.createElement('div');
            updateInfo.className = 'rate-item';
            updateInfo.style.gridColumn = '1 / -1';
            updateInfo.style.fontSize = '0.75rem';
            updateInfo.style.color = 'var(--text-secondary)';
            updateInfo.textContent = `Last updated: ${timeString}`;
            container.appendChild(updateInfo);
        }
    }
    
    setTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme();
        this.saveData();
        
        // Update active theme button
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        this.showToast(`Theme changed to ${theme}`, 'success');
    }
    
    toggleBudgetAlerts() {
        const checkbox = document.getElementById('budget-alerts');
        if (checkbox) {
            this.settings.budgetAlerts = checkbox.checked;
            this.saveData();
            this.showToast(`Budget alerts ${checkbox.checked ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    toggleMonthlySummary() {
        const checkbox = document.getElementById('monthly-summary');
        if (checkbox) {
            this.settings.monthlySummary = checkbox.checked;
            this.saveData();
            this.showToast(`Monthly summary ${checkbox.checked ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    enableLocalStorage() {
        this.settings.autoSave = true;
        this.saveData();
        this.showToast('Auto-save enabled', 'success');
    }
    
    clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }
        
        this.transactions = [];
        this.budgets = [];
        this.filteredTransactions = [];
        
        localStorage.removeItem('expenseTracker_transactions');
        localStorage.removeItem('expenseTracker_budgets');
        localStorage.removeItem('expenseTracker_settings');
        
        this.safeUpdateDisplay();
        this.showToast('All data cleared successfully', 'success');
    }
    
    // Import functionality
    importTransactions(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data;
                if (file.name.endsWith('.csv')) {
                    data = this.parseCSV(e.target.result);
                } else {
                    data = JSON.parse(e.target.result);
                }
                
                if (Array.isArray(data)) {
                    this.transactions.push(...data);
                    this.filteredTransactions = [...this.transactions];
                    this.saveData();
                    this.safeUpdateDisplay();
                    this.showToast(`${data.length} transactions imported successfully`, 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                this.showToast('Error importing transactions: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
    
    importBudgets(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.budgets.push(...data);
                    this.saveData();
                    this.safeUpdateDisplay();
                    this.showToast(`${data.length} budgets imported successfully`, 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                this.showToast('Error importing budgets: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
    
    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const transaction = {
                    id: Date.now() + Math.random(),
                    date: values[0],
                    type: values[1],
                    description: values[2].replace(/"/g, ''),
                    category: values[3].replace(/"/g, ''),
                    amount: parseFloat(values[4]),
                    paymentMethod: values[5] || 'Cash',
                    timestamp: new Date().toISOString()
                };
                result.push(transaction);
            }
        }
        
        return result;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
    
    showLoadingSpinner(message = 'Processing...') {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            const messageElement = spinner.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            spinner.style.display = 'flex';
        }
    }
    
    hideLoadingSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
    
    markAlertShown(alertId) {
        if (!this.alertsShown) this.alertsShown = [];
        this.alertsShown.push(alertId);
        
        // Reset alerts daily
        const today = new Date().toDateString();
        if (this.lastAlertReset !== today) {
            this.alertsShown = [alertId];
            this.lastAlertReset = today;
        }
    }
    
    checkMonthlySummary() {
        if (!this.settings.monthlySummary) return;
        
        const today = new Date();
        const isFirstDay = today.getDate() === 1;
        const lastSummary = localStorage.getItem('lastMonthlySummary');
        const currentMonth = `${today.getFullYear()}-${today.getMonth()}`;
        
        if (isFirstDay && lastSummary !== currentMonth) {
            setTimeout(() => {
                this.showMonthlySummary();
                localStorage.setItem('lastMonthlySummary', currentMonth);
            }, 2000);
        }
    }
    
    showMonthlySummary() {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const monthlyTransactions = this.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === lastMonth.getMonth() &&
                   tDate.getFullYear() === lastMonth.getFullYear();
        });
        
        const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        
        const monthName = lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        this.showToast(
            `${monthName} Summary: Income ${this.formatCurrency(income)}, Expenses ${this.formatCurrency(expenses)}, Balance ${this.formatCurrency(balance)}`,
            'info'
        );
    }
    
    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    toggleQuickAdd() {
        const form = document.getElementById('quick-add-form');
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                const descInput = document.getElementById('description');
                if (descInput) descInput.focus();
            }
        }
    }
    
    toggleBudgetForm() {
        const form = document.getElementById('budget-form');
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                const catInput = document.getElementById('budget-category');
                if (catInput) catInput.focus();
            }
        }
    }
    
    toggleCustomCategory() {
        const category = document.getElementById('category')?.value;
        const customInput = document.getElementById('custom-category');
        if (customInput) {
            customInput.style.display = category === 'custom' ? 'block' : 'none';
            if (category !== 'custom') customInput.value = '';
        }
    }
    
    deleteBudget(category) {
        if (!confirm(`Are you sure you want to delete the budget for ${category}?`)) {
            return;
        }
        
        const index = this.budgets.findIndex(b => b.category === category);
        if (index !== -1) {
            this.budgets.splice(index, 1);
            this.saveData();
            this.safeUpdateDisplay();
            this.showToast(`Budget for ${category} deleted successfully`, 'success');
        }
    }
    
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.safeUpdateDisplay();
        }
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveData();
    }
    
    // Export/Import functionality
    exportTransactions(format = 'json') {
        const data = format === 'csv' ? this.convertToCSV(this.transactions) : JSON.stringify(this.transactions, null, 2);
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast(`Transactions exported as ${format.toUpperCase()}`, 'success');
    }
    
    exportBudgets() {
        const data = JSON.stringify(this.budgets, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `budgets_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Budgets exported successfully', 'success');
    }
    
    convertToCSV(data) {
        const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Payment Method'];
        const csvContent = [
            headers.join(','),
            ...data.map(t => [
                t.date,
                t.type,
                `"${t.description}"`,
                `"${t.category}"`,
                t.amount,
                t.paymentMethod || 'Cash'
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// Initialize once when DOM is ready
let app;
if (!window.expenseTrackerInstance) {
    app = new ExpenseTrackerPro();
} else {
    app = window.expenseTrackerInstance;
}

// Global functions - complete set
function navigateTo(page) {
    if (app) app.navigateTo(page);
}

function toggleQuickAdd() {
    if (app) app.toggleQuickAdd();
}

function toggleBudgetForm() {
    if (app) app.toggleBudgetForm();
}

function toggleCustomCategory() {
    if (app) app.toggleCustomCategory();
}

function toggleTheme() {
    if (app) app.toggleTheme();
}

function deleteTransaction(id) {
    if (app) app.deleteTransaction(id);
}

function deleteBudget(category) {
    if (app) app.deleteBudget(category);
}

function changePage(direction) {
    if (app) app.changePage(direction);
}

function filterTransactions() {
    if (app) app.onCategoryFilterChange();
}

function searchTransactions() {
    const input = document.getElementById('search-transactions');
    if (app && input) app.handleSearch(input.value);
}

function sortTransactions() {
    if (app) app.onSortChange();
}

function exportTransactions(format) {
    if (app) app.exportTransactions(format);
}

function exportBudgets() {
    if (app) app.exportBudgets();
}

function setTheme(theme) {
    if (app) app.setTheme(theme);
}

function updateCurrency() {
    if (app) app.updateCurrency();
}

function toggleBudgetAlerts() {
    if (app) app.toggleBudgetAlerts();
}

function toggleMonthlySummary() {
    if (app) app.toggleMonthlySummary();
}

function enableLocalStorage() {
    if (app) app.enableLocalStorage();
}

function clearAllData() {
    if (app) app.clearAllData();
}

function importTransactions(event) {
    if (app) app.importTransactions(event);
}

function importBudgets(event) {
    if (app) app.importBudgets(event);
}

function updateExchangeRates() {
    if (app) app.updateExchangeRates();
}
