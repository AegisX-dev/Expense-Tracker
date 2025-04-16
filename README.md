# Expense Tracker

A simple web-based application to track income and expenses, visualize financial data, and manage transactions. Built with HTML, CSS, JavaScript, and Chart.js, this app allows users to add, edit, delete, and filter transactions, view financial summaries, and export/import data.

# Features

Add Transactions: Record income or expenses with details like date, description, category, and amount.

Edit/Delete Transactions: Modify or remove existing transactions.

Filter Transactions: View transactions by category.

Financial Insights: See total income, expenses, and net income, along with a pie chart of expense distribution.

Export/Import Data: Save transactions as a JSON file or import them from a JSON file.

Responsive Design: Works seamlessly on both desktop and mobile devices.

# Technologies Used

HTML5: Structure of the web application.

CSS3: Styling with a modern, gradient-based design and responsive layout.

JavaScript: Core functionality for managing transactions and interactivity.

Chart.js: Visualization of expense data in a pie chart.

Font Awesome: Icons for enhanced UI.

Google Fonts (Inter): Clean and modern typography.

# Usage

Home Page: Start by clicking "Get Started" to navigate to the Transactions page.
Add a Transaction:
Select the type (Income or Expense).
Enter the date, description, category, and amount.
Use a custom category if needed by selecting "Custom" and entering a category name.
Submit to add the transaction.

View Transactions: See all transactions listed below the form, with options to edit or delete.

Filter Transactions: Use the category filter to display specific transactions.

Insights Page: View a summary of total income, expenses, and net income, along with a pie chart of expense categories.

Export/Import:
Export transactions as a JSON file by clicking "Export Transactions."
Import a JSON file of transactions using the "Import Transactions" button.

#File Structure

index.html: Main HTML file containing the structure of the app.

styles.css: CSS file for styling the application.

script.js: JavaScript file handling all functionality, including transaction management and chart rendering.

# Notes

Transactions are stored in the browser's memory and will be lost on page refresh. Use the export feature to save data.
The app validates inputs to ensure all fields are filled and amounts are positive.
The pie chart only displays when there are expense transactions.
Custom categories are supported and automatically added to the filter dropdown.

# Future Improvements

Persist data using localStorage or a backend database.
Add more chart types (e.g., line chart for expenses over time).
Implement user authentication for personalized data storage.
Enhance filtering with date ranges or transaction types.

# License

This project is open-source and available under the MIT License.
