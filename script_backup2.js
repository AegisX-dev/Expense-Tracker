// Enhanced Expense Tracker Pro - Modern JavaScript Implementation
class ExpenseTrackerPro {
    constructor() {
        // Prevent multiple instances
        if (window.expenseTrackerInstance) {
            return window.expenseTrackerInstance;
        }
        
        // Core data structures
        this.transactions = [];
        this.budgets = [];
        this.settings = {
            theme: 'light',
            currency: 'USD',
            autoSave: true,
            budgetAlerts: true,
            monthlySummary: true
        };
        
        // Chart instances
        this.charts = {
            trend: null,
            category: null,
            analyticsTrend: null,
            analyticsCategory: null,
            analyticsComparison: null
        };
        
        // Pagination
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredTransactions = [];
        
        // Current filters
        this.currentFilters = {
            category: 'all',
            type: 'all',
            search: '',
            sortBy: 'date-desc'
        };
        
        // State flags
        this.initialized = false;
        this.isUpdating = false;
        
        // Store instance globally
        window.expenseTrackerInstance = this;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Prevent multiple initializations
            if (this.initialized) return;
            this.initialized = true;
            
            this.showLoading('Initializing application...');
            
            // Load data from localStorage
            this.loadData();
            
            // Initialize filtered transactions
            this.filteredTransactions = [...this.transactions];
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize charts
            this.initializeCharts();
            
            // Setup navigation
            this.setupNavigation();
            
            // Apply saved theme
            this.applyTheme();
            
            // Update all displays
            this.updateAllDisplays();
            
            // Set current date as default
            this.setDefaultDate();
            
            this.hideLoading();
            this.showToast('Welcome to Expense Tracker Pro!', 'success');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoading();
            this.showToast('Error initializing application', 'error');
        }
    }
    
    // Data Management
    loadData() {
        try {
            const savedTransactions = localStorage.getItem('expenseTracker_transactions');
            const savedBudgets = localStorage.getItem('expenseTracker_budgets');
            const savedSettings = localStorage.getItem('expenseTracker_settings');
            
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions);
            }
            
            if (savedBudgets) {
                this.budgets = JSON.parse(savedBudgets);
            }
            
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading saved data', 'error');
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
            this.showToast('Error saving data', 'error');
        }
    }
    
    // Event Listeners Setup
    setupEventListeners() {
        // Transaction form
        const transactionForm = document.getElementById('transaction-form');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        }
        
        // Budget form
        const budgetForm = document.getElementById('budget-creation-form');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        }
        
        // Search and filters
        const searchInput = document.getElementById('search-transactions');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Filter selects
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.onCategoryFilterChange());
        }
        
        const typeFilter = document.getElementById('filter-type');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.onTypeFilterChange());
        }
        
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.onSortChange());
        }
        
        // Date range picker
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', () => this.updateDashboard());
        }
        
        // Currency selector
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.value = this.settings.currency;
        }
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(btn => {
            if (btn.dataset.theme === this.settings.theme) {
                btn.classList.add('active');
            }
        });
        
        // Budget alerts toggle
        const budgetAlertsToggle = document.getElementById('budget-alerts');
        if (budgetAlertsToggle) {
            budgetAlertsToggle.checked = this.settings.budgetAlerts;
        }
        
        // Monthly summary toggle
        const monthlySummaryToggle = document.getElementById('monthly-summary');
        if (monthlySummaryToggle) {
            monthlySummaryToggle.checked = this.settings.monthlySummary;
        }
    }
    
    // Navigation Setup
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }
    
    navigateTo(page) {
        // Update active page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        
        const targetPage = document.getElementById(page);
        const targetLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
        
        if (targetPage && targetLink) {
            targetPage.classList.add('active');
            targetLink.classList.add('active');
            
            // Update page-specific data
            this.updatePageData(page);
        }
    }
    
    updatePageData(page) {
        switch (page) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'transactions':
                this.updateTransactionsList();
                this.updateCategories();
                break;
            case 'budget':
                this.updateBudgetDisplay();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }
    
    // Transaction Management
    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value.trim();
        let category = document.getElementById('category').value;
        const customCategory = document.getElementById('custom-category').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const paymentMethod = document.getElementById('payment-method').value;
        const errorMessage = document.getElementById('error-message');
        
        // Handle custom category
        if (category === 'custom' && customCategory) {
            category = customCategory;
        }
        
        // Validate input
        if (!date || !description || !category || isNaN(amount) || amount <= 0) {
            errorMessage.textContent = 'Please fill in all fields with valid data.';
            errorMessage.style.display = 'block';
            return;
        }
        
        errorMessage.style.display = 'none';
        
        // Add transaction
        this.addTransaction({
            id: Date.now() + Math.random(),
            type,
            date,
            description,
            category,
            amount,
            paymentMethod,
            timestamp: new Date().toISOString()
        });
        
        // Reset form and hide it
        e.target.reset();
        this.toggleQuickAdd();
        this.setDefaultDate();
        
        this.showToast(`${type} of $${amount.toFixed(2)} added successfully!`, 'success');
    }
    
    addTransaction(transaction) {
        this.transactions.unshift(transaction); // Add to beginning for newest first
        this.saveData();
        this.updateAllDisplays();
        this.checkBudgetAlerts(transaction);
    }
    
    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // Pre-fill form
        document.getElementById('type').value = transaction.type;
        document.getElementById('date').value = transaction.date;
        document.getElementById('description').value = transaction.description;
        
        const standardCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Income', 'Investment', 'Other'];
        
        if (standardCategories.includes(transaction.category)) {
            document.getElementById('category').value = transaction.category;
        } else {
            document.getElementById('category').value = 'custom';
            document.getElementById('custom-category').value = transaction.category;
            document.getElementById('custom-category').style.display = 'block';
        }
        
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('payment-method').value = transaction.paymentMethod || 'cash';
        
        // Remove the transaction (will be re-added when form is submitted)
        this.deleteTransaction(id, false);
        
        // Show form and navigate to transactions page
        this.navigateTo('transactions');
        this.toggleQuickAdd();
    }
    
    deleteTransaction(id, showConfirm = true) {
        if (showConfirm && !confirm('Are you sure you want to delete this transaction?')) {
            return;
        }
        
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const deleted = this.transactions.splice(index, 1)[0];
            this.saveData();
            this.updateAllDisplays();
            
            if (showConfirm) {
                this.showToast(`Transaction deleted successfully`, 'info');
            }
        }
    }
    
    // Budget Management
    handleBudgetSubmit(e) {
        e.preventDefault();
        
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        
        if (!category || isNaN(amount) || amount <= 0) {
            this.showToast('Please fill in all budget fields correctly', 'error');
            return;
        }
        
        // Check if budget already exists for this category
        const existingIndex = this.budgets.findIndex(b => b.category === category);
        
        if (existingIndex !== -1) {
            this.budgets[existingIndex].amount = amount;
            this.showToast(`Budget for ${category} updated to $${amount.toFixed(2)}`, 'success');
        } else {
            this.budgets.push({
                id: Date.now() + Math.random(),
                category,
                amount,
                createdAt: new Date().toISOString()
            });
            this.showToast(`Budget for ${category} set to $${amount.toFixed(2)}`, 'success');
        }
        
        e.target.reset();
        this.toggleBudgetForm();
        this.saveData();
        this.updateBudgetDisplay();
    }
    
    deleteBudget(category) {
        if (!confirm(`Are you sure you want to delete the budget for ${category}?`)) {
            return;
        }
        
        const index = this.budgets.findIndex(b => b.category === category);
        if (index !== -1) {
            this.budgets.splice(index, 1);
            this.saveData();
            this.updateBudgetDisplay();
            this.showToast(`Budget for ${category} deleted`, 'info');
        }
    }
    
    checkBudgetAlerts(transaction) {
        if (!this.settings.budgetAlerts || transaction.type !== 'expense') return;
        
        const budget = this.budgets.find(b => b.category === transaction.category);
        if (!budget) return;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyExpenses = this.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === transaction.category &&
                       tDate.getMonth() === currentMonth &&
                       tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentUsed = (monthlyExpenses / budget.amount) * 100;
        
        if (percentUsed >= 100) {
            this.showToast(`⚠️ Budget exceeded for ${transaction.category}! Used: $${monthlyExpenses.toFixed(2)} / $${budget.amount.toFixed(2)}`, 'error');
        } else if (percentUsed >= 80) {
            this.showToast(`⚠️ Budget warning for ${transaction.category}: ${percentUsed.toFixed(1)}% used`, 'warning');
        }
    }
    
    // Search and Filter
    handleSearch(query) {
        this.currentFilters.search = query.toLowerCase();
        this.filterTransactions();
    }
    
    filterTransactions() {
        // Prevent infinite loops during updates
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
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
            this.sortTransactions(filtered);
            
            this.filteredTransactions = filtered;
            this.currentPage = 1;
            this.updateTransactionsList();
            this.updateTransactionsSummary();
        } finally {
            this.isUpdating = false;
        }
    }
    
    sortTransactions(transactions = this.filteredTransactions) {
        const [field, direction] = this.currentFilters.sortBy.split('-');
        
        transactions.sort((a, b) => {
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
    }
    
    // UI Helpers
    toggleQuickAdd() {
        const form = document.getElementById('quick-add-form');
        if (!form) return;
        
        const isVisible = form.style.display !== 'none';
        form.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            const descInput = document.getElementById('description');
            if (descInput) descInput.focus();
        }
    }
    
    toggleBudgetForm() {
        const form = document.getElementById('budget-form');
        if (!form) return;
        
        const isVisible = form.style.display !== 'none';
        form.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            const catInput = document.getElementById('budget-category');
            if (catInput) catInput.focus();
        }
    }
    
    toggleCustomCategory() {
        const category = document.getElementById('category').value;
        const customInput = document.getElementById('custom-category');
        if (customInput) {
            customInput.style.display = category === 'custom' ? 'block' : 'none';
            if (category !== 'custom') customInput.value = '';
        }
    }
    
    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    formatCurrency(amount) {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: 'C$',
            AUD: 'A$'
        };
        
        const symbol = symbols[this.settings.currency] || '$';
        return `${symbol}${amount.toFixed(2)}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Display Updates
    updateAllDisplays() {
        // Prevent cascading updates
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
            this.updateDashboard();
            this.updateTransactionsList();
            this.updateCategories();
            this.updateBudgetDisplay();
            this.updateAnalytics();
        } finally {
            this.isUpdating = false;
        }
    }
    
    updateDashboard() {
        const dateRange = document.getElementById('date-range')?.value || '30';
        const filteredData = this.getFilteredDataByDateRange(dateRange);
        
        // Update stat cards
        const totalIncome = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
        
        this.updateElement('dashboard-income', this.formatCurrency(totalIncome));
        this.updateElement('dashboard-expenses', this.formatCurrency(totalExpenses));
        this.updateElement('dashboard-balance', this.formatCurrency(netBalance));
        this.updateElement('dashboard-savings', `${savingsRate.toFixed(1)}%`);
        
        // Update change indicators (simplified for now)
        this.updateElement('income-change', '+0%');
        this.updateElement('expense-change', '+0%');
        this.updateElement('balance-change', '+0%');
        this.updateElement('savings-change', '+0%');
        
        // Update charts
        this.updateTrendChart(filteredData);
        this.updateCategoryChart(filteredData);
        
        // Update recent transactions
        this.updateRecentTransactions();
    }
    
    updateTransactionsList() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        const list = document.getElementById('transaction-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (pageTransactions.length === 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) emptyState.style.display = 'block';
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
                    <button class="edit-btn" onclick="app.editTransaction(${transaction.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="app.deleteTransaction(${transaction.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
        
        this.updatePagination();
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
        const emptyState = document.getElementById('empty-budget-state');
        
        if (!budgetList) return;
        
        if (this.budgets.length === 0) {
            budgetList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            this.updateBudgetSummary();
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let totalBudget = 0;
        let totalSpent = 0;
        
        budgetList.innerHTML = '';
        
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
            
            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            
            let progressClass = 'good';
            if (percentUsed >= 100) progressClass = 'danger';
            else if (percentUsed >= 80) progressClass = 'warning';
            
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
    
    updateRecentTransactions() {
        const container = document.getElementById('recent-transactions-list');
        if (!container) return;
        
        const recentTransactions = this.transactions.slice(0, 5);
        
        if (recentTransactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No transactions yet</p>';
            return;
        }
        
        container.innerHTML = recentTransactions.map(transaction => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${transaction.description}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${transaction.category} • ${this.formatDate(transaction.date)}</div>
                </div>
                <div style="font-weight: 700; color: ${transaction.type === 'income' ? 'var(--success-color)' : 'var(--error-color)'}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }
    
    updateAnalytics() {
        const period = document.querySelector('.period-btn.active')?.dataset.period || 'month';
        const filteredData = this.getAnalyticsData(period);
        
        this.updateAnalyticsCharts(filteredData);
        this.updateTopCategories(filteredData);
        this.updateFinancialHealth(filteredData);
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    
    // Data Filtering Helpers
    getFilteredDataByDateRange(days) {
        if (days === 'all') return this.transactions;
        
        const daysAgo = parseInt(days);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        return this.transactions.filter(t => new Date(t.date) >= cutoffDate);
    }
    
    getAnalyticsData(period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return this.transactions;
        }
        
        return this.transactions.filter(t => new Date(t.date) >= startDate);
    }
    
    // Pagination
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.updateTransactionsList();
        }
    }
    
    // Filter event handlers
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
    
    // Chart Management
    initializeCharts() {
        this.initializeTrendChart();
        this.initializeCategoryChart();
    }
    
    initializeTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Income',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: [],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    initializeCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
                        '#ef4444', '#84cc16', '#f97316', '#3b82f6', '#ec4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    updateTrendChart(data) {
        if (!this.charts.trend) return;
        
        // Group data by date
        const dateGroups = {};
        data.forEach(transaction => {
            const date = transaction.date;
            if (!dateGroups[date]) {
                dateGroups[date] = { income: 0, expenses: 0 };
            }
            if (transaction.type === 'income') {
                dateGroups[date].income += transaction.amount;
            } else {
                dateGroups[date].expenses += transaction.amount;
            }
        });
        
        const sortedDates = Object.keys(dateGroups).sort();
        const incomeData = sortedDates.map(date => dateGroups[date].income);
        const expenseData = sortedDates.map(date => dateGroups[date].expenses);
        
        this.charts.trend.data.labels = sortedDates.map(date => this.formatDate(date));
        this.charts.trend.data.datasets[0].data = incomeData;
        this.charts.trend.data.datasets[1].data = expenseData;
        this.charts.trend.update();
    }
    
    updateCategoryChart(data) {
        if (!this.charts.category) return;
        
        const expenseData = {};
        data.filter(t => t.type === 'expense').forEach(transaction => {
            expenseData[transaction.category] = (expenseData[transaction.category] || 0) + transaction.amount;
        });
        
        const labels = Object.keys(expenseData);
        const values = Object.values(expenseData);
        
        this.charts.category.data.labels = labels;
        this.charts.category.data.datasets[0].data = values;
        this.charts.category.update();
    }
    
    updateAnalyticsCharts(data) {
        // Update analytics charts with filtered data
        this.updateCategoryChart(data);
        this.updateTrendChart(data);
    }
    
    updateTopCategories(data) {
        const container = document.getElementById('top-categories-list');
        if (!container) return;
        
        const categoryTotals = {};
        data.filter(t => t.type === 'expense').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        container.innerHTML = sortedCategories.map(([category, amount], index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                <div>
                    <span style="font-weight: 600; color: var(--text-primary);">${index + 1}. ${category}</span>
                </div>
                <span style="font-weight: 700; color: var(--error-color);">${this.formatCurrency(amount)}</span>
            </div>
        `).join('');
    }
    
    updateFinancialHealth(data) {
        const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
        const budgetAdherence = this.calculateBudgetAdherence();
        const expenseConsistency = this.calculateExpenseConsistency(data);
        
        const healthScore = Math.round((Math.max(0, savingsRate) * 0.4 + budgetAdherence * 0.4 + expenseConsistency * 0.2));
        
        this.updateElement('health-score', Math.min(100, healthScore));
        this.updateElement('analytics-savings-rate', `${savingsRate.toFixed(1)}%`);
        this.updateElement('budget-adherence', `${budgetAdherence.toFixed(1)}%`);
        this.updateElement('expense-consistency', `${expenseConsistency.toFixed(1)}%`);
    }
    
    calculateBudgetAdherence() {
        if (this.budgets.length === 0) return 100;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let totalAdherence = 0;
        this.budgets.forEach(budget => {
            const spent = this.transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.type === 'expense' && 
                           t.category === budget.category &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            
            const adherence = Math.max(0, 100 - (spent / budget.amount * 100));
            totalAdherence += adherence;
        });
        
        return totalAdherence / this.budgets.length;
    }
    
    calculateExpenseConsistency(data) {
        const expensesByMonth = {};
        data.filter(t => t.type === 'expense').forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + t.amount;
        });
        
        const monthlyAmounts = Object.values(expensesByMonth);
        if (monthlyAmounts.length < 2) return 100;
        
        const average = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
        const variance = monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / monthlyAmounts.length;
        const standardDeviation = Math.sqrt(variance);
        
        const coefficientOfVariation = average > 0 ? (standardDeviation / average) * 100 : 0;
        return Math.max(0, 100 - coefficientOfVariation);
    }
    
    // Theme Management
    toggleTheme() {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    setTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme();
        this.saveData();
        
        // Update theme buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Update theme toggle button icon
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    // Settings Management
    updateCurrency() {
        const select = document.getElementById('currency-select');
        if (select) {
            this.settings.currency = select.value;
            this.saveData();
            this.updateAllDisplays();
            this.showToast(`Currency updated to ${select.value}`, 'success');
        }
    }
    
    enableLocalStorage() {
        this.settings.autoSave = true;
        this.saveData();
        this.showToast('Auto-save enabled', 'success');
    }
    
    toggleBudgetAlerts() {
        const toggle = document.getElementById('budget-alerts');
        if (toggle) {
            this.settings.budgetAlerts = toggle.checked;
            this.saveData();
            this.showToast(`Budget alerts ${toggle.checked ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    toggleMonthlySummary() {
        const toggle = document.getElementById('monthly-summary');
        if (toggle) {
            this.settings.monthlySummary = toggle.checked;
            this.saveData();
            this.showToast(`Monthly summary ${toggle.checked ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }
        
        this.transactions = [];
        this.budgets = [];
        localStorage.removeItem('expenseTracker_transactions');
        localStorage.removeItem('expenseTracker_budgets');
        
        this.updateAllDisplays();
        this.showToast('All data cleared successfully', 'info');
    }
    
    // Export/Import
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
    
    importTransactions(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let importedData;
                
                if (file.name.endsWith('.csv')) {
                    importedData = this.parseCSV(e.target.result);
                } else {
                    importedData = JSON.parse(e.target.result);
                }
                
                if (Array.isArray(importedData)) {
                    // Add IDs to imported transactions if they don't have them
                    importedData.forEach(transaction => {
                        if (!transaction.id) {
                            transaction.id = Date.now() + Math.random();
                        }
                    });
                    
                    this.transactions = [...this.transactions, ...importedData];
                    this.saveData();
                    this.updateAllDisplays();
                    this.showToast(`${importedData.length} transactions imported successfully`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showToast('Error importing file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
    
    importBudgets(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (Array.isArray(importedData)) {
                    this.budgets = importedData;
                    this.saveData();
                    this.updateBudgetDisplay();
                    this.showToast(`${importedData.length} budgets imported successfully`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showToast('Error importing budgets: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
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
    
    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            return {
                id: Date.now() + Math.random(),
                date: values[0],
                type: values[1],
                description: values[2].replace(/"/g, ''),
                category: values[3].replace(/"/g, ''),
                amount: parseFloat(values[4]),
                paymentMethod: values[5] || 'Cash',
                timestamp: new Date().toISOString()
            };
        });
    }
    
    // Analytics Period Selection
    setAnalyticsPeriod(period) {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        this.updateAnalytics();
    }
    
    // UI Utilities
    showLoading(message = 'Loading...') {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            const messageEl = spinner.querySelector('p');
            if (messageEl) messageEl.textContent = message;
            spinner.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        // Limit the number of toasts to prevent DOM overflow
        const existingToasts = container.children;
        if (existingToasts.length > 5) {
            container.removeChild(existingToasts[0]);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 300ms ease-in';
                setTimeout(() => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple initializations
    if (!app && !window.expenseTrackerInstance) {
        app = new ExpenseTrackerPro();
    } else if (window.expenseTrackerInstance) {
        app = window.expenseTrackerInstance;
    }
});

// Global functions for HTML event handlers
function navigateTo(page) {
    if (app) app.navigateTo(page);
}

function toggleQuickAdd() {
    if (app) app.toggleQuickAdd();
}

function toggleCustomCategory() {
    if (app) app.toggleCustomCategory();
}

function toggleBudgetForm() {
    if (app) app.toggleBudgetForm();
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

function changePage(direction) {
    if (app) app.changePage(direction);
}

function exportTransactions(format) {
    if (app) app.exportTransactions(format);
}

function exportBudgets() {
    if (app) app.exportBudgets();
}

function importTransactions(event) {
    if (app) app.importTransactions(event);
}

function importBudgets(event) {
    if (app) app.importBudgets(event);
}

function toggleTheme() {
    if (app) app.toggleTheme();
}

function setTheme(theme) {
    if (app) app.setTheme(theme);
}

function setAnalyticsPeriod(period) {
    if (app) app.setAnalyticsPeriod(period);
}

function updateCurrency() {
    if (app) app.updateCurrency();
}

function enableLocalStorage() {
    if (app) app.enableLocalStorage();
}

function toggleBudgetAlerts() {
    if (app) app.toggleBudgetAlerts();
}

function toggleMonthlySummary() {
    if (app) app.toggleMonthlySummary();
}

function clearAllData() {
    if (app) app.clearAllData();
}
