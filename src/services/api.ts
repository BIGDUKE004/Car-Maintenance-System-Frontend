import { API_BASE, TOKEN_KEY } from '@/lib/constants'
import type * as T from './types'

const FIELD_LABELS: Record<string, string> = {
  first_name: 'First name', last_name: 'Last name', email: 'Email address',
  phone: 'Phone number', password: 'Password', make: 'Make', model: 'Model',
  year: 'Year', color: 'Color', plate_number: 'Plate number', vin: 'VIN',
  description: 'Description', request_date: 'Request date',
}

function readableError(detail: unknown): string {
  if (Array.isArray(detail)) {
    const messages = detail.map((item: any) => {
      const field = Array.isArray(item?.loc) ? String(item.loc[item.loc.length - 1] ?? '') : ''
      const label = FIELD_LABELS[field] || (field ? field.replaceAll('_', ' ') : 'This field')
      const type = String(item?.type || '')
      if (type.includes('string_too_short') || type.includes('too_short')) {
        const minimum = item?.ctx?.min_length
        return `${label} must contain at least ${minimum ?? 1} character${minimum === 1 ? '' : 's'}.`
      }
      if (type.includes('string_too_long') || type.includes('too_long')) {
        return `${label} is too long.`
      }
      if (type.includes('missing')) return `${label} is required.`
      if (type.includes('email')) return 'Enter a valid email address.'
      if (type.includes('int_parsing')) return `${label} must be a valid number.`
      return typeof item?.msg === 'string' ? `${label}: ${item.msg.replace(/^Value error, /, '')}` : `${label} is invalid.`
    })
    return [...new Set(messages)].join(' ')
  }
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object') {
    const message = (detail as any).message
    if (typeof message === 'string') return message
    const nested = (detail as any).detail
    if (nested !== undefined && nested !== detail) return readableError(nested)
  }
  return 'Something went wrong. Please check your details and try again.'
}

export class ApiError extends Error {
  status: number
  constructor(status: number, detail: unknown) {
    const message = readableError(detail)
    super(message || `Request failed (${status})`)
    this.status = status
  }
}
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function req<R>(path: string, init: RequestInit = {}, auth = true): Promise<R> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData) && init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (auth) { const t = getToken(); if (t) headers.set('Authorization', `Bearer ${t}`) }
  let res: Response
  try { res = await fetch(`${API_BASE}${path}`, { ...init, headers }) }
  catch { throw new ApiError(0, 'Unable to reach the server. Check your connection and API URL.') }
  const text = await res.text()
  let body: any = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) throw new ApiError(res.status, body?.detail ?? body)
  return body as R
}

export const api = {
  login: async (body: T.LoginRequest) => {
    const r = await req<T.TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false)
    setToken(r.access_token); return r
  },
  register: (body: T.UserCreate) => req<{message:string}>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),
  verifyEmail: (token: string) => req<{message:string}>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {}, false),
  forgotPassword: (email: string) => req<{message:string}>('/auth/forgot-password', { method:'POST', body: JSON.stringify({email}) }, false),
  resetPassword: (token: string, new_password: string) => req<{message:string}>('/auth/reset-password', { method:'POST', body: JSON.stringify({token,new_password}) }, false),

  listMyCars: () => req<T.CustomerCarDetailResponse[]>('/customer/cars'),
  customerServiceHistory: (carId: string) => req<T.CustomerMaintenanceHistory[]>(`/customer/cars/${encodeURIComponent(carId)}/maintenance-history`),
  paymentOverview: async () => {
    const cars = await req<any[]>('/customer/cars')
    const histories = await Promise.all(cars.map(car => req<any[]>(`/customer/cars/${car.id}/maintenance-history`)))
    const unpaid_services = histories.flat().flatMap(h => (h.services || []).filter((srv:any) => Number(srv.payment?.balance || 0) > 0).map((srv:any) => ({service_id:srv.service_id,maintenance_request_id:h.request_id,name:srv.service_name,balance:String(srv.payment.balance)})))
    const total_billed = histories.flat().reduce((sum:number,h:any)=>sum+Number(h.payment_summary?.total_cost||0),0)
    const total_paid = histories.flat().reduce((sum:number,h:any)=>sum+Number(h.payment_summary?.total_paid||0),0)
    return {total_billed:String(total_billed),total_paid:String(total_paid),outstanding_balance:String(Math.max(total_billed-total_paid,0)),unpaid_services}
  },
  addCar: (body: T.CarCreate) => req<{message:string}>('/customer/cars', { method: 'POST', body: JSON.stringify(body) }),
  submitRequest: (body: T.MaintenanceRequestCreate) => req<{message:string}>('/customer/maintenance-requests', { method: 'POST', body: JSON.stringify(body) }),
  requestById: (id: string) => req<T.MaintenanceRequestDetail>(`/maintenance-requests/${id}`),
  requestServices: (reqId: string) => req<T.MaintenanceServiceResponse[]>(`/customer/maintenance-services/${reqId}`),
  approveService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/approve`, { method: 'PATCH' }),
  paymentSummary: () => req<T.PaymentSummaryResponse>('/customer/payments/summary'),
  initializePayment: (body: { maintenance_service_id: string, amount?: number }) => req<{ authorization_url: string, reference: string }>('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify(body) }),

  adminRequests: (status?: string) => req<T.AdminMaintenanceRequestResponse[]>(`/admin/maintenance-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  acceptRequest: (id: string) => req<any>(`/admin/maintenance-requests/${id}/accept`, {method:'PATCH'}),
  inspectRequest: (id: string) => req<any>(`/admin/maintenance-requests/${id}/inspect`, {method:'PATCH'}),
  addMaintenanceService: (body: {maintenance_request_id:string;name:string;description:string;cost:number;is_additional:boolean}) => req<any>('/admin/maintenance-services',{method:'POST',body:JSON.stringify(body)}),
  updateRequestStatus: (id:string,status:string) => req<any>(`/admin/maintenance-requests/${id}/status?status=${encodeURIComponent(status)}`,{method:'PATCH'}),
  setNextServiceDate: (id:string,next_service_date:string) => req<any>(`/admin/maintenance-requests/${id}/next-service-date?next_service_date=${encodeURIComponent(next_service_date)}`,{method:'PATCH'}),
  adminPayments: (status='NEEDS_REVIEW') => req<T.PaymentTransactionResponse[]>(`/admin/payment-transactions?status=${status}`),
  resolvePayment: (reference:string) => req<any>(`/admin/payment-transactions/${encodeURIComponent(reference)}/resolve`,{method:'PATCH'}),
  retryNotifications: () => req<{sent:number;still_failed:number}>('/admin/email-notifications/retry-failed',{method:'POST'}),
}
