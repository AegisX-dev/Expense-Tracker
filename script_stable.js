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
        this.filteredTransactions = [];
        this.currentFilters = {
            category: 'all',
            type: 'all',
            search: '',
            sortBy: 'date-desc'
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
        // Only essential event listeners to prevent conflicts
        const form = document.getElementById('transaction-form');
        if (form && !form.hasListener) {
            form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
            form.hasListener = true;
        }
        
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
        const category = document.getElementById('category')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value);
        
        if (!date || !description || !category || isNaN(amount) || amount <= 0) {
            alert('Please fill in all fields with valid data.');
            return;
        }
        
        this.addTransaction({
            id: Date.now() + Math.random(),
            type: type || 'expense',
            date,
            description,
            category,
            amount,
            timestamp: new Date().toISOString()
        });
        
        e.target.reset();
        this.setDefaultDate();
    }
    
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveData();
        this.safeUpdateDisplay();
    }
    
    deleteTransaction(id) {
        if (!confirm('Delete this transaction?')) return;
        
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            this.saveData();
            this.safeUpdateDisplay();
        }
    }
    
    safeUpdateDisplay() {
        if (this.updating) return;
        this.updating = true;
        
        try {
            this.updateDashboard();
            this.updateTransactionsList();
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            this.updating = false;
        }
    }
    
    updateDashboard() {
        const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        this.updateElement('dashboard-income', this.formatCurrency(totalIncome));
        this.updateElement('dashboard-expenses', this.formatCurrency(totalExpenses));
        this.updateElement('dashboard-balance', this.formatCurrency(balance));
        this.updateElement('dashboard-savings', totalIncome > 0 ? `${((balance / totalIncome) * 100).toFixed(1)}%` : '0%');
    }
    
    updateTransactionsList() {
        const list = document.getElementById('transaction-list');
        if (!list) return;
        
        // Clear existing content
        list.innerHTML = '';
        
        const recent = this.transactions.slice(0, 10);
        
        if (recent.length === 0) {
            list.innerHTML = '<li style="text-align: center; color: #666;">No transactions yet</li>';
            return;
        }
        
        recent.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${this.formatDate(transaction.date)} • ${transaction.category}</p>
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
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && element.textContent !== content) {
            element.textContent = content;
        }
    }
    
    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
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
}

// Initialize once when DOM is ready
let app;
if (!window.expenseTrackerInstance) {
    app = new ExpenseTrackerPro();
} else {
    app = window.expenseTrackerInstance;
}

// Global functions - simplified
function navigateTo(page) {
    if (app) app.navigateTo(page);
}

function toggleQuickAdd() {
    if (app) app.toggleQuickAdd();
}

function toggleTheme() {
    if (app) app.toggleTheme();
}

function deleteTransaction(id) {
    if (app) app.deleteTransaction(id);
}
