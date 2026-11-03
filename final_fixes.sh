#!/bin/bash
set -e

echo "Applying final fixes and building missing Admin pages..."

# 1. UPDATE BUTTON COMPONENT (Round Edges)
cat > src/components/ds/Button.tsx << 'FILE'
import { ButtonHTMLAttributes } from 'react'
export const Button = ({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const isGhost = className.includes('bg-transparent')
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs px-6 py-3"
  const primary = "bg-brand text-white hover:bg-brand-hover hover:shadow-glow active:scale-[0.98]"
  const ghost = "border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white active:scale-[0.98]"
  return <button className={`${base} ${isGhost ? ghost : primary} ${className}`} {...props}>{children}</button>
}
FILE

# 2. FIX CUSTOMER DASHBOARD (Prevent crash if requests are undefined)
cat > src/pages/customer/Dashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Icon } from '@/components/ds/Icon'

export default function Dashboard() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-white mb-2">My Garage</h1>
          <p className="text-stone-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <Button className="px-6 py-4"><Icon name="plus" className="w-4 h-4 mr-2 inline" /> Add Vehicle</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => {
          // Safely handle possibly missing requests array
          const requests = car.requests || [];
          const nextService = requests.length > 0 ? requests[0].next_service_date : null;
          const totalBalance = requests.reduce((sum, r) => sum + Number(r.balance || 0), 0);

          return (
            <div key={car.id} className="group relative">
              <div className="h-64 relative overflow-hidden bg-stone-900 mb-6 rounded-xl">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-700 bg-stone-800">No Image Provided</div>
                )}
                <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10 rounded">
                  {car.plate_number}
                </div>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-serif text-white mb-1">{car.year} {car.make} {car.model}</h3>
                  <div className="text-sm text-stone-500 uppercase tracking-wider">VIN: {car.vin}</div>
                </div>
                <Link to={`/vehicle/${car.id}`} className="text-brand text-sm font-bold uppercase tracking-wider border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">Details</Link>
              </div>
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
                <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Next Service</div><div className="text-white font-mono text-lg">{date(nextService) || 'Not scheduled'}</div></div>
                <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Outstanding</div><div className={`font-mono text-lg ${totalBalance > 0 ? 'text-brand' : 'text-stone-300'}`}>{ngn(totalBalance)}</div></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
FILE

# 3. UPDATE LANDING PAGE (Remove white box, add carousel)
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { useState, useEffect } from 'react'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop'
]

export default function Landing() {
  const [activeImage, setActiveImage] = useState(0)

  // Auto-swipe every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 font-sans">
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-white">
            Motora<span className="text-brand">.</span>
          </Link>
          <div className="hidden md:flex gap-10 text-sm font-medium text-stone-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#heritage" className="hover:text-white transition-colors">Heritage</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-white hover:text-brand transition-colors">Log In</Link>
            <Link to="/register"><Button className="rounded-xl px-8 py-3 uppercase tracking-wider text-xs font-bold">Book Service</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center pt-24 overflow-hidden">
        {/* Carousel Images */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeImage ? 'opacity-60' : 'opacity-0'}`} 
              alt="Hero" 
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-serif text-white leading-[1.1] mb-8">
              The art of<br/>automotive care.
            </h1>
            <p className="text-xl text-stone-300 mb-10 leading-relaxed font-light">
              We treat every vehicle like a classic. From routine maintenance to complex diagnostics, experience a standard of service usually reserved for the track.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/register"><Button className="h-14 px-10 text-lg rounded-xl font-semibold">Start Your Service</Button></Link>
              <div className="text-sm text-stone-400 uppercase tracking-widest font-medium">Est. 2014</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-stone-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Expertise</h2>
              <p className="text-stone-400">Comprehensive care for modern machines.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Engine Diagnostics', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' },
              { title: 'Brake Systems', img: 'https://images.unsplash.com/photo-1599819095905-49e98b7cc606?q=80&w=2070&auto=format&fit=crop' },
              { title: 'Performance Tires', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=2072&auto=format&fit=crop' },
            ].map((s) => (
              <div key={s.title} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl mb-6">
                  <img src={s.img} alt={s.title} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-brand transition-colors">{s.title}</h3>
                <p className="text-stone-500 text-sm">Certified technicians. OEM parts. Guaranteed work.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
FILE

# 4. ADMIN REQUESTS PAGE
cat > src/pages/admin/AdminRequests.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { Link } from 'react-router-dom'
import { date } from '@/lib/format'

export default function AdminRequests() {
  const { data: requests, isLoading } = useQuery({ queryKey: ['admin-requests'], queryFn: () => api.adminRequests() })
  
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Work Queue</h1>
          <p className="text-stone-400">Manage all incoming and active maintenance requests.</p>
        </div>
      </div>
      
      <div className="bg-stone-900 border border-white/5 overflow-hidden rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Vehicle</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests?.map(req => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-white text-sm">{req.customer.first_name} {req.customer.last_name}</div>
                  <div className="text-xs text-stone-500">{req.customer.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-stone-300">{req.vehicle.year} {req.vehicle.make} {req.vehicle.model}</div>
                  <div className="text-xs text-brand font-mono mt-1">{req.vehicle.plate_number}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-brand/50 text-brand rounded">{req.status.replace('_', ' ')}</span>
                </td>
                <td className="p-4 text-sm text-stone-400">{date(req.request_date)}</td>
                <td className="p-4 text-right">
                  <Link to={`/admin/requests/${req.id}`} className="inline-block border border-stone-700 text-stone-300 hover:bg-brand hover:border-brand hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">Workbench</Link>
                </td>
              </tr>
            ))}
            {requests?.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-stone-500">No requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
FILE

# 5. ADMIN CUSTOMERS PAGE
cat > src/pages/admin/AdminCustomers.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { date } from '@/lib/format'

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: () => api.adminCustomers() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Customer Directory</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Joined</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {customers?.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white">{c.first_name} {c.last_name}</td>
                <td className="p-4 text-stone-400">{c.email}</td>
                <td className="p-4 text-stone-400 font-mono">{c.phone}</td>
                <td className="p-4 text-stone-500 text-sm">{date(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
FILE

# 6. ADMIN VEHICLES PAGE
cat > src/pages/admin/AdminVehicles.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'

export default function AdminVehicles() {
  const { data: vehicles, isLoading } = useQuery({ queryKey: ['admin-vehicles'], queryFn: () => api.adminVehicles() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Registered Vehicles</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Vehicle</th><th className="p-4">Plate</th><th className="p-4">VIN</th><th className="p-4">Owner</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {vehicles?.map(v => (
              <tr key={v.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white">{v.year} {v.make} {v.model}</td>
                <td className="p-4 text-brand font-mono">{v.plate_number}</td>
                <td className="p-4 text-stone-500 font-mono text-xs">{v.vin}</td>
                <td className="p-4 text-stone-400">{v.owner_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
FILE

# 7. ADMIN PAYMENTS PAGE
cat > src/pages/admin/AdminPayments.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'

export default function AdminPayments() {
  const { data: payments, isLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: () => api.adminPayments() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Payment Ledger</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Reference</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Customer</th><th className="p-4">Date</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {payments?.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white font-mono text-xs">{p.reference}</td>
                <td className="p-4 text-brand font-mono">{ngn(p.amount)}</td>
                <td className="p-4 text-stone-400"><span className="border border-white/10 px-2 py-1 text-xs rounded uppercase">{p.method}</span></td>
                <td className="p-4 text-stone-400">{p.customer_name} <span className="text-xs text-stone-600">({p.plate_number})</span></td>
                <td className="p-4 text-stone-500 text-sm">{date(p.payment_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
FILE

# 8. ADMIN REPORTS PAGE
cat > src/pages/admin/AdminReports.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn } from '@/lib/format'
import { Button } from '@/components/ds/Button'

export default function AdminReports() {
  const { data: report, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: () => api.adminReports() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Financial Reports</h1>
          <p className="text-stone-400">Last {report?.period_days || 180} days overview</p>
        </div>
        <Button className="bg-transparent border-stone-700">Export CSV</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-brand">{ngn(report?.total_revenue || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Requests Created</div>
          <div className="text-3xl font-mono text-white">{report?.requests_created}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Top Service</div>
          <div className="text-xl text-white truncate">{report?.top_services[0]?.name || 'N/A'}</div>
          <div className="text-xs text-stone-400 mt-1">{report?.top_services[0]?.count} bookings</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-serif text-white mb-6">Revenue By Month</h3>
          <div className="space-y-4">
            {report?.revenue_by_month.map(m => (
              <div key={m.month} className="flex justify-between items-center">
                <span className="text-stone-400 font-mono text-sm">{m.month}</span>
                <span className="text-white font-mono">{ngn(m.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-serif text-white mb-6">Requests By Status</h3>
          <div className="space-y-4">
            {Object.entries(report?.requests_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-stone-400 uppercase text-xs tracking-wider">{status}</span>
                <span className="text-white font-mono">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
FILE

# 9. UPDATE API CLIENT (Add the new admin endpoints)
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
  
  // Customer
  listMyCars: () => req<T.CustomerCarDetailResponse[]>('/customer/cars'),
  listMyRequests: () => req<T.CustomerRequestResponse[]>('/customer/maintenance-requests'),
  
  // Admin Endpoints
  adminDashboard: () => req<T.AdminDashboardResponse>('/admin/dashboard'),
  adminRequests: (status?: string) => req<T.AdminMaintenanceRequestResponse[]>(`/admin/maintenance-requests${status ? `?status=${status}` : ''}`),
  adminCustomers: () => req<T.AdminCustomerListItem[]>('/admin/customers'),
  adminVehicles: () => req<T.AdminVehicleListItem[]>('/admin/vehicles'),
  adminPayments: () => req<any[]>('/admin/payments'),
  adminReports: () => req<T.AdminReportResponse>('/admin/reports'),
}
FILE

# 10. UPDATE ROUTER TO CONNECT NEW PAGES
cat > src/router.tsx << 'FILE'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Dashboard from '@/pages/customer/Dashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminRequests from '@/pages/admin/AdminRequests'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminVehicles from '@/pages/admin/AdminVehicles'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminReports from '@/pages/admin/AdminReports'

function CustomerRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-brand">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'CUSTOMER') return <Navigate to="/admin" replace />
  return <CustomerLayout />
}

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-brand">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'WORKSHOP_ADMIN') return <Navigate to="/dashboard" replace />
  return <AdminLayout />
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <CustomerRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/requests', element: <AdminRequests /> },
      { path: '/admin/customers', element: <AdminCustomers /> },
      { path: '/admin/vehicles', element: <AdminVehicles /> },
      { path: '/admin/payments', element: <AdminPayments /> },
      { path: '/admin/reports', element: <AdminReports /> },
    ]
  }
])

export function AppRouter() { return <RouterProvider router={router} /> }
FILE

echo "All fixes applied and missing pages built."
