# LockIn.page backend (optional)

This is a minimal license validation backend to automate license checks.

## What it does
- `POST /v1/validate` validates a license key and enforces **one license per site** by binding it to the request `Origin` domain.

## Run locally
```powershell
Push-Location "c:\Users\Administrator\New folder (2)\server"
npm install
Copy-Item .env.example .env
npm start
```

Backend runs on `http://localhost:8787` by default.

## Issue a license (manual activation)
```powershell
Push-Location "c:\Users\Administrator\New folder (2)\server"
node tools\issue-license.js --email buyer@email.com
```

Optional:
- `--status ACTIVE|INACTIVE`
- `--domain example.com` (pre-binds the license)

## API
### POST /v1/validate
Request:
```json
{ "license": "LIC-7K2M-4R9Q" }
```

Notes:
- The backend reads `Origin` from the request headers to bind/enforce the domain.
