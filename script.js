// Global array to store transactions
let transactions = [];
let chart;

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    setupNavigation();
    filterTransactions();
    updateSummary();
    updateChart();
});

// Set up navigation between pages
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

// Navigate to a specific page
function navigateTo(page) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(page).classList.add('active');
    document.querySelector(`.nav-links a[data-page="${page}"]`).classList.add('active');
}

// Handle form submission for adding transactions
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    let category = document.getElementById('category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const errorMessage = document.getElementById('error-message');

    if (category === 'custom' && customCategory) {
        category = customCategory;
    }

    // Validate input fields
    if (!date || !description || !category || isNaN(amount) || amount <= 0) {
        errorMessage.textContent = 'Please fill in all fields with valid data.';
        return;
    }

    errorMessage.textContent = '';
    addTransaction(type, date, description, category, amount);
    this.reset();
    document.getElementById('custom-category').style.display = 'none';
});

// Add a new transaction to the list
function addTransaction(type, date, description, category, amount) {
    const transaction = { type, date, description, category, amount };
    transactions.push(transaction);
    updateCategories();
    filterTransactions();
    updateSummary();
    updateChart();
}

// Display the list of transactions
function displayTransactions(filteredTransactions = transactions) {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';

    filteredTransactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${transaction.date} - ${transaction.description} (${transaction.category}) - 
            $${transaction.amount.toFixed(2)}
            <button class="edit-btn" onclick="editTransaction(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

// Delete a transaction by index
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateCategories();
    filterTransactions();
    updateSummary();
    updateChart();
}

// Edit a transaction by pre-filling the form
function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById('type').value = transaction.type;
    document.getElementById('date').value = transaction.date;
    document.getElementById('description').value = transaction.description;
    document.getElementById('category').value = transaction.category === 'Food' || 
        transaction.category === 'Transportation' || 
        transaction.category === 'Entertainment' || 
        transaction.category === 'Other' ? transaction.category : 'custom';
    document.getElementById('custom-category').value = transaction.category === 'Food' || 
        transaction.category === 'Transportation' || 
        transaction.category === 'Entertainment' || 
        transaction.category === 'Other' ? '' : transaction.category;
    document.getElementById('amount').value = transaction.amount;
    toggleCustomCategory();

    transactions.splice(index, 1);
    updateCategories();
    filterTransactions();
    updateSummary();
    updateChart();
    navigateTo('transactions');
}

// Update the financial summary (total income, expenses, net income)
function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    document.getElementById('total-income').textContent = totalIncome.toFixed(2);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('net-income').textContent = netIncome.toFixed(2);
}

// Toggle visibility of the custom category input
function toggleCustomCategory() {
    const category = document.getElementById('category').value;
    const customCategoryInput = document.getElementById('custom-category');
    customCategoryInput.style.display = category === 'custom' ? 'block' : 'none';
    if (category !== 'custom') customCategoryInput.value = '';
}

// Update the category filter dropdown
function updateCategories() {
    const filterSelect = document.getElementById('filter-category');
    const uniqueCategories = [...new Set(transactions.map(t => t.category))];
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">All</option>';
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });
    filterSelect.value = currentValue && uniqueCategories.includes(currentValue) ? currentValue : 'all';
}

// Filter transactions based on the selected category
function filterTransactions() {
    const filterCategory = document.getElementById('filter-category').value;
    const filtered = filterCategory === 'all' 
        ? transactions 
        : transactions.filter(t => t.category === filterCategory);
    displayTransactions(filtered);
}

// Initialize the Chart.js pie chart
function initializeChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f7b731']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Ensure the chart maintains its aspect ratio
            aspectRatio: 1, // Make the chart a square
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            family: 'Inter'
                        },
                        color: '#2c3e50'
                    }
                }
            }
        }
    });
}

// Update the pie chart with expense data
function updateChart() {
    const expenseData = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
        });

    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);

    const chartCanvas = document.getElementById('expense-chart');
    const noExpensesMessage = document.getElementById('no-expenses-message');

    // Reset canvas dimensions to ensure proper rendering
    chartCanvas.style.width = '100%';
    chartCanvas.style.height = '100%';

    if (labels.length > 0) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        chartCanvas.style.display = 'block';
        noExpensesMessage.style.display = 'none';
    } else {
        chartCanvas.style.display = 'none';
        noExpensesMessage.style.display = 'block';
    }
}

// Export transactions as a JSON file
function exportTransactions() {
    const dataStr = JSON.stringify(transactions);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import transactions from a JSON file
function importTransactions(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                transactions = importedData;
                updateCategories();
                filterTransactions();
                updateSummary();
                updateChart();
            } else {
                document.getElementById('error-message').textContent = 'Invalid file format.';
            }
        } catch (error) {
            document.getElementById('error-message').textContent = 'Error importing file.';
        }
    };
    reader.readAsText(file);
}