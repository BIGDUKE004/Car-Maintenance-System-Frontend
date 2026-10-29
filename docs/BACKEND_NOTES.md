# Backend notes found while integrating

These need changes in the backend repo; the frontend does not work around them silently.

## 1. Paystack returns the customer to a JSON page (one-line fix)
`PaystackPaymentService.start_payment` sets `callback_url=f"{settings.app_base_url}/payments/paystack/callback"`, so after paying, the browser lands on raw backend JSON. The frontend already has `/payments/result`, which reads `?reference=` and calls that same backend endpoint to verify. Point Paystack there:

```python
callback_url=f"{settings.frontend_base_url}/payments/result",
```

## 2. `POST /admin/admins` returns the new user's password hash
The route has no `response_model`, so the full `User` row (including the bcrypt hash) is returned. Add `response_model=UserResponse` (already defined in `user_schema.py`). The frontend ignores the response body.

## 3. No way for admins to discover requests
There is no list endpoint, so a new customer request never shows up for the workshop. Suggested:

```python
@router.get("/maintenance-requests")
def list_requests(status: MaintenanceStatus | None = None, session: Session = Depends(get_session)):
    ...  # return requests (optionally by status), newest first
```
Once it exists, the admin home page can list pending requests instead of asking for an ID.

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
