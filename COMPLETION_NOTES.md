# Motora frontend completion notes

## What changed
- Replaced calls to backend routes that do not exist with the routes present in the supplied FastAPI backend.
- Authentication now reads the signed JWT claims (`sub`, `role`, `exp`) because the backend does not provide `/auth/me`.
- Added email verification, forgot-password, and reset-password screens and wired them to the backend auth routes.
- Added customer vehicle registration and a useful empty-garage state.
- Added the missing admin maintenance request workbench route.
- Added admin request actions for accept, inspect, status changes, next-service date, and adding standard/additional services.
- Reworked payment review to use `/admin/payment-transactions` and its resolve action.
- Reworked admin overview, customer directory, vehicle directory, and reports to use the available admin maintenance-request endpoint. CSV export is available for request records.
- Customer payment balances are assembled from the existing car maintenance-history endpoint rather than a nonexistent payment-summary endpoint.
- Improved API network error messages and stopped automatically deleting a token for every 401 response inside the generic request helper.

## Backend gaps that remain
The supplied backend currently does not expose:
- `GET /auth/me` or a customer profile endpoint.
- Admin aggregate dashboard, customer directory, vehicle directory, or financial reports endpoints.
- A customer endpoint listing all maintenance requests independently of vehicle history.
- A customer endpoint to reject an additional service (approval is implemented; rejection is not).
- A way for the frontend to upload a local image file; admin image creation currently accepts an `image_url`.
- A detailed admin request response containing services, images, payments, and approval totals. The current admin detail screen uses the available request detail endpoint and available admin actions.

The frontend does not fake these missing backend capabilities. The affected directory/report screens are derived from requests returned by the backend, so they only include customers and vehicles associated with a maintenance request.

## Verification
- TypeScript project check (`tsc -b`) passed.
- Vite production build passed.
- The production bundle was generated successfully using the dependencies included in the supplied frontend archive.

## Setup
1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to your deployed FastAPI base URL.
3. Run `npm install`.
4. Run `npm run build`.
5. Deploy the `dist` directory.

The original `.env` file was intentionally excluded from this delivery to avoid sharing environment secrets.
