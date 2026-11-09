import { API_BASE, TOKEN_KEY } from '@/lib/constants'
import type * as T from './types'
import { fileToDataUrl } from '@/lib/image'

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

  // Profile: the supplied backend has no documented profile route, so we try the common ones
  // and let callers fall back to the locally stored profile when none exists.
  me: async (): Promise<T.UserProfileResponse | null> => {
    for (const path of ['/auth/me', '/users/me', '/customer/profile']) {
      try { return await req<T.UserProfileResponse>(path) } catch (e) { if (!(e instanceof ApiError) || ![404, 405].includes(e.status)) throw e }
    }
    return null
  },
  updateProfile: (body: T.ProfileUpdate) => req<T.UserProfileResponse>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: T.ChangePasswordRequest) => req<{message:string}>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),

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
addCar: (body: T.CarCreate) =>
  req<{ message: string; car_id: string }>(
    '/customer/cars',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  ),
  
  updateCar: async (carId: string, body: Partial<T.CarCreate>) => {
    const path = `/customer/cars/${encodeURIComponent(carId)}`
    try { return await req<any>(path, { method: 'PATCH', body: JSON.stringify(body) }) }
    catch (e) { if (e instanceof ApiError && e.status === 405) return req<any>(path, { method: 'PUT', body: JSON.stringify(body) }); throw e }
  },
  deleteCar: (carId: string) => req<any>(`/customer/cars/${encodeURIComponent(carId)}`, { method: 'DELETE' }),

  uploadCarPhoto: (carId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return req<T.CustomerCarDetailResponse>(
    `/customer/cars/${encodeURIComponent(carId)}/photo`,
    {
      method: 'POST',
      body: formData,
    }
  )
},



  submitRequest: (body: T.MaintenanceRequestCreate) => req<{message:string}>('/customer/maintenance-requests', { method: 'POST', body: JSON.stringify(body) }),
  requestById: (id: string) => req<T.MaintenanceRequestDetail>(`/maintenance-requests/${id}`),
  requestServices: (reqId: string) => req<T.MaintenanceServiceResponse[]>(`/customer/maintenance-services/${reqId}`),
  approveService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/approve`, { method: 'PATCH' }),
  rejectService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/reject`, { method: 'PATCH' }),
  requestImages: async (reqId: string): Promise<T.MaintenanceImage[]> => {
    const id = encodeURIComponent(reqId)
    const asUrl = (u?: string) => (u && u.startsWith('/') ? `${API_BASE}${u}` : u || '')
    const normalise = (list: any[]): T.MaintenanceImage[] => list.map((i, n) => ({
      id: String(i.id ?? n), image_url: asUrl(i.image_url ?? i.url ?? i.imageUrl), category: String(i.category ?? 'OTHER'), uploaded_at: i.uploaded_at,
    })).filter(i => i.image_url)
    const paths = [`/maintenance-requests/${id}/images`, `/customer/maintenance-requests/${id}/images`, `/maintenance-images?maintenance_request_id=${id}`, `/admin/maintenance-requests/${id}/images`]
    for (const path of paths) {
      try {
        const r = await req<any>(path)
        const list = Array.isArray(r) ? r : Array.isArray(r?.images) ? r.images : null
        if (list) return normalise(list)
      } catch (e) { if (e instanceof ApiError && [403, 404, 405, 422].includes(e.status)) continue; throw e }
    }
    try { const d = await req<any>(`/maintenance-requests/${id}`); if (Array.isArray(d?.images)) return normalise(d.images) } catch { /* no embedded images */ }
    return []
  },
  paymentSummary: () => req<T.PaymentSummaryResponse>('/customer/payments/summary'),
  initializePayment: (body: { maintenance_service_id: string, amount?: number }) => req<{ authorization_url: string, reference: string }>('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify(body) }),

  adminRequests: (status?: string) => req<T.AdminMaintenanceRequestResponse[]>(`/admin/maintenance-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  acceptRequest: (id: string) => req<any>(`/admin/maintenance-requests/${id}/accept`, {method:'PATCH'}),
  inspectRequest: (id: string) => req<any>(`/admin/maintenance-requests/${id}/inspect`, {method:'PATCH'}),
  // Admin view of a request's services (with approval state). Tries the detailed request first.
  adminRequestServices: async (id: string): Promise<T.MaintenanceServiceResponse[] | null> => {
    const tryGet = async (path: string) => { try { return await req<any>(path) } catch (e) { if (e instanceof ApiError && [403, 404, 405].includes(e.status)) return null; throw e } }
    const detail = await tryGet(`/admin/maintenance-requests/${encodeURIComponent(id)}`)
    if (detail && Array.isArray(detail.services)) return detail.services
    for (const path of [`/admin/maintenance-requests/${encodeURIComponent(id)}/services`, `/customer/maintenance-services/${encodeURIComponent(id)}`]) {
      const r = await tryGet(path)
      if (Array.isArray(r)) return r
    }
    return null
  },
  addMaintenanceService: (body: {maintenance_request_id:string;name:string;description:string;cost:number;is_additional:boolean}) => req<any>('/admin/maintenance-services',{method:'POST',body:JSON.stringify(body)}),
  updateRequestStatus: (id:string,status:string) => req<any>(`/admin/maintenance-requests/${id}/status?status=${encodeURIComponent(status)}`,{method:'PATCH'}),
  setNextServiceDate: (id:string,next_service_date:string) => req<any>(`/admin/maintenance-requests/${id}/next-service-date?next_service_date=${encodeURIComponent(next_service_date)}`,{method:'PATCH'}),
  adminPayments: (status='NEEDS_REVIEW') => req<T.PaymentTransactionResponse[]>(`/admin/payment-transactions?status=${status}`),
  resolvePayment: (reference:string) => req<any>(`/admin/payment-transactions/${encodeURIComponent(reference)}/resolve`,{method:'PATCH'}),
  addMaintenanceImage: async (maintenance_request_id: string, file: File, category: T.ImageCategory) => {
    const id = encodeURIComponent(maintenance_request_id)
    const multipart = () => { const fd = new FormData(); fd.append('file', file); fd.append('maintenance_request_id', maintenance_request_id); fd.append('category', category); return fd }
    const paths = [`/admin/maintenance-requests/${id}/images?category=${encodeURIComponent(category)}`, '/admin/maintenance-images', '/maintenance-images', '/admin/images']
    let last: unknown = new ApiError(404, 'No image-upload route found on the server.')
    for (const path of paths) {
      try { return await req<any>(path, { method: 'POST', body: multipart() }) }
      catch (e) {
        last = e
        if (e instanceof ApiError && [404, 405].includes(e.status)) continue
        if (e instanceof ApiError && e.status === 422) {
          // The route exists but wants a JSON image_url instead of a file: send a resized copy as the URL.
          try { return await req<any>(path, { method: 'POST', body: JSON.stringify({ maintenance_request_id, category, image_url: await fileToDataUrl(file) }) }) }
          catch (e2) { last = e2 }
        }
        break
      }
    }
    throw last
  },
  createAdmin: (body: T.UserCreate) => req<{message:string}>('/admin/admins', { method: 'POST', body: JSON.stringify(body) }),
  retryNotifications: () => req<{sent:number;still_failed:number}>('/admin/email-notifications/retry-failed',{method:'POST'}),
}
