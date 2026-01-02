# LockIn.page — Seller Kit

This repo is where the script lives.

## 1) What you send buyers

### Hosted script URL
`https://receiptx.github.io/lockin-page/lockin.js`

### Price
$49 one-time license

### Install snippet (copy/paste)
```html
<script
  src="https://receiptx.github.io/lockin-page/lockin.js"
  data-endpoint="https://YOUR_BACKEND_URL"
  data-license="YOUR_LICENSE_KEY"
  data-password="YOUR_PASSWORD"
  data-text="Optional custom message">
</script>
```

## 2) Seller DM script (copy/paste)

Hey — quick heads up: your content page is public.
I built a 5-minute lock you can add without changing platforms.
Want me to show you?

## 3) Buyer delivery email (copy/paste)

Subject: Your LockIn.page access

Hi {{NAME}},

Here’s your install snippet. Paste it onto the page you want to lock.

```html
<script
  src="https://receiptx.github.io/lockin-page/lockin.js"
  data-endpoint="{{BACKEND_URL}}"
  data-license="{{LICENSE_KEY}}"
  data-password="{{PASSWORD}}"
  data-text="{{OPTIONAL_TEXT}}">
</script>
```

Notes
- Requires a valid license
- Intended for lightweight access control
- Not a replacement for server-side authentication

Support
Contact: receiptx86@gmail.com

## 4) License issuing process (manual)

### What info the seller must collect
- Buyer email
- The page URL they want to lock
- The password they want to use
- Optional custom text (or leave blank)

### License key format
Use something like:
- `LIC-XXXX-XXXX` (letters/numbers)

### Where to track it
Google Sheet columns:
- License | Status | Email

Example:
- `LIC-7K2M-4R9Q` | `ACTIVE` | `buyer@email.com`

### How activation works right now
- The script supports an upgrade point for manual license allowlisting (`ACTIVE_LICENSES` in `lockin.js`).
- If the allowlist is empty, it runs in honor-mode (no enforcement).

## 5) Seller handoff checklist

- [ ] Confirm payment received
- [ ] Collect buyer info (email + page URL + password)
- [ ] Request/issue a license key
- [ ] Add license to the sheet
- [ ] Send buyer the install email
