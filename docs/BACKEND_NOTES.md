# Backend notes found while integrating

These need changes in the backend repo; the frontend does not work around them silently.

## 1. Paystack returns the customer to a JSON page (one-line fix)
`PaystackPaymentService.start_payment` sets `callback_url=f"{settings.app_base_url}/payments/paystack/callback"`, so after paying, the browser lands on raw backend JSON. The frontend already has `/payments/result`, which reads `?reference=` and calls that same backend endpoint to verify. Point Paystack there:

```python
callback_url=f"{settings.frontend_base_url}/payments/result",
```

## 2. `POST /admin/admins` returns the new user's password hash
The route has no `response_model`, so the full `User` row (including the bcrypt hash) is returned. Add `response_model=UserResponse` (already defined in `user_schema.py`). The frontend ignores the response body.

## 3. Admins couldn't see customer requests (FIXED by `docs/backend-admin-dashboard.patch`)
**Why it didn't work:** the API had no endpoint that lists requests, only `GET /maintenance-requests/{id}`, and `maintenance_requests` had no column recording who accepted a request. So the admin UI could only ask for an ID, and could not show "accepted by".

**The patch** (6 files in the backend, applies cleanly to `b87aadb`):
- `GET /admin/maintenance-requests?status=&limit=&offset=` returns every customer's requests, newest first, each with `car`, `customer` and `accepted_by`.
- `GET /admin/maintenance-requests/{id}` returns the same enriched shape for one request.
- `PATCH /admin/maintenance-requests/{id}/accept` now records `accepted_by_id` / `accepted_at`. If another admin already accepted it, the response says who ("This request was already accepted by Ada Admin.").
- The model gains `accepted_by_id` and `accepted_at`. `create_all()` never adds columns to existing tables, so `create_db_and_tables()` now also runs two idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements on PostgreSQL at startup. If you prefer to migrate by hand, run them yourself first:

```sql
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS accepted_by_id UUID REFERENCES users(id);
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
```

Apply with `git apply docs/backend-admin-dashboard.patch` from the backend repo root, then redeploy. Deploy the backend **before** the frontend.

Not changed on purpose: accepting only *records* the owner. Any admin can still progress any request. Say if you want other admins locked out of a request someone else accepted.

## 4. Additional services cannot be rejected
`ApprovalStatus.REJECTED` exists and the email says "approve or reject", but only `PATCH .../approve` exists. Add a `/reject` route and the UI will gain a button.

## 5. Photos are write-only
`POST /admin/maintenance-images` stores a URL, but nothing returns the images (not even in request details), so customers can't see them.

## 6. Minor
- The additional-service email has no link; include `{frontend_base_url}/app/requests/{request_id}`.
- `payments` `POST /` is admin-only and requires `maintenance_service_id` in practice (the model allows null).

## 7. `requests` is imported but not declared
`app/services/email_service.py` does `import requests`, but `pyproject.toml` doesn't list it (only `httpx` and `resend`). A clean `uv sync` / `pip install` crashes at startup with `ModuleNotFoundError`. Add `requests` to the dependencies.

## 8. Password-reset and similar requests wait on the email provider
`POST /auth/reset-password` sends a "password changed" email inside the request. If Mailjet is slow, the user's request hangs (the frontend shows "could not reach the server" after its timeout even though the password was changed). Sending it via `BackgroundTasks` would avoid this.
