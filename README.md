# 💰 Expense Tracker Pro

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/AegisX-dev/Expense-Tracker)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

A professional-grade, feature-rich web application for comprehensive personal financial management. Built with modern web technologies, this application provides an intuitive interface for tracking expenses, managing budgets, analyzing spending patterns, and maintaining financial health.

## ✨ Features

### 🏠 Dashboard & Analytics
- **Real-time Financial Overview** - Live statistics with period-over-period comparisons
- **Interactive Charts** - Spending trends (line chart) and category breakdown (doughnut chart)
- **Percentage Changes** - Visual indicators showing financial trends
- **Recent Transactions** - Quick view of latest financial activities

### 💳 Transaction Management
- **Quick Add** - Fast transaction entry with smart defaults
- **Advanced Filtering** - Filter by category, type, date range, or search terms
- **Smart Pagination** - Efficient browsing of large transaction lists
- **Real-time Updates** - Instant UI updates without page refresh
- **Custom Categories** - Create and manage personalized expense categories

### 📊 Budget Tracking
- **Monthly Budgets** - Set spending limits by category
- **Progress Visualization** - Color-coded progress bars with alerts
- **Budget Alerts** - Real-time notifications at 80% and 100% usage
- **Overspend Tracking** - Clear indicators when budgets are exceeded

### 🌍 Multi-Currency Support
- **6 Currencies** - USD, EUR, GBP, JPY, CAD, AUD
- **Live Conversion** - Automatic conversion of existing data
- **Exchange Rates** - Built-in rate management with update functionality
- **Smart Formatting** - Currency-appropriate decimal places

### 🎨 Modern UI/UX
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Dark/Light Themes** - System preference detection and manual toggle
- **Toast Notifications** - Elegant, non-intrusive feedback system
- **Loading States** - Professional loading indicators for better UX

### 📈 Data Management
- **Local Storage** - Automatic data persistence
- **Export/Import** - JSON and CSV format support
- **Data Validation** - Comprehensive input validation and error handling
- **Backup & Restore** - Complete data backup capabilities

### 🔔 Smart Notifications
- **Budget Alerts** - Configurable spending limit warnings
- **Monthly Summaries** - Automatic end-of-month financial reports
- **Success Feedback** - Confirmation for all user actions
- **Error Handling** - Clear, actionable error messages

## 🛠 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js 4.4.2
- **Icons**: Font Awesome 6.4.0
- **Storage**: Browser localStorage
- **Design**: CSS Grid, Flexbox, Custom Properties

### Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

### Performance
- Lightweight (~200KB total)
- Fast loading (<1s on 3G)
- Smooth animations (60fps)
- Efficient memory usage

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- No server setup required

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/AegisX-dev/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Open the application**
   ```bash
   # Simply open index.html in your browser
   open index.html
   # Or use a local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Start tracking!**
   - Add your first transaction
   - Set up budgets for your categories
   - Explore the dashboard and analytics

## 📱 Usage Guide

### Adding Transactions
1. Click **"Quick Add"** on the Transactions page
2. Fill in transaction details:
   - Type (Income/Expense)
   - Date (defaults to today)
   - Description
   - Category (or create custom)
   - Amount
   - Payment method
3. Click **"Add Transaction"** to save

### Managing Budgets
1. Navigate to the **Budget** page
2. Click **"Add Budget"** 
3. Select category and set monthly limit
4. Monitor progress with visual indicators
5. Receive alerts when approaching limits

### Viewing Analytics
1. Visit the **Dashboard** for overview
2. Check **Analytics** page for detailed insights
3. Use date range selector to analyze different periods
4. Review percentage changes and trends

### Customizing Settings
1. Go to **Settings** page
2. Choose theme (Light/Dark/Auto)
3. Select preferred currency
4. Configure notifications
5. Manage data (export/import/clear)

## 📁 File Structure

```
Expense-Tracker/
├── index.html              # Main application file
├── styles.css              # Complete styling system
├── script.js               # Core application logic
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── INSTALLATION.md         # Detailed setup instructions
├── CHANGELOG.md            # Version history
└── docs/                   # Documentation assets
    └── screenshot.png      # Application preview
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📊 Roadmap

### Version 2.1.0 (Planned)
- [ ] Real-time exchange rate API integration
- [ ] Advanced filtering options
- [ ] Custom date ranges
- [ ] Transaction categories management

### Version 2.2.0 (Future)
- [ ] Backend integration options
- [ ] Cloud data synchronization
- [ ] Advanced analytics dashboard
- [ ] Mobile app (PWA)

## 🐛 Known Issues

- Exchange rates are currently static (manual update only)
- Large datasets (1000+ transactions) may experience slight performance degradation
- Import functionality requires specific JSON format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- The open-source community for inspiration

## 📞 Support

- 🐛 [Report a Bug](https://github.com/AegisX-dev/Expense-Tracker/issues)
- 💡 [Request a Feature](https://github.com/AegisX-dev/Expense-Tracker/issues)
- 📧 [Contact Developer](mailto:your-email@example.com)

---

**Made with ❤️ by [AegisX-dev](https://github.com/AegisX-dev)**
