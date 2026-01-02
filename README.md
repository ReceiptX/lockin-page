# 🔒 LockIn - Client-Side Page Access Control

> Production-ready SaaS JavaScript script to lock any webpage with a password-protected modal overlay.

[![License: Commercial](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)](package.json)

## Overview

**LockIn** is a lightweight, production-ready JavaScript solution that protects webpage content with a password-protected modal overlay. It requires zero server-side code and integrates with a single `<script>` tag.

Perfect for:
- Private content pages
- Beta testing environments
- Exclusive member areas
- Client preview pages
- Development/staging environments
- Password-protected landing pages

## Features

✅ **Single Script Tag Integration** - Drop in and go  
✅ **Zero Dependencies** - Pure vanilla JavaScript  
✅ **No Server Required** - Fully client-side  
✅ **Configurable** - Customize via data attributes  
✅ **Session-Based Auth** - Users stay authenticated during session  
✅ **Mobile Responsive** - Works perfectly on all devices  
✅ **Modern Design** - Beautiful, professional UI  
✅ **Smooth Animations** - Polished user experience  
✅ **XSS Protection** - Built-in HTML escaping  
✅ **Optional Branding** - Hide or show "Powered by" text  
✅ **Production Ready** - Clean, minified, optimized code

## Quick Start

### Basic Usage

Add the script to any webpage with two required attributes:

```html
<script src="https://your-cdn.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="YOUR_PASSWORD"></script>
```

That's it! Your page is now protected.

### With Custom Options

```html
<script src="https://your-cdn.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="YOUR_PASSWORD"
        data-lockin-title="Members Only"
        data-lockin-message="Please enter your access code to continue"
        data-lockin-placeholder="Access code"
        data-lockin-submit="Enter"
        data-lockin-branding="hide"></script>
```

## Configuration

All configuration is done via `data-*` attributes on the script tag.

### Required Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-lockin-key` | Your license key (required for validation) | `"DEMO-LICENSE-KEY-12345"` |
| `data-lockin-password` | The password to unlock the page | `"mysecretpass"` |

### Optional Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-lockin-title` | Modal title text | `"Access Required"` |
| `data-lockin-message` | Message shown to users | `"Please enter the password to continue"` |
| `data-lockin-placeholder` | Input placeholder text | `"Enter password"` |
| `data-lockin-submit` | Submit button text | `"Submit"` |
| `data-lockin-error` | Error message for wrong password | `"Incorrect password. Please try again."` |
| `data-lockin-branding` | Show branding footer (`hide` to remove) | `show` |
| `data-lockin-max-attempts` | Maximum password attempts (0 = unlimited) | `0` |

## Examples

### Example 1: Basic Protection

```html
<!DOCTYPE html>
<html>
<head>
    <title>Protected Page</title>
</head>
<body>
    <h1>Private Content</h1>
    <p>This content is protected.</p>
    
    <script src="https://your-cdn.com/lockin.min.js" 
            data-lockin-key="YOUR_LICENSE_KEY"
            data-lockin-password="secret123"></script>
</body>
</html>
```

### Example 2: Custom Branding

```html
<script src="https://your-cdn.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="vip2024"
        data-lockin-title="VIP Access Required"
        data-lockin-message="This content is exclusive to VIP members"
        data-lockin-branding="hide"></script>
```

### Example 3: Limited Attempts

```html
<script src="https://your-cdn.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="beta123"
        data-lockin-max-attempts="3"
        data-lockin-error="Invalid code. Please check your invitation email."></script>
```

## Demo

A live demo is included in this repository:

1. Clone the repository
2. Open `demo.html` in your browser
3. Use password: `demo123`

```bash
git clone https://github.com/ReceiptX/lockin-page.git
cd lockin-page
open demo.html
```

## How It Works

1. **Page Load**: Script executes immediately and checks for existing authentication
2. **Authentication Check**: Verifies if user has valid session storage entry
3. **Lock Display**: If not authenticated, shows modal overlay blocking all content
4. **Password Entry**: User enters password and submits
5. **Validation**: Password is verified client-side
6. **Unlock**: On success, modal is removed and session is saved
7. **Session Persistence**: User remains authenticated for browser session

### Security Notes

⚠️ **Important**: This is a **client-side** solution. It provides a barrier to casual access but is NOT a replacement for server-side security.

**Use LockIn for:**
- Convenience barriers
- Deterring casual visitors
- Sharing content with trusted groups
- Adding friction to access

**DO NOT use LockIn for:**
- Protecting truly sensitive data
- Preventing determined attackers
- Compliance-required security
- Financial or personal information

For secure content protection, always use proper server-side authentication.

## Building

### Development

The main source file is `lockin.js`. Edit this file for development.

### Production Build

Generate the minified production version:

```bash
npm install
npm run build
```

This creates `lockin.min.js` (7.6KB minified).

## Files

- `lockin.js` - Main source file (readable, commented)
- `lockin.min.js` - Production build (minified, optimized)
- `demo.html` - Interactive demonstration page
- `package.json` - Build configuration
- `README.md` - This file

## Browser Compatibility

LockIn works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Uses:
- ES6+ JavaScript (arrow functions, const/let, template literals)
- SessionStorage API
- DOM manipulation

## API Reference

### Session Storage

LockIn uses `sessionStorage` to persist authentication:

```javascript
// Check authentication manually
const isAuth = sessionStorage.getItem('lockin_auth');

// Clear authentication (force re-lock)
sessionStorage.removeItem('lockin_auth');

// Full page reset
sessionStorage.clear();
location.reload();
```

### Events

The script automatically:
- Blocks page scroll when locked
- Restores scroll when unlocked
- Focuses password input on load
- Handles form submission
- Displays error messages with shake animation

## Deployment

### CDN Hosting (Recommended)

1. Upload `lockin.min.js` to your CDN
2. Reference it in your HTML:
   ```html
   <script src="https://cdn.yoursite.com/lockin.min.js" ...></script>
   ```

### Self-Hosted

1. Copy `lockin.min.js` to your web server
2. Reference it with a relative or absolute path:
   ```html
   <script src="/js/lockin.min.js" ...></script>
   ```

### Version Management

Include version in filename for cache busting:
```html
<script src="https://cdn.yoursite.com/lockin-1.0.0.min.js" ...></script>
```

## Troubleshooting

### Modal doesn't appear
- Check browser console for errors
- Verify `data-lockin-key` and `data-lockin-password` are set
- Ensure script is loaded before closing `</body>` tag

### Password not working
- Check for typos in `data-lockin-password`
- Password is case-sensitive
- Clear sessionStorage: `sessionStorage.clear()`

### Content visible briefly before lock
- Place script tag early in `<body>`
- This is normal browser behavior; content loads before JavaScript executes
- For production, consider server-side rendering or SSR

### Styling conflicts
- LockIn uses inline styles with high specificity
- Modal uses `z-index: 2147483647` (maximum value)
- All IDs are prefixed with `lockin-`

## License

This is a **commercial product**. See LICENSE file for terms.

## Support

For support, licensing, or commercial inquiries:
- GitHub Issues: [https://github.com/ReceiptX/lockin-page/issues](https://github.com/ReceiptX/lockin-page/issues)
- Repository: [https://github.com/ReceiptX/lockin-page](https://github.com/ReceiptX/lockin-page)

## Changelog

### Version 1.0.0 (2026-01-02)
- Initial release
- Core locking functionality
- Configurable modal UI
- Session-based authentication
- Optional branding
- Password attempt limiting
- Production-ready minified build

---

Made with ❤️ for the web development community
