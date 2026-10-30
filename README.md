# Motora — Car Maintenance Frontend

A responsive React + Vite app for the `KennySmart1234/car_maintenance_system` FastAPI backend. It has two areas, chosen automatically from the `role` in the login token:

- **Customer portal** (`/app`): vehicles, maintenance requests, additional-service approval, Paystack payments.
- **Workshop admin console** (`/admin`): a live dashboard of every customer's requests (shared by all admins, shows who accepted each one; needs the backend patch in `docs/`), accept/inspect/progress requests, add standard or additional services, verify vehicles, record cash/card/transfer payments, review Paystack transactions, add admins, retry failed emails.

Also: email verification, forgot/reset password.

## Requirements

- Node.js 20.19+ or 22.12+ recommended for Vite 6.
- The FastAPI backend running and configured with its database and environment variables.

## Run locally

```bash
cd frontend
cp .env.example .env
# Edit .env if your backend is not running at http://127.0.0.1:8000
npm install
npm run dev
```

Open the local URL printed by Vite. To test the production bundle:

```bash
npm run build
npm run preview
```

## Environment

`VITE_API_BASE_URL` is the backend origin only, without a route suffix. Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For production, set it to the deployed FastAPI origin. Any value prefixed with `VITE_` is exposed to browser code. Do not put database credentials, JWT signing secrets, or Paystack secret keys here.

## Backend CORS

The backend allows `http://localhost:5173`, `http://127.0.0.1:5173` and `https://motora-gamma.vercel.app`. Add your origin in `main.py` if you deploy elsewhere.

## Backend settings that must match this app

- `FRONTEND_BASE_URL` must be this app's origin: the verification and password-reset emails link to `/verify-email?token=` and `/reset-password?token=`.
- Paystack return URL: see `docs/BACKEND_NOTES.md` #1.
- **Admin request list:** apply `docs/backend-admin-dashboard.patch` to the backend and deploy it first; without it the admin dashboard shows a "backend update needed" message.

## Endpoints and known gaps

- Full endpoint map: `docs/API_INTEGRATION.md`
- Backend issues and suggested fixes: `docs/BACKEND_NOTES.md`

## Deployment

Deploy this folder as a Vite static site (for example, Vercel). Set `VITE_API_BASE_URL` in the hosting provider's environment variables. Add an SPA rewrite so direct navigation to paths such as `/app/requests/<id>` returns `index.html`. Then configure backend CORS to allow the deployed frontend origin.

## Security notes

- Paystack secret key is never used in the frontend.
- Payments are initialized by the backend; the browser redirects to the backend-provided authorization URL.
- The role in the JWT only chooses which screens to show; every permission is enforced by the backend.
- Payment status is only displayed after calling the backend callback verification endpoint. A URL query parameter alone is not treated as proof of payment.
- JWT is stored in `localStorage` to match the existing bearer-token API. For higher security, consider an HTTP-only cookie session in a future coordinated backend/frontend change.
