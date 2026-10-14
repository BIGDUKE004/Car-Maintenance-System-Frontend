import { api } from './axios';
export const customerApi = {
  cars: () => api.get('/customer/cars'),
  addCar: (payload) => api.post('/customer/cars', payload),
  updateCarColor: (carId, color) => api.patch(`/customer/cars/${carId}/color`, { color }),
  maintenanceHistory: (carId) => api.get(`/customer/cars/${carId}/maintenance-history`),
  createRequest: (payload) => api.post('/customer/maintenance-requests', payload),
  servicesForRequest: (requestId) => api.get(`/customer/maintenance-services/${requestId}`),
  approveService: (serviceId) => api.patch(`/customer/maintenance-services/${serviceId}/approve`),
};
export const maintenanceApi = {
  request: (id) => api.get(`/maintenance-requests/${id}`),
  cancel: (id) => api.patch(`/maintenance-requests/${id}/cancel`),
  totalCost: (id) => api.get(`/maintenance-requests/${id}/total-cost`),
  balance: (id) => api.get(`/maintenance-requests/${id}/balance`),
};
export const paymentApi = {
  initialize: (payload) => api.post('/payments/paystack/initialize', payload),
  callback: (reference) => api.get('/payments/paystack/callback', { params: { reference } }),
};
