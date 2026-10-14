# Motora — Car Maintenance Frontend

A responsive React + Vite customer portal for the `KennySmart1234/car_maintenance_system` FastAPI backend. It includes a public landing page, registration/login, vehicle registration, maintenance requests/history, request details, service approvals where supported, and Paystack initialization/verification through the existing API.

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

The current backend `main.py` includes the routers but does not show CORS middleware in the inspected file. When the frontend runs on a different origin, configure FastAPI CORS for the exact frontend origin, including the local Vite origin and deployed frontend origin. Do not use wildcard origins together with credentials.

## Current integration map

The endpoint paths and payloads below were checked against the repository's `main` branch source at implementation time. Run the backend and verify against `/docs` before production use.

| Feature | Method + path | Request / response used |
|---|---|---|
| Register | `POST /auth/register` | `{first_name,last_name,email,password,phone}`; response `{message}`. Backend asks the user to verify email. |
| Login | `POST /auth/login` | `{email,password}`; response `{access_token,token_type}`. Token is attached as `Authorization: Bearer ...`. |
| Verify email | `GET /auth/verify-email?token=...` | Response `{message}`. |
| List cars | `GET /customer/cars` | Authenticated; expects a list of car records. |
| Add car | `POST /customer/cars` | `{make,model,year,color,plate_number,vin}`. |
| Update car color | `PATCH /customer/cars/{car_id}/color` | `{color}`. |
| Create maintenance request | `POST /customer/maintenance-requests` | `{car_id,description,request_date}`; request date is sent as an ISO datetime with timezone. |
| Car maintenance history | `GET /customer/cars/{car_id}/maintenance-history` | Authenticated; response includes requests, service history, payment summary and car details. |
| Services for a request | `GET /customer/maintenance-services/{request_id}` | Authenticated; service list. |
| Approve additional service | `PATCH /customer/maintenance-services/{service_id}/approve` | Authenticated; backend decides whether the service can be approved. |
| Get request | `GET /maintenance-requests/{request_id}` | Authenticated; maintenance request record. |
| Cancel request | `PATCH /maintenance-requests/{request_id}/cancel` | Authenticated; backend applies business rules. |
| Total cost | `GET /maintenance-requests/{request_id}/total-cost` | Response `{total_cost}`. |
| Balance | `GET /maintenance-requests/{request_id}/balance` | Response `{balance}`. |
| Initialize Paystack | `POST /payments/paystack/initialize` | `{maintenance_service_id,amount?}`; response `{authorization_url,reference}`. The UI omits amount so the backend uses its authoritative outstanding amount. |
| Verify Paystack callback | `GET /payments/paystack/callback?reference=...` | Public endpoint verifies with Paystack and responds with `{status,reference,message}`. |

## Known backend gaps / dependencies

1. There is no customer endpoint in the inspected routers to list all maintenance requests independently. The UI aggregates history from each car's maintenance-history endpoint.
2. There is no public endpoint to browse all maintenance service offerings. Services are shown after a maintenance request has been created and the workshop has attached services.
3. The inspected backend's Paystack service sets the Paystack callback URL to `settings.app_base_url + "/payments/paystack/callback"`. That callback verifies the payment but returns JSON from the backend. For the user to land on the polished frontend result page, the backend payment callback configuration must be adjusted to return/redirect to the frontend with the reference, or the callback route must otherwise forward the browser. This project does not modify backend code or pretend that the frontend callback is automatically wired.
4. The inspected `main.py` does not show CORS middleware. Configure CORS in the backend for the frontend's origin if not already added elsewhere.
5. The UI's dashboard summaries are derived from returned vehicle history; it does not fabricate request, service, payment, or cost records.
6. Admin-only functions are not exposed in this customer portal. Admin authorization remains a backend responsibility.

## Deployment

Deploy this folder as a Vite static site (for example, Vercel). Set `VITE_API_BASE_URL` in the hosting provider's environment variables. Add an SPA rewrite so direct navigation to paths such as `/app/requests/<id>` returns `index.html`. Then configure backend CORS to allow the deployed frontend origin.

## Security notes

- Paystack secret key is never used in the frontend.
- Payments are initialized by the backend; the browser redirects to the backend-provided authorization URL.
- Payment status is only displayed after calling the backend callback verification endpoint. A URL query parameter alone is not treated as proof of payment.
- JWT is stored in `localStorage` to match the existing bearer-token API. For higher security, consider an HTTP-only cookie session in a future coordinated backend/frontend change.
