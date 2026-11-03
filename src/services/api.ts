import { API_BASE, TOKEN_KEY } from '@/lib/constants'
import type * as T from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail))
    this.status = status
  }
}
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function req<R>(path: string, init: RequestInit = {}, auth = true): Promise<R> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (auth) { const t = getToken(); if (t) headers.set('Authorization', `Bearer ${t}`) }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  let body: any = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) {
    if (res.status === 401) clearToken()
    throw new ApiError(res.status, body?.detail ?? body)
  }
  return body as R
}

export const api = {
  login: async (body: T.LoginRequest) => {
    const r = await req<T.TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false)
    setToken(r.access_token); return r
  },
  me: () => req<T.UserProfileResponse>('/auth/me'),
  
  // Customer Endpoints
  listMyCars: () => req<T.CustomerCarDetailResponse[]>('/customer/cars'),
  addCar: (body: T.CarCreate) => req<{message:string}>('/customer/cars', { method: 'POST', body: JSON.stringify(body) }),
  listMyRequests: () => req<T.CustomerRequestResponse[]>('/customer/maintenance-requests'),
  submitRequest: (body: T.MaintenanceRequestCreate) => req<{message:string}>('/customer/maintenance-requests', { method: 'POST', body: JSON.stringify(body) }),
  requestServices: (reqId: string) => req<T.MaintenanceServiceResponse[]>(`/customer/maintenance-services/${reqId}`),
  approveService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/approve`, { method: 'PATCH' }),
  rejectService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/reject`, { method: 'PATCH' }),
  paymentSummary: () => req<T.PaymentSummaryResponse>('/customer/payments/summary'),
  initializePayment: (body: { maintenance_service_id: string, amount?: number }) => req<{ authorization_url: string, reference: string }>('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify(body) }),

  // Admin Endpoints
  adminDashboard: () => req<T.AdminDashboardResponse>('/admin/dashboard'),
  adminRequests: (status?: string) => req<T.AdminMaintenanceRequestResponse[]>(`/admin/maintenance-requests${status ? `?status=${status}` : ''}`),
  adminCustomers: () => req<T.AdminCustomerListItem[]>('/admin/customers'),
  adminVehicles: () => req<T.AdminVehicleListItem[]>('/admin/vehicles'),
  adminPayments: () => req<any[]>('/admin/payments'),
  adminReports: () => req<T.AdminReportResponse>('/admin/reports'),
}
