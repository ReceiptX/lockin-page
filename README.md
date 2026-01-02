# LockIn.page

Client-side page access gating script (static) + optional license validation backend.

## GitHub Pages (recommended for the frontend)

1. GitHub repo → **Settings** → **Pages**
2. **Build and deployment**: Deploy from a branch
3. Branch: `main` (or `master`), Folder: `/ (root)`

Your site will be:
- `https://<your-user>.github.io/<your-repo>/`

This repo serves:
- Script: `https://<your-user>.github.io/<your-repo>/lockin.js`
- Demo: `https://<your-user>.github.io/<your-repo>/demo/`

## Install (no backend)

```html
<script
  src="https://<your-user>.github.io/<your-repo>/lockin.js"
  data-license="YOUR_LICENSE_KEY"
  data-password="YOUR_PASSWORD">
</script>
```

## Optional backend (Vercel + Postgres)

This repo includes Vercel Serverless Functions under `api/`.

Important: the old SQLite backend in `server/` is for local/dev only. Vercel needs a real database.

### Deploy

1. Create a new Vercel project from this repo
2. Connect **Vercel Postgres** (Storage tab). This automatically injects `POSTGRES_URL` (and related vars) into your project.
3. Add env vars:
  - `DATABASE_URL` (optional if you connected Vercel Postgres; otherwise required)
   - `CORS_ALLOW_ORIGIN` (recommended: your GitHub Pages origin, e.g. `https://<your-user>.github.io`)
   - `AUTO_BIND_DOMAIN` (optional, default `true`)
   - `RATE_LIMIT_WINDOW_MS` (optional, default `60000`)
   - `RATE_LIMIT_MAX` (optional, default `120`)

Important: Vercel **Deployment Protection** must be disabled for Production if you want buyers' browsers to call your API.

Endpoints (via `vercel.json` rewrites):
- `GET /health`
- `POST /v1/validate` with JSON `{ "license": "LIC-XXXX-XXXX" }`

### Use backend from the script

```html
<script
  src="https://<your-user>.github.io/<your-repo>/lockin.js"
  data-endpoint="https://<your-backend>.vercel.app"
  data-license="YOUR_LICENSE_KEY"
  data-password="YOUR_PASSWORD">
</script>
```

### Issue a license (Postgres)

Run locally (needs `DATABASE_URL` or `POSTGRES_URL` set):

```powershell
Push-Location "c:\\Users\\Administrator\\lockin-page"
npm install
$env:DATABASE_URL = "postgres://..."  # or: $env:POSTGRES_URL = "postgres://..."
npm run issue:pg -- --email buyer@email.com
```

Support: receiptx86@gmail.com

## License

This project is not open source. See `LICENSE` (All rights reserved).

