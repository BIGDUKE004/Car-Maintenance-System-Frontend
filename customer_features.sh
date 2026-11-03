#!/bin/bash
set -e

echo "Building customer request, details, and payment flows..."

# 1. UPDATE API CLIENT (Add missing customer endpoints)
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
FILE

# 2. RESTORE FOOTER ON LANDING PAGE
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 font-sans flex flex-col">
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

      <main className="flex-1">
        <section className="relative h-screen flex items-center pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {HERO_IMAGES.map((img, idx) => (
              <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeImage ? 'opacity-60' : 'opacity-0'}`} alt="Hero" />
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
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-24 bg-stone-950">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-12">Our Expertise</h2>
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
      </main>

      {/* FOOTER RESTORED */}
      <footer className="bg-stone-900 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="font-serif text-3xl font-bold text-white block mb-6">Motora<span className="text-brand">.</span></Link>
            <p className="text-stone-400 max-w-sm mb-8">
              Redefining the standard of vehicle maintenance. Digital records, transparent pricing, and uncompromising quality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><a href="#" className="hover:text-brand">Routine Maintenance</a></li>
              <li><a href="#" className="hover:text-brand">Brake Systems</a></li>
              <li><a href="#" className="hover:text-brand">Engine Diagnostics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><a href="#" className="hover:text-brand">About</a></li>
              <li><a href="#" className="hover:text-brand">Careers</a></li>
              <li><a href="#" className="hover:text-brand">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <div>© 2026 Motora Systems. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
FILE

# 3. UPDATE CUSTOMER DASHBOARD (Add Request & Pay Buttons)
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
        <div className="flex gap-4">
          <Link to="/payments"><Button className="bg-transparent border-stone-700"><Icon name="credit-card" className="w-4 h-4 mr-2 inline" /> Pay Balance</Button></Link>
          <Link to="/request-service"><Button className="px-6 py-4"><Icon name="wrench" className="w-4 h-4 mr-2 inline" /> Request Service</Button></Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => {
          const requests = car.requests || [];
          const nextService = requests.length > 0 ? requests[0].next_service_date : null;
          const totalBalance = requests.reduce((sum, r) => sum + Number(r.balance || 0), 0);

          return (
            <div key={car.id} className="group relative">
              <div className="h-64 relative overflow-hidden bg-stone-900 mb-6 rounded-xl">
                {car.image_url ? <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-stone-700 bg-stone-800">No Image Provided</div>}
                <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10 rounded">{car.plate_number}</div>
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

# 4. CREATE REQUEST SERVICE PAGE
cat > src/pages/customer/RequestService.tsx << 'FILE'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function RequestService() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  const [carId, setCarId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const mutation = useMutation({
    mutationFn: () => api.submitRequest({ car_id: carId, description, request_date: new Date().toISOString() }),
    onSuccess: () => nav('/dashboard'),
    onError: (err: any) => setError(err.message)
  })

  if (isLoading) return <div className="text-white">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white mb-2">Request Service</h1>
        <p className="text-stone-400">Describe the issue and we'll get your vehicle back on the road.</p>
      </div>

      {error && <div className="p-4 bg-brand/10 border border-brand text-brand text-sm rounded-xl">{error}</div>}

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Select Vehicle</label>
          <select 
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:ring-brand focus:border-brand outline-none"
            value={carId} 
            onChange={e => setCarId(e.target.value)} 
            required
          >
            <option value="" disabled>-- Choose a vehicle --</option>
            {cars?.map(c => <option key={c.id} value={c.id}>{c.year} {c.make} {c.model} ({c.plate_number})</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Issue Description</label>
          <textarea 
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white h-32 focus:ring-brand focus:border-brand outline-none"
            placeholder="E.g., The brakes are squeaking when I stop, and there's a vibration in the steering wheel..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={10}
          />
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full py-4 text-base">
          {mutation.isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
FILE

# 5. CREATE PAYMENTS PAGE
cat > src/pages/customer/Payments.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { ngn } from '@/lib/format'
import { Button } from '@/components/ds/Button'
import { Skeleton } from '@/components/ds/Skeleton'
import { useState } from 'react'

export default function Payments() {
  const { data: summary, isLoading } = useQuery({ queryKey: ['payment-summary'], queryFn: api.paymentSummary })
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const payService = async (serviceId: string) => {
    try {
      setLoadingId(serviceId)
      const res = await api.initializePayment({ maintenance_service_id: serviceId })
      window.location.href = res.authorization_url // Redirect to Paystack
    } catch (e: any) {
      alert(e.message)
      setLoadingId(null)
    }
  }

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white mb-2">Payments & Billing</h1>
        <p className="text-stone-400">View outstanding balances and pay securely via Paystack.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Billed</div>
          <div className="text-3xl font-mono text-white">{ngn(summary?.total_billed || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Paid</div>
          <div className="text-3xl font-mono text-green-400">{ngn(summary?.total_paid || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl border-brand/50">
          <div className="text-xs text-brand uppercase tracking-widest mb-2 font-bold">Outstanding</div>
          <div className="text-3xl font-mono text-brand">{ngn(summary?.outstanding_balance || 0)}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif text-white">Unpaid Services</h2>
        {summary?.unpaid_services.length === 0 ? (
          <div className="p-8 text-center text-stone-500 border border-white/5 bg-stone-900 rounded-xl">You have no outstanding balances.</div>
        ) : summary?.unpaid_services.map(srv => (
          <div key={srv.service_id} className="flex items-center justify-between p-6 bg-stone-900 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
            <div>
              <div className="text-white font-medium text-lg">{srv.name}</div>
              <div className="text-sm text-stone-500">Ref: {srv.maintenance_request_id.split('-')[0]}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xl font-mono text-white">{ngn(srv.balance)}</div>
              <Button onClick={() => payService(srv.service_id)} disabled={loadingId === srv.service_id}>
                {loadingId === srv.service_id ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
FILE

# 6. UPDATE ROUTER
cat > src/router.tsx << 'FILE'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Dashboard from '@/pages/customer/Dashboard'
import RequestService from '@/pages/customer/RequestService'
import Payments from '@/pages/customer/Payments'

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
      { path: '/request-service', element: <RequestService /> },
      { path: '/payments', element: <Payments /> },
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

# 7. ADD CREDIT CARD ICON
cat > src/components/ds/Icon.tsx << 'FILE'
export const Icon = ({ name, className = '' }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    car: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-8 5h5M5 18v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2m18 0v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2M3 15h18a2 2 0 002-2V9a2 2 0 00-2-2h-1.5l-1.2-2.4A2 2 0 0014.5 3h-5a2 2 0 00-1.8 1.6L6.5 7H5a2 2 0 00-2 2v4a2 2 0 002 2z" />,
    gauge: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />,
    'arrow-right': <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    flag: <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    'credit-card': <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
  }
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className}>{icons[name]}</svg>
}
FILE

echo "Customer workflows and footer restored."
