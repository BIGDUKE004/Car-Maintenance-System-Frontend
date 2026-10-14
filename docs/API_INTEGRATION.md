# API integration map

Source checked: `KennySmart1234/car_maintenance_system` `main` branch files `main.py`, `app/routers/auth_router.py`, `customer_router.py`, `maintenance_request_router.py`, `payment_router.py`, `app/schemas/user_schema.py`, `car_schema.py`, `maintenance_request_schema.py`, `payment_schema.py`, and `app/services/paystack_payment_service.py`.

| Capability | API call | Authentication | UI consumer |
|---|---|---|---|
| Register | `POST /auth/register` | Public | `/register` |
| Login | `POST /auth/login` | Public | `/login` |
| Email verification | `GET /auth/verify-email?token=...` | Public | `/verify-email` |
| List registered cars | `GET /customer/cars` | Bearer token | Dashboard, Vehicles, Requests |
| Add car | `POST /customer/cars` | Bearer token | Vehicles form |
| Change car color | `PATCH /customer/cars/{car_id}/color` | Bearer token | Vehicles card |
| Create request | `POST /customer/maintenance-requests` | Bearer token | Requests form |
| Car maintenance history | `GET /customer/cars/{car_id}/maintenance-history` | Bearer token | Dashboard and Requests |
| Request details | `GET /maintenance-requests/{request_id}` | Bearer token | Request Details |
| Cancel request | `PATCH /maintenance-requests/{request_id}/cancel` | Bearer token | Requests list |
| List request services | `GET /customer/maintenance-services/{request_id}` | Bearer token | Request Details |
| Approve additional service | `PATCH /customer/maintenance-services/{service_id}/approve` | Bearer token | Request Details |
| Total cost / balance | `GET /maintenance-requests/{request_id}/total-cost`, `/balance` | Bearer token | Request Details |
| Initialize Paystack | `POST /payments/paystack/initialize` | Bearer token | Request Details payment action |
| Verify Paystack transaction | `GET /payments/paystack/callback?reference=...` | Public; backend verifies with Paystack | Payment result route |

FastAPI validation errors are translated by the shared Axios error helper. The backend uses `{detail: ...}` for application exceptions, while validation failures may return a list of field errors.

## Not implemented because no matching customer endpoint was found

- Global public service catalog.
- Dedicated all-requests endpoint.
- Customer payment history endpoint.
- Vehicle deletion/editing beyond the existing color update endpoint.
- Frontend redirect from the backend Paystack callback JSON response to `/payments/result`.

These are documented dependencies, not mocked features.
