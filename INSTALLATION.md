# 📥 Installation Guide - Expense Tracker Pro

This guide will help you get Expense Tracker Pro up and running on your system. The application is designed to work in multiple environments, from simple file hosting to advanced deployment scenarios.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Setup](#advanced-setup)
- [Deployment Options](#deployment-options)

## ⚡ Quick Start

The fastest way to get started:

1. **Download the project**
   ```bash
   git clone https://github.com/AegisX-dev/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Open in browser**
   - Double-click `index.html`, or
   - Open `index.html` in your preferred web browser

3. **Start tracking!**
   - The application will work immediately with default settings
   - Data is stored locally in your browser

## 🖥️ System Requirements

### Minimum Requirements

**Browser Support:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Operating Systems:**
- Windows 10/11
- macOS 10.15+
- Linux (any modern distribution)
- iOS 14+ (Safari)
- Android 8+ (Chrome)

**Storage:**
- 5MB available disk space
- LocalStorage enabled in browser

### Recommended Environment

- **Browser**: Chrome or Edge (latest version)
- **Screen Resolution**: 1280x720 or higher
- **Internet Connection**: For currency exchange rates (optional)
- **RAM**: 512MB available (for smooth operation)

## 🛠️ Installation Methods

### Method 1: Direct Download (Easiest)

1. **Download ZIP file**
   ```bash
   # Option A: Using wget
   wget https://github.com/AegisX-dev/Expense-Tracker/archive/main.zip
   
   # Option B: Using curl
   curl -L https://github.com/AegisX-dev/Expense-Tracker/archive/main.zip -o expense-tracker.zip
   ```

2. **Extract and open**
   ```bash
   unzip expense-tracker.zip
   cd Expense-Tracker-main
   # Open index.html in your browser
   ```

### Method 2: Git Clone (Recommended for developers)

1. **Clone repository**
   ```bash
   git clone https://github.com/AegisX-dev/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Verify files**
   ```bash
   ls -la
   # Should see: index.html, script.js, styles.css, README.md
   ```

### Method 3: Local Web Server (Best experience)

For optimal performance, run with a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Open http://localhost:8000
```

**Using Node.js:**
```bash
# Install serve globally
npm install -g serve

# Serve the application
serve -s . -l 8000

# Open http://localhost:8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

**Using Live Server (VS Code):**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## ⚙️ Configuration

### Initial Setup

No configuration is required for basic usage. The application works out-of-the-box with sensible defaults.

### Customization Options

#### 1. Default Currency
```javascript
// In script.js, around line 50
this.currentCurrency = 'USD'; // Change to your preferred currency
```

#### 2. Theme Preference
```javascript
// In script.js, around line 60
this.currentTheme = 'light'; // Options: 'light' or 'dark'
```

#### 3. Exchange Rate Update Interval
```javascript
// In script.js, around line 70
this.exchangeRateUpdateInterval = 300000; // 5 minutes in milliseconds
```

### Browser Settings

**Enable JavaScript:**
- Essential for application functionality
- Usually enabled by default

**Enable LocalStorage:**
```javascript
// Test if LocalStorage is available
if (typeof Storage !== 'undefined') {
    console.log('LocalStorage is supported');
} else {
    console.log('LocalStorage is not supported');
}
```

**Allow Cross-Origin Requests (for local servers):**
- Chrome: `--disable-web-security --user-data-dir="C:\temp"`
- Firefox: `about:config` → `security.fileuri.strict_origin_policy` → `false`

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Application doesn't load
**Symptoms:** Blank page or loading errors

**Solutions:**
1. Check JavaScript console (F12) for errors
2. Ensure JavaScript is enabled
3. Try a different browser
4. Use a local web server instead of file:// protocol

```bash
# Check if files exist
ls -la index.html script.js styles.css

# Verify file permissions (Linux/Mac)
chmod 644 *.html *.js *.css
```

#### Issue 2: Data not saving
**Symptoms:** Transactions disappear after refresh

**Solutions:**
1. Check LocalStorage availability:
   ```javascript
   console.log(localStorage.getItem('expenseTracker'));
   ```

2. Clear browser cache and try again
3. Check if private/incognito mode is disabled
4. Verify disk space availability

#### Issue 3: Charts not displaying
**Symptoms:** Empty chart areas

**Solutions:**
1. Check Chart.js library loading:
   ```javascript
   console.log(typeof Chart);
   // Should return 'function'
   ```

2. Verify CDN connectivity:
   ```html
   <!-- Check if this loads -->
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.js"></script>
   ```

3. Use local Chart.js file if CDN is blocked

#### Issue 4: Currency conversion not working
**Symptoms:** Amounts don't update when changing currency

**Solutions:**
1. Check exchange rate data:
   ```javascript
   console.log(app.exchangeRates);
   ```

2. Verify internet connection for real-time rates
3. Check browser console for API errors

#### Issue 5: Mobile display issues
**Symptoms:** Layout broken on mobile devices

**Solutions:**
1. Check viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. Test responsive design tools (F12 → Device toolbar)
3. Clear mobile browser cache

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Add to localStorage
localStorage.setItem('debugMode', 'true');

// Or add to script.js temporarily
window.DEBUG = true;
```

### Browser-Specific Issues

**Chrome:**
- Allow file access: `--allow-file-access-from-files`
- Disable CORS: `--disable-web-security`

**Firefox:**
- Allow local files: `about:config` → `security.fileuri.strict_origin_policy` → `false`
- Enable localStorage: `about:config` → `dom.storage.enabled` → `true`

**Safari:**
- Enable Developer menu: Preferences → Advanced → Show Develop menu
- Allow cross-origin requests: Develop → Disable Cross-Origin Restrictions

**Edge:**
- Similar to Chrome settings
- Check SmartScreen filter isn't blocking

## 🚀 Advanced Setup

### Custom Domain Setup

1. **Upload files to web server**
   ```bash
   # Using SCP
   scp -r * user@server:/var/www/expense-tracker/
   
   # Using FTP
   ftp server
   put *.html *.js *.css /public_html/
   ```

2. **Configure web server**

   **Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ index.html [QSA,L]
   
   # Enable GZIP compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
   </IfModule>
   ```

   **Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/expense-tracker;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Docker Setup

Create a Dockerfile:
```dockerfile
FROM nginx:alpine

# Copy application files
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t expense-tracker .
docker run -p 8080:80 expense-tracker
```

### Environment Variables

For advanced configurations, create a `config.js`:
```javascript
window.CONFIG = {
    API_BASE_URL: process.env.API_URL || 'https://api.exchangerate.host',
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'USD',
    DEBUG_MODE: process.env.DEBUG === 'true',
    UPDATE_INTERVAL: parseInt(process.env.UPDATE_INTERVAL) || 300000
};
```

## 🌐 Deployment Options

### Static Hosting Services

#### GitHub Pages
1. Fork the repository
2. Go to Settings → Pages
3. Select source branch (main)
4. Access at `https://username.github.io/Expense-Tracker`

#### Netlify
1. Connect GitHub repository
2. Build command: (none required)
3. Publish directory: `/`
4. Deploy automatically on commits

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### Cloud Platforms

#### AWS S3 + CloudFront
1. Create S3 bucket
2. Enable static website hosting
3. Upload files
4. Configure CloudFront distribution

#### Google Cloud Storage
```bash
gsutil -m cp -r * gs://your-bucket-name/
gsutil web set -m index.html -e 404.html gs://your-bucket-name
```

### CDN Integration

Add CDN headers for better performance:
```html
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="script.js" as="script">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
```

## 📊 Performance Optimization

### Caching Strategy
```html
<!-- Add to <head> for aggressive caching -->
<meta http-equiv="Cache-Control" content="max-age=31536000">
<link rel="manifest" href="manifest.json">
```

### Service Worker (Optional)
Create `sw.js` for offline functionality:
```javascript
const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/index.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});
```

### Bundle Optimization
For production builds:
```bash
# Minify CSS
npm install -g clean-css-cli
cleancss -o styles.min.css styles.css

# Minify JavaScript
npm install -g uglify-js
uglifyjs script.js -o script.min.js -c -m
```

## 🔒 Security Considerations

### Content Security Policy
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;">
```

### HTTPS Configuration
Always use HTTPS in production:
```bash
# Let's Encrypt with Certbot
certbot --nginx -d your-domain.com
```

## 📞 Support

If you encounter issues during installation:

1. **Check the troubleshooting section above**
2. **Search existing issues**: [GitHub Issues](https://github.com/AegisX-dev/Expense-Tracker/issues)
3. **Create a new issue** with:
   - Operating system and version
   - Browser and version
   - Steps to reproduce
   - Error messages or screenshots

## 🎉 Success Verification

After installation, verify everything works:

- [ ] Application loads without errors
- [ ] Can add/edit/delete transactions
- [ ] Charts display correctly
- [ ] Currency conversion works
- [ ] Data persists after browser refresh
- [ ] Theme switching works
- [ ] Mobile responsive design works
- [ ] Export/import functionality works

**Congratulations! 🎊 You've successfully installed Expense Tracker Pro!**

Start by adding your first transaction and exploring the features. Check out the [README.md](README.md) for usage instructions and [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute to the project.

---

*Need help? Don't hesitate to reach out through our support channels!*
