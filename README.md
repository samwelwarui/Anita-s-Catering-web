# Anita Catering

A responsive catering-business website with a Node.js/Express API, persistent SQLite storage, password-protected admin dashboard, inquiry management, and moderated customer reviews. The project uses separate HTML, CSS, JavaScript, SQL, and configuration files.

## Requirements

- Node.js 20 or newer and npm
- A modern browser
- No paid services or external database account required

## Project structure

```text
Anita-Catering/
├── frontend/                 # Public website (serve on localhost:5501)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/{images,videos,icons}/
├── admin/                    # Private team dashboard
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── backend/                  # Express REST API + SQLite
│   ├── server.js
│   ├── routes/                # auth, inquiries, reviews
│   ├── controllers/           # request handling
│   ├── database/              # SQLite schema and connection
│   ├── middleware/            # authentication and CSRF checks
│   ├── utils/                 # validation and sanitization
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Installation and local startup

### Complete Windows setup: copy and paste

Open the `Anita-Catering` folder in VS Code, open **Terminal > New Terminal**, then copy and paste this entire block into PowerShell:

```powershell
# Run this while VS Code has the Anita-Catering folder open.
$project = (Get-Location).Path

if (-not (Test-Path (Join-Path $project "backend\package.json"))) {
    throw "Anita-Catering was not found. Open the Anita-Catering folder in VS Code and try again."
}

$nodeVersion = node --version
Write-Host "Using Node.js $nodeVersion"

# Create the backend environment file.
$envFile = Join-Path $project "backend\.env"
$envExample = Join-Path $project "backend\.env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
}

# Generate secure values only when example placeholder values are still present.
$envContent = Get-Content $envFile -Raw

if ($envContent -match 'SESSION_SECRET=replace-with-a-long-random-secret-at-least-32-characters') {
    $secretBytes = New-Object byte[] 48
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
    $sessionSecret = [Convert]::ToBase64String($secretBytes).Replace("/", "").Replace("+", "").Substring(0, 48)
    $envContent = $envContent -replace 'SESSION_SECRET=.*', "SESSION_SECRET=$sessionSecret"
}

if ($envContent -match 'ADMIN_PASSWORD=replace-this-with-a-strong-password') {
    $passwordBytes = New-Object byte[] 18
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($passwordBytes)
    $adminPassword = [Convert]::ToBase64String($passwordBytes).Replace("/", "").Replace("+", "").Substring(0, 18)
    $envContent = $envContent -replace 'ADMIN_PASSWORD=.*', "ADMIN_PASSWORD=$adminPassword"
}

$envContent = $envContent -replace 'FRONTEND_ORIGIN=.*', 'FRONTEND_ORIGIN=http://localhost:5501'
Set-Content -Path $envFile -Value $envContent -Encoding UTF8

# Install backend dependencies and start the API.
Set-Location $project
npm --prefix backend install
Start-Process powershell -ArgumentList '-NoExit', '-NoProfile', '-Command', "Set-Location '$project'; npm --prefix backend start"

# Start the public website and admin dashboard.
Start-Process powershell -ArgumentList '-NoExit', '-NoProfile', '-Command', "Set-Location '$project'; npx --yes http-server . -p 5501 -c-1"

Write-Host ""
Write-Host "The project is starting."
Write-Host "Public website: http://localhost:5501/frontend/"
Write-Host "Admin dashboard: http://localhost:5501/admin/"
Write-Host "API health: http://localhost:3000/api/health"
Write-Host ""

Start-Sleep -Seconds 5
Start-Process "http://localhost:5501/frontend/"
```

The setup also creates `backend/.env`, a secure session secret, and a random admin password on first run. To view the generated username and password, open `backend/.env`. The website must be opened through HTTP rather than by double-clicking `frontend/index.html`.

The SQLite database and session store are created automatically under `backend/data/`. They persist across server restarts and are intentionally excluded from the ZIP until runtime.

## Admin dashboard

Visit `http://localhost:5501/admin/` when serving the project root. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `backend/.env`. The dashboard provides enquiry counts, search, status filters, detail view, click-to-call/email links, status changes and deletion. The Customer Reviews tab supports rating/status filters, approval, rejection and deletion. Only approved reviews are returned by the public API.

## API reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API health |
| GET | `/api/auth/csrf` | Public | Create a CSRF token |
| POST | `/api/auth/login` | Public | Admin sign-in |
| GET | `/api/auth/me` | Session | Current admin session |
| POST | `/api/auth/logout` | Admin + CSRF | Sign out |
| POST | `/api/inquiries` | Public, rate-limited | Submit catering enquiry |
| GET | `/api/inquiries` | Admin | Search/paginate enquiries (`q`, `status`, `page`) |
| GET | `/api/inquiries/stats` | Admin | Dashboard totals |
| GET | `/api/inquiries/:id` | Admin | View full enquiry |
| PATCH | `/api/inquiries/:id` | Admin + CSRF | Change status (`Pending`, `Confirmed`, `Rejected`) |
| DELETE | `/api/inquiries/:id` | Admin + CSRF | Delete enquiry |
| POST | `/api/reviews` | Public, rate-limited | Submit review (starts Pending) |
| GET | `/api/reviews` | Public | Approved reviews, average and count (`page`) |
| GET | `/api/reviews/admin` | Admin | All reviews (`status`, `rating`) |
| GET | `/api/reviews/:id` | Admin | Retrieve one review |
| PATCH | `/api/reviews/:id` | Admin + CSRF | Set review status (`Pending`, `Approved`, `Rejected`) |
| DELETE | `/api/reviews/:id` | Admin + CSRF | Delete review |

Admin mutation requests require the session cookie and `x-csrf-token` header. The dashboard obtains the token after login. Customer review averages are calculated on the server from approved SQLite rows only; public submissions cannot set their own approval status or influence the public average before approval.

## Customisation

- **Brand colours and layout:** edit `frontend/styles.css`; the requested five brand colours are declared as CSS variables near the top.
- **Business contacts:** edit the `BUSINESS` object in `frontend/script.js`, and the footer placeholders in `frontend/index.html`. Replace example email, phone, location and social links with verified business details.
- **WhatsApp:** set `BUSINESS.whatsapp` to the international-format number without `+`, spaces or punctuation. Change the greeting as desired.
- **Photos:** replace SVG artwork in `frontend/assets/images/` with compressed WebP/AVIF/JPEG images. Update image paths and alt text in `frontend/index.html`. The bundled event artwork and short video clips are illustrative stand-ins, not real client events. Replace them with Anita Catering photography and footage (with permission) before launch.
- **Event videos:** add MP4 files in `frontend/assets/videos/` and update `VIDEO_ASSETS` in `frontend/script.js`. The page does not autoplay videos; it loads the selected video on demand. The included SVG poster is a fallback.
- **Menu:** edit the menu cards in `frontend/index.html`. Prices are intentionally omitted until the business supplies actual pricing. Verify ingredients, dietary suitability and allergen handling before making claims.
- **API origin:** update `API_BASE` in `frontend/script.js` and `admin/script.js` if the backend moves. Update `FRONTEND_ORIGIN` in `backend/.env` to the exact origin serving the site.

## Security notes before deployment

This is a local-development-ready foundation. Before exposing it publicly, use HTTPS, a strong unique session secret and admin password, set `NODE_ENV=production`, set an exact allowed frontend origin, review backup/retention procedures, and configure secure cookies behind your HTTPS reverse proxy. The API uses Helmet, strict JSON body size, parameterized SQLite statements, server-side Zod validation/sanitization, rate limits on public submissions and login attempts, bcrypt password hashing, SQLite-backed sessions, session authentication and a synchronizer CSRF token for admin mutations. CORS is not an authentication mechanism. Consider adding email verification, CAPTCHA/anti-bot controls, audit logs, automated backups and a managed deployment process for a public production launch.

## Testing

Run the API's Node test runner with `npm --prefix backend test` (currently no automated test suite is bundled). Manually verify the full flow: submit an enquiry, sign into admin, update/delete it; submit a review, confirm it is absent from public reviews, approve it in admin, and confirm it appears with the updated average. The ZIP has been checked for expected files and archive integrity. Do not treat a successful archive check as proof of live browser/device testing.

## Troubleshooting

- **Frontend cannot connect:** ensure the API is running on port 3000 and `API_BASE` points to it.
- **CORS error:** ensure the browser origin exactly matches `FRONTEND_ORIGIN` including scheme and port.
- **Admin login fails:** check `.env` credentials and restart the API. If the username already exists, the bootstrap process intentionally does not reset its password.
- **Native SQLite install issue:** use a supported Node.js LTS release and install the build tools required by `better-sqlite3` for your OS.
- **No videos:** add MP4 assets at the paths in `VIDEO_ASSETS`; thumbnails still display if clips are not installed.
