#!/bin/bash
set -e

echo "Rebuilding with strict role separation..."

# 1. RESET CSS & CONFIG (Editorial Theme)
cat > src/index.css << 'FILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-stone-950 text-stone-300 antialiased; font-feature-settings: "tnum" 1; }
  :focus-visible { @apply outline-none ring-2 ring-brand ring-offset-2 ring-offset-stone-950 rounded; }
  ::selection { background: rgba(255, 77, 0, 0.3); }
}
@layer utilities {
  .text-tabular { font-variant-numeric: tabular-nums; }
}
FILE

cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: { 950: '#0c0a09', 900: '#1c1917', 800: '#292524', 700: '#44403c' },
        brand: { DEFAULT: '#ff4d00', hover: '#e64500', light: 'rgba(255, 77, 0, 0.1)' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 77, 0, 0.4)',
      }
    },
  },
  plugins: [],
} satisfies Config
FILE

# 2. SLICK BUTTONS
cat > src/components/ds/Button.tsx << 'FILE'
import { ButtonHTMLAttributes } from 'react'
export const Button = ({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const isGhost = className.includes('bg-transparent')
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-none disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs px-6 py-3"
  const primary = "bg-brand text-white hover:bg-brand-hover hover:shadow-glow active:scale-[0.98]"
  const ghost = "border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white active:scale-[0.98]"
  return <button className={`${base} ${isGhost ? ghost : primary} ${className}`} {...props}>{children}</button>
}
FILE

# 3. ICON COMPONENT (Comprehensive Set)
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
  }
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className}>{icons[name]}</svg>
}
FILE

# 4. SEPARATE CUSTOMER SHELL
cat > src/components/layout/CustomerLayout.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'
import { Icon } from '../ds/Icon'

export function CustomerLayout() {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const navItems = [
    { name: 'My Garage', href: '/dashboard', icon: 'car' }, 
    { name: 'Service History', href: '/history', icon: 'gauge' }
  ]

  return (
    <div className="min-h-screen bg-stone-950 flex font-sans">
      <aside className="w-64 border-r border-white/5 bg-stone-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link to="/dashboard" className="font-serif text-3xl font-bold text-white tracking-tight">Motora<span className="text-brand">.</span></Link>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map(item => {
            const active = loc.pathname === item.href
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-brand-light text-brand border-l-2 border-brand' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-brand' : 'text-stone-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={logout}>
            <div className="w-10 h-10 bg-stone-800 flex items-center justify-center text-sm font-bold text-white group-hover:bg-brand transition-colors">{initials(user?.first_name, user?.last_name)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate group-hover:text-brand transition-colors">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-stone-500 truncate uppercase tracking-wider mt-0.5">Client Account</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-24 border-b border-white/5 bg-stone-950 flex items-center justify-between px-8 sticky top-0 z-40 bg-opacity-90 backdrop-blur">
          <div className="text-sm text-stone-400 uppercase tracking-widest font-semibold">Client Portal</div>
          <button onClick={logout} className="text-xs font-bold text-stone-500 hover:text-brand uppercase tracking-wider transition-colors">Sign out</button>
        </header>
        <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full"><Outlet /></div>
      </main>
    </div>
  )
}
FILE

# 5. SEPARATE ADMIN SHELL
cat > src/components/layout/AdminLayout.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'
import { Icon } from '../ds/Icon'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const navItems = [
    { name: 'Command Center', href: '/admin', icon: 'gauge' },
    { name: 'Work Queue', href: '/admin/requests', icon: 'wrench' },
    { name: 'Customers', href: '/admin/customers', icon: 'users' },
    { name: 'Vehicles', href: '/admin/vehicles', icon: 'car' },
    { name: 'Payments', href: '/admin/payments', icon: 'shield' },
    { name: 'Reports', href: '/admin/reports', icon: 'chart' },
  ]

  return (
    <div className="min-h-screen bg-stone-950 flex font-sans">
      <aside className="w-64 border-r border-white/5 bg-stone-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link to="/admin" className="font-serif text-3xl font-bold text-white tracking-tight">Motora<span className="text-brand">.</span></Link>
          <div className="ml-2 text-[10px] uppercase tracking-widest text-brand font-bold border border-brand px-1.5 py-0.5">Admin</div>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && loc.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-brand-light text-brand border-l-2 border-brand' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-brand' : 'text-stone-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={logout}>
            <div className="w-10 h-10 bg-stone-800 flex items-center justify-center text-sm font-bold text-white group-hover:bg-brand transition-colors">{initials(user?.first_name, user?.last_name)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate group-hover:text-brand transition-colors">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-stone-500 truncate uppercase tracking-wider mt-0.5">Workshop Admin</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-24 border-b border-white/5 bg-stone-950 flex items-center justify-between px-8 sticky top-0 z-40 bg-opacity-90 backdrop-blur">
          <div className="text-sm text-stone-400 uppercase tracking-widest font-semibold">Workshop Operations</div>
          <button onClick={logout} className="text-xs font-bold text-stone-500 hover:text-brand uppercase tracking-wider transition-colors">Sign out</button>
        </header>
        <div className="flex-1 p-8 md:p-12 max-w-[1400px] mx-auto w-full"><Outlet /></div>
      </main>
    </div>
  )
}
FILE

# 6. ROUTER WITH STRICT ROLE GUARDS
cat > src/router.tsx << 'FILE'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Dashboard from '@/pages/customer/Dashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'

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
      { path: '/history', element: <div className="p-8 text-white">History</div> },
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/requests', element: <div className="p-8 text-white">Requests</div> },
      { path: '/admin/customers', element: <div className="p-8 text-white">Customers</div> },
      { path: '/admin/vehicles', element: <div className="p-8 text-white">Vehicles</div> },
      { path: '/admin/payments', element: <div className="p-8 text-white">Payments</div> },
      { path: '/admin/reports', element: <div className="p-8 text-white">Reports</div> },
    ]
  }
])

export function AppRouter() { return <RouterProvider router={router} /> }
FILE

# 7. ADMIN DASHBOARD (Command Center)
cat > src/pages/admin/AdminDashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date, dateTime } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ds/Icon'
import { Button } from '@/components/ds/Button'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dash'], queryFn: api.adminDashboard })
  
  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /><Skeleton className="h-96" /></div>
  if (!data) return null

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="text-brand text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> Live Workshop
          </div>
          <h1 className="text-5xl font-serif text-white mb-2">Command Center</h1>
          <p className="text-stone-400 text-lg">Manage active jobs, approvals, and revenue.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/reports"><Button className="bg-transparent border-stone-700">Export Report</Button></Link>
          <Link to="/admin/requests"><Button>New Request</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-white mb-2">{ngn(data.statistics.total_revenue)}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1"><span className="text-brand font-bold">↑ {data.statistics.completed_last_30_days}</span> jobs completed</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Requests</div>
          <div className="text-3xl font-mono text-white mb-2">{data.statistics.total_requests}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1"><span className="text-stone-300 font-bold">↑ {data.statistics.created_last_30_days}</span> new this month</div>
        </div>
        <Link to="/admin/requests" className="bg-stone-900 border border-brand/30 hover:border-brand p-6 group transition-colors block">
          <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Awaiting Approval</div>
          <div className="text-3xl font-mono text-white mb-2">{data.awaiting_customer_approval.count}</div>
          <div className="text-xs text-stone-400">Clients need to approve</div>
        </Link>
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">System Alerts</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-sm"><span className="text-stone-400">Failed emails</span><span className={`font-mono ${data.notification_problems.failed_count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.notification_problems.failed_count}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-stone-400">Payment review</span><span className={`font-mono ${data.payments_needing_review.count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.payments_needing_review.count}</span></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-serif text-white">Work Queue</h2>
            <Link to="/admin/requests" className="text-xs font-bold text-brand uppercase tracking-wider border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">View All</Link>
          </div>
          <div className="bg-stone-900 border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Customer & Vehicle</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pending_work.items.slice(0, 5).map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white text-sm">{item.customer_name}</div>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                        <span className="font-mono text-brand border border-brand/20 bg-brand-light px-1.5 py-0.5">{item.plate_number}</span>{item.vehicle}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${item.status === 'PENDING' ? 'border-stone-500 text-stone-300' : 'border-brand/50 text-brand'}`}>{item.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/requests/${item.id}`} className="inline-block border border-stone-700 text-stone-300 hover:bg-brand hover:border-brand hover:text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/requests" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">View All Requests</span><Icon name="arrow-right" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
              <Link to="/admin/customers" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">Customer Directory</span><Icon name="users" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
              <Link to="/admin/payments" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">Payment Ledger</span><Icon name="shield" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Recent Activity</h2>
            <div className="bg-stone-900 border border-white/5 p-6 space-y-6">
              {data.recent_activity.slice(0, 4).map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />}
                  <div className={`w-6 h-6 border-2 border-stone-900 flex items-center justify-center shrink-0 z-10 ${activity.status === 'COMPLETED' ? 'bg-brand' : 'bg-stone-700'}`}>{activity.status === 'COMPLETED' && <Icon name="check" className="w-3 h-3 text-white" />}</div>
                  <div><div className="text-sm font-medium text-white mb-1">{activity.description}</div><div className="text-xs text-stone-400">{activity.customer_name}</div><div className="text-[10px] text-stone-600 font-mono uppercase mt-1">{dateTime(activity.occurred_at)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
FILE

# 8. UPDATE CUSTOMER DASHBOARD
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
        <Button className="bg-brand text-white hover:bg-brand-hover border-none px-6 py-4"><Icon name="plus" className="w-4 h-4 mr-2 inline" /> Add Vehicle</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => (
          <div key={car.id} className="group relative">
            <div className="h-64 relative overflow-hidden bg-stone-900 mb-6">
              {car.image_url ? <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-stone-700">No Image</div>}
              <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10">{car.plate_number}</div>
            </div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-serif text-white mb-1">{car.year} {car.make} {car.model}</h3>
                <div className="text-sm text-stone-500 uppercase tracking-wider">VIN: {car.vin}</div>
              </div>
              <Link to={`/vehicle/${car.id}`} className="text-brand text-sm font-bold uppercase tracking-wider border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">Details</Link>
            </div>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
              <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Next Service</div><div className="text-white font-mono text-lg">{date(car.requests[0]?.next_service_date) || 'Not scheduled'}</div></div>
              <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Outstanding</div><div className={`font-mono text-lg ${car.requests.some(r => Number(r.balance) > 0) ? 'text-brand' : 'text-stone-300'}`}>{ngn(car.requests.reduce((s, r) => s + Number(r.balance), 0))}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
FILE

echo "Master rebuild complete. Roles separated."
