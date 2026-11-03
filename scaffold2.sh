#!/bin/bash
set -e

echo "Creating React code..."

# --- SERVICES ---
cat > src/services/types.ts << 'FILE'
export type UserRole = 'CUSTOMER' | 'WORKSHOP_ADMIN'
export type MaintenanceStatus = 'PENDING' | 'ACCEPTED' | 'INSPECTING' | 'AWAITING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'
export type ImageCategory = 'BEFORE' | 'DAMAGE_PART' | 'REMOVED_PART' | 'REPLACEMENT_PART' | 'AFTER'

export interface TokenResponse { access_token: string; token_type: string }
export interface UserProfileResponse { id: string; first_name: string; last_name: string; email: string; phone: string; role: UserRole; created_at: string }
export interface UserCreate { first_name: string; last_name: string; email: string; password: string; phone: string }
export interface LoginRequest { email: string; password: string }
export interface ProfileUpdate { first_name?: string; last_name?: string; phone?: string }
export interface ChangePasswordRequest { current_password: string; new_password: string }
export interface CarCreate { make: string; model: string; year: number; color: string; plate_number: string; vin: string }
export interface CustomerCarDetailResponse { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null; created_at: string; requests: CustomerRequestResponse[] }
export interface CustomerRequestResponse { id: string; description: string; request_date: string; status: MaintenanceStatus; updated_at: string; completed_at?: string | null; next_service_date?: string | null; car: { id: string; make: string; model: string; year: number; plate_number: string }; total_cost: string; total_paid: string; balance: string; pending_approval_count: number }
export interface MaintenanceRequestCreate { car_id: string; description: string; request_date: string }
export interface MaintenanceServiceResponse { id: string; maintenance_request_id: string; name: string; description: string; cost: string; is_additional: boolean; approval: ApprovalStatus; created_at: string; approved_at?: string | null; updated_at?: string | null }
export interface PaymentSummaryResponse { total_billed: string; total_paid: string; outstanding_balance: string; unpaid_services: { service_id: string; maintenance_request_id: string; name: string; balance: string }[] }
export interface CustomerPaymentItem { reference: string; maintenance_request_id: string; request_description: string; amount: string; date: string; status: string; method?: PaymentMethod | null }

export interface AdminDashboardResponse { statistics: { total_requests: number; by_status: Record<string, number>; created_last_30_days: number; completed_last_30_days: number; total_revenue: string }; pending_work: { count: number; items: any[] }; awaiting_customer_approval: { count: number; items: any[] }; payments_needing_review: { count: number; items: any[] }; notification_problems: { failed_count: number }; recent_activity: any[] }
export interface AdminMaintenanceRequestResponse { id: string; description: string; request_date: string; status: MaintenanceStatus; created_at: string; updated_at: string; completed_at?: string | null; next_service_date?: string | null; inspection_notes?: string | null; inspected_at?: string | null; customer: { id: string; first_name: string; last_name: string; email: string; phone: string }; vehicle: { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null } }
export interface AdminMaintenanceRequestDetailResponse extends AdminMaintenanceRequestResponse { services: MaintenanceServiceResponse[]; images: { id: string; image_url: string; category: ImageCategory }[]; payments: { id: string; amount: string; method: PaymentMethod; reference: string; payment_date: string }[]; approvals: { pending: number; approved: number; rejected: number }; total_cost: string; total_paid: string; balance: string }
export interface AdminCustomerListItem { id: string; first_name: string; last_name: string; email: string; phone: string; created_at: string; vehicle_count: number }
export interface AdminVehicleListItem { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null; owner_id: string; owner_name: string }
export interface AdminAwaitingApprovalResponse { request: AdminMaintenanceRequestResponse; pending_services: MaintenanceServiceResponse[]; approvals: { pending: number; approved: number; rejected: number } }
export interface AdminReportResponse { period_days: number; total_revenue: string; requests_created: number; revenue_by_month: { month: string; revenue: string }[]; requests_by_status: Record<string, number>; payments_by_method: Record<string, string>; top_services: { name: string; count: number; revenue: string }[] }
FILE

cat > src/services/api.ts << 'FILE'
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

async function req<R>(path: string, init: RequestInit = {}, auth = true, form = false): Promise<R> {
  const headers = new Headers(init.headers)
  if (!form) headers.set('Content-Type', 'application/json')
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
  register: (body: T.UserCreate) => req<{message:string}>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),
  me: () => req<T.UserProfileResponse>('/auth/me'),
  updateMe: (body: T.ProfileUpdate) => req<T.UserProfileResponse>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: T.ChangePasswordRequest) => req<{message:string}>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  
  listMyCars: () => req<T.CustomerCarDetailResponse[]>('/customer/cars'),
  addCar: (body: T.CarCreate) => req<{message:string}>('/customer/cars', { method: 'POST', body: JSON.stringify(body) }),
  listMyRequests: () => req<T.CustomerRequestResponse[]>('/customer/maintenance-requests'),
  submitRequest: (body: T.MaintenanceRequestCreate) => req<{message:string}>('/customer/maintenance-requests', { method: 'POST', body: JSON.stringify(body) }),
  requestServices: (reqId: string) => req<T.MaintenanceServiceResponse[]>(`/customer/maintenance-services/${reqId}`),
  approveService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/approve`, { method: 'PATCH' }),
  rejectService: (srvId: string) => req<any>(`/customer/maintenance-services/${srvId}/reject`, { method: 'PATCH' }),
  paymentSummary: () => req<T.PaymentSummaryResponse>('/customer/payments/summary'),

  adminDashboard: () => req<T.AdminDashboardResponse>('/admin/dashboard'),
  adminRequests: (status?: string) => req<T.AdminMaintenanceRequestResponse[]>(`/admin/maintenance-requests${status ? `?status=${status}` : ''}`),
  adminRequestDetail: (id: string) => req<T.AdminMaintenanceRequestDetailResponse>(`/admin/maintenance-requests/${id}`),
  adminAccept: (id: string) => req<any>(`/admin/maintenance-requests/${id}/accept`, { method: 'PATCH' }),
  adminInspect: (id: string) => req<any>(`/admin/maintenance-requests/${id}/inspect`, { method: 'PATCH', body: JSON.stringify({}) }),
  adminAddService: (body: any) => req<any>('/admin/maintenance-services', { method: 'POST', body: JSON.stringify(body) }),
  adminCustomers: () => req<T.AdminCustomerListItem[]>('/admin/customers'),
}
FILE

# --- CONTEXT ---
cat > src/context/AuthContext.tsx << 'FILE'
import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken } from '@/services/api'
import type { UserProfileResponse } from '@/services/types'

interface AuthCtx { user: UserProfileResponse | null; loading: boolean; logout: () => void; reloadUser: () => Promise<void> }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, logout: () => {}, reloadUser: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!getToken()) { setLoading(false); return }
    try { setUser(await api.me()) } catch { clearToken() } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const logout = () => { clearToken(); setUser(null); window.location.href = '/' }
  return <Ctx.Provider value={{ user, loading, logout, reloadUser: load }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
FILE

# --- UI COMPONENTS ---
cat > src/components/ds/Button.tsx << 'FILE'
import { ButtonHTMLAttributes } from 'react'
export const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 active:scale-95 transition-all px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:pointer-events-none ${className}`} {...props} />
)
FILE

cat > src/components/ds/Input.tsx << 'FILE'
import { InputHTMLAttributes, forwardRef } from 'react'
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`w-full bg-ink-800 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all ${className}`} {...props} />
))
FILE

cat > src/components/ds/Skeleton.tsx << 'FILE'
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
)
FILE

# --- PAGES ---
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-ink-900 text-slate-300">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <header className="px-6 py-6 flex justify-between items-center relative z-10 max-w-6xl mx-auto w-full">
        <div className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 block shadow-glow" /> MOTORA
        </div>
        <div className="flex gap-4">
          <Link to="/login"><Button className="bg-transparent border-none text-slate-300 hover:text-white">Log in</Button></Link>
          <Link to="/register"><Button>Sign up</Button></Link>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-20 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[1.1] text-white">
            Your vehicle,<br/><span className="text-cyan-400">fully documented.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Precision maintenance. Transparent pricing. Real-time status updates. Hand over the keys with absolute confidence.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/register"><Button className="px-8 py-4 text-lg">Book a service</Button></Link>
          </div>
        </div>
        <div className="relative glass p-6 rounded-2xl border-cyan-500/20 max-w-sm ml-auto hidden md:block transform rotate-2 hover:rotate-0 transition-transform duration-500">
          <div className="text-sm text-slate-400 mb-2">Next service due</div>
          <div className="text-3xl font-mono text-white mb-6">Dec 15, 2026</div>
          <div className="w-full h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 border border-slate-700/50 overflow-hidden relative">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(56,225,255,0.05)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_infinite]" />
             Workshop status: <span className="text-cyan-400 ml-2">Inspecting</span>
          </div>
        </div>
      </main>
    </div>
  )
}
FILE

cat > src/pages/public/Login.tsx << 'FILE'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const { reloadUser } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    try {
      await api.login({ email, password })
      await reloadUser()
      nav('/dashboard')
    } catch (e: any) { setErr(e.message || 'Login failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-900">
      <form onSubmit={submit} className="glass p-8 rounded-2xl w-full max-w-md space-y-6 border-slate-700/50">
        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="font-display font-bold text-2xl text-white">MOTORA</Link>
          <p className="text-slate-400">Log in to your account</p>
        </div>
        {err && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">{err}</div>}
        <div className="space-y-4">
          <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full py-3">Sign in</Button>
        <p className="text-center text-sm text-slate-500">
          No account? <Link to="/register" className="text-cyan-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
FILE

cat > src/pages/public/Register.tsx << 'FILE'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await api.register(form)
      setMsg(res.message)
    } catch (e: any) { setErr(e.message || 'Registration failed') }
  }

  if (msg) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-900">
      <div className="glass p-8 rounded-2xl w-full max-w-md text-center space-y-4">
        <h2 className="text-xl text-cyan-400 font-semibold">Check your email</h2>
        <p className="text-slate-300">{msg}</p>
        <Link to="/login"><Button className="mt-4">Back to login</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-900">
      <form onSubmit={submit} className="glass p-8 rounded-2xl w-full max-w-md space-y-4 border-slate-700/50">
        <h2 className="text-2xl font-display text-white mb-6 text-center">Create account</h2>
        {err && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">{err}</div>}
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="First name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
          <Input placeholder="Last name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
        </div>
        <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <Input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        <Input type="password" placeholder="Password (min 10 chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={10} />
        <Button type="submit" className="w-full py-3 mt-2">Register</Button>
      </form>
    </div>
  )
}
FILE

cat > src/pages/customer/Dashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  
  if (isLoading) return <div className="p-8 space-y-4 max-w-5xl mx-auto"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display text-white">My Vehicles</h1>
          <p className="text-slate-400 mt-1">Manage your cars and service history.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {cars?.map(car => (
          <div key={car.id} className="glass rounded-xl p-6 border-slate-700/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-display text-white">{car.year} {car.make} {car.model}</h3>
                <div className="text-sm font-mono text-cyan-400 mt-1">{car.plate_number}</div>
              </div>
              <Link to={`/vehicle/${car.id}`} className="text-sm text-slate-400 hover:text-white underline">Details</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div>
                <div className="text-slate-500 mb-1">Next service</div>
                <div className="text-white font-mono">{date(car.requests[0]?.next_service_date) || 'Not set'}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Outstanding</div>
                <div className="text-amber-400 font-mono">{ngn(car.requests.reduce((s, r) => s + Number(r.balance), 0))}</div>
              </div>
            </div>
          </div>
        ))}
        {cars?.length === 0 && <div className="col-span-2 text-center p-12 glass rounded-xl border-dashed border-slate-700 text-slate-400">No vehicles yet.</div>}
      </div>
    </div>
  )
}
FILE

cat > src/pages/admin/AdminDashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dash'], queryFn: api.adminDashboard })
  
  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-40" /></div>
  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-display text-white">Workshop Overview</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', val: ngn(data.statistics.total_revenue) },
          { label: 'Active Requests', val: data.statistics.total_requests },
          { label: 'Pending Work', val: data.pending_work.count },
          { label: 'Awaiting Approval', val: data.awaiting_customer_approval.count },
        ].map(s => (
          <div key={s.label} className="glass p-6 rounded-xl border-slate-700/50">
            <div className="text-slate-400 text-sm mb-2">{s.label}</div>
            <div className="text-2xl font-mono text-cyan-400">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {data.recent_activity.map((a: any) => (
              <div key={a.request_id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                <div>
                  <div className="text-white text-sm">{a.customer_name}</div>
                  <div className="text-slate-500 text-xs">{a.vehicle} • {a.plate_number}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-cyan-400">{a.status}</div>
                  <div className="text-slate-500 text-xs">{date(a.occurred_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
FILE

# --- LAYOUTS & ROUTER ---
cat > src/components/layout/AppShell.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '../ds/Button'
import { initials } from '@/lib/format'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isAdmin = user?.role === 'WORKSHOP_ADMIN'

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="h-16 border-b border-slate-800/50 bg-ink-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 block" /> MOTORA
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              {isAdmin ? (
                <>
                  <Link to="/admin" className={loc.pathname === '/admin' ? 'text-cyan-400' : 'hover:text-white transition-colors'}>Dashboard</Link>
                  <Link to="/admin/requests" className={loc.pathname.startsWith('/admin/requests') ? 'text-cyan-400' : 'hover:text-white transition-colors'}>Requests</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={loc.pathname.startsWith('/dashboard') || loc.pathname.startsWith('/vehicle') ? 'text-cyan-400' : 'hover:text-white transition-colors'}>My Garage</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold">
                {initials(user?.first_name, user?.last_name)}
              </div>
              <div className="hidden sm:block text-sm">
                <div className="text-white font-medium">{user?.first_name} {user?.last_name}</div>
                <div className="text-slate-500 text-xs capitalize">{user?.role.toLowerCase().replace('_', ' ')}</div>
              </div>
            </div>
            <Button onClick={logout} className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-400">Sign out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  )
}
FILE

cat > src/router.tsx << 'FILE'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AppShell } from '@/components/layout/AppShell'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Dashboard from '@/pages/customer/Dashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-ink-900" />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppShell />,
      children: [
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/admin', element: <AdminDashboard /> },
        { path: '/admin/requests', element: <div className="p-8 text-white">Requests coming soon</div> },
      ]
    }]
  }
])

export function AppRouter() { return <RouterProvider router={router} /> }
FILE

cat > src/App.tsx << 'FILE'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { AppRouter } from '@/router'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  )
}
FILE

cat > src/main.tsx << 'FILE'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
FILE

echo "Done! Run: npm run dev"
