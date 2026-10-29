# API integration map

Source: `KennySmart1234/car_maintenance_system` @ `b87aadb` ("Added Reset password end point"). Every route in `main.py`'s routers is listed below.

Roles: the login JWT carries `role` (`CUSTOMER` or `WORKSHOP_ADMIN`). The frontend reads it only to pick the right area (`/app` vs `/admin`); the backend enforces permissions.

## Auth (public)

| Endpoint | UI |
|---|---|
| `POST /auth/register` | `/register` |
| `POST /auth/login` (rate limited: 5 tries / 15 min) | `/login` → redirects by role |
| `GET /auth/verify-email?token=` | `/verify-email` (auto-runs from the emailed link) |
| `POST /auth/forgot-password` | `/forgot-password` |
| `POST /auth/reset-password` `{token,new_password}` | `/reset-password?token=` (emailed link) |

## Customer (`/app`, Bearer token)

| Endpoint | UI |
|---|---|
| `GET/POST /customer/cars` | Vehicles, Dashboard |
| `PATCH /customer/cars/{id}/color` | Vehicles |
| `POST /customer/maintenance-requests` | Maintenance → New request |
| `GET /customer/cars/{id}/maintenance-history` | Dashboard, Maintenance, per-service payment status on Request details |
| `GET /maintenance-requests/{id}` | Request details |
| `PATCH /maintenance-requests/{id}/cancel` | Maintenance |
| `GET /customer/maintenance-services/{request_id}` | Request details |
| `PATCH /customer/maintenance-services/{id}/approve` | Request details |
| `GET /maintenance-requests/{id}/total-cost`, `/balance` | Request details |
| `POST /payments/paystack/initialize` | Request details → Pay |
| `GET /payments/paystack/callback?reference=` | `/payments/result` |
| `POST /payments/paystack/webhook` | Server-to-server from Paystack. No UI. |

## Workshop admin (`/admin`, `require_admin`)

| Endpoint | UI |
|---|---|
| `PATCH /admin/maintenance-requests/{id}/accept` | Request → workflow |
| `PATCH /admin/maintenance-requests/{id}/inspect` | Request → workflow |
| `PATCH /maintenance-requests/{id}/status` `{status}` | Request → workflow (start work, awaiting approval, complete) |
| `PATCH /maintenance-requests/{id}/next-service-date` `{next_service_date}` | Request → details |
| `POST /admin/maintenance-services` | Request → Add service (standard or additional) |
| `GET /admin/verify-vehicle/{car_id}?plate_number=&vin=` | Request → Verify the vehicle |
| `POST /admin/maintenance-images` | Request → Photos |
| `POST /payments/` | Request → Record payment (cash / card / transfer) |
| `GET /admin/payment-transactions?status=` | Payment review |
| `PATCH /admin/payment-transactions/{reference}/resolve` | Payment review |
| `POST /admin/admins` | Workshop tools → Add admin |
| `POST /admin/email-notifications/retry-failed` | Workshop tools |

Admins also pass the ownership checks on the shared read endpoints (request, services, total cost, balance, cancel, car history), which is how the request page loads.

`PATCH /admin/maintenance-requests/{id}/status` and `/admin/.../next-service-date` duplicate the two `/maintenance-requests/...` routes above (query params instead of a JSON body). The UI uses the JSON-body versions.

Status transitions are enforced by the backend: `PENDING → ACCEPTED → INSPECTING → (AWAITING_APPROVAL) → IN_PROGRESS → COMPLETED`. Adding an *additional* service during `INSPECTING` moves the request to `AWAITING_APPROVAL` automatically and emails the customer.

## Not possible with the current API

See `docs/BACKEND_NOTES.md` for details and suggested fixes.

- Listing all requests (admin) or all requests (customer) in one call. The customer UI aggregates per-car history; the admin UI opens requests by ID and remembers recent ones on the device.
- Rejecting an additional service (customer or admin).
- Reading back uploaded photos.
- Redirecting the browser from Paystack to `/payments/result` (needs a one-line backend change).
