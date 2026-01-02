# Quick Start Guide

Get started with LockIn in 60 seconds!

## Step 1: Host the Script

Upload `lockin.min.js` to your web server or CDN.

## Step 2: Add to Your Page

Add this one line to your HTML, just before the closing `</body>` tag:

```html
<script src="https://your-server.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="YOUR_PASSWORD"></script>
```

## Step 3: Configure

Replace these values:
- `YOUR_LICENSE_KEY` - Your unique license key (required)
- `YOUR_PASSWORD` - The password users must enter (required)

## Step 4: Done!

Your page is now protected. Visitors must enter the password to access the content.

---

## Customize (Optional)

Add these optional attributes to customize the experience:

```html
<script src="https://your-server.com/lockin.min.js" 
        data-lockin-key="YOUR_LICENSE_KEY"
        data-lockin-password="YOUR_PASSWORD"
        data-lockin-title="Members Only"
        data-lockin-message="Enter your member password"
        data-lockin-branding="hide"></script>
```

**Available Options:**
- `data-lockin-title` - Change the modal title
- `data-lockin-message` - Customize the message
- `data-lockin-placeholder` - Change input placeholder
- `data-lockin-submit` - Change button text
- `data-lockin-branding="hide"` - Remove "Protected by LockIn"
- `data-lockin-max-attempts="5"` - Limit password attempts

---

## Test Locally

1. Open `demo.html` in your browser
2. Password: `demo123`
3. See it in action!

---

## Need Help?

- 📖 Full docs: See [README.md](README.md)
- 💡 Examples: See [examples.html](examples.html)
- 🐛 Issues: [GitHub Issues](https://github.com/ReceiptX/lockin-page/issues)

---

## Security Note

⚠️ **Important**: LockIn is a client-side solution. It's perfect for:
- Adding a barrier to casual visitors
- Protecting preview/staging sites
- Sharing content with trusted groups

**Do NOT use** for truly sensitive data. Always use server-side authentication for critical applications.
