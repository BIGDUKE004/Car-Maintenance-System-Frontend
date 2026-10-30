import { api } from './axios';

// Every route here sits behind `require_admin` on the backend (403 otherwise).
export const adminApi = {
  // POST /admin/admins  -> create another workshop admin (already email-verified)
  addAdmin: (payload) => api.post('/admin/admins', payload),

  // GET /admin/verify-vehicle/{car_id}?plate_number=&vin=  -> { verified: boolean }
  verifyVehicle: (carId, plate_number, vin) =>
    api.get(`/admin/verify-vehicle/${carId}`, { params: { plate_number, vin } }),

  // GET /admin/maintenance-requests?status=  -> every customer's requests, newest first,
  // each with { car, customer, accepted_by } so the dashboard needs no extra calls.
  listRequests: (status) => api.get('/admin/maintenance-requests', { params: status ? { status } : {} }),
  // GET /admin/maintenance-requests/{id}  -> the same enriched shape for one request
  getRequest: (id) => api.get(`/admin/maintenance-requests/${id}`),

  // Request lifecycle. The backend enforces the allowed transitions:
  // PENDING > ACCEPTED > INSPECTING > (AWAITING_APPROVAL) > IN_PROGRESS > COMPLETED
  acceptRequest: (id) => api.patch(`/admin/maintenance-requests/${id}/accept`),
  inspectRequest: (id) => api.patch(`/admin/maintenance-requests/${id}/inspect`),
  updateStatus: (id, status) => api.patch(`/maintenance-requests/${id}/status`, { status }),
  setNextServiceDate: (id, next_service_date) =>
    api.patch(`/maintenance-requests/${id}/next-service-date`, { next_service_date }),

  // POST /admin/maintenance-services -> { message, maintenance_service_id, email_sent }
  addService: (payload) => api.post('/admin/maintenance-services', payload),

  // POST /admin/maintenance-images -> stores a URL + category (no file upload endpoint exists)
  addImage: (payload) => api.post('/admin/maintenance-images', payload),

  // POST /payments/  -> record a CASH / CARD / TRANSFER payment the workshop has confirmed
  recordPayment: (payload) => api.post('/payments/', payload),

  // Paystack transactions that need a human (money received, but not recordable)
  transactions: (status) => api.get('/admin/payment-transactions', { params: { status } }),
  resolveTransaction: (reference) => api.patch(`/admin/payment-transactions/${encodeURIComponent(reference)}/resolve`),

  // POST /admin/email-notifications/retry-failed -> { sent, still_failed }
  retryFailedEmails: () => api.post('/admin/email-notifications/retry-failed'),
};
