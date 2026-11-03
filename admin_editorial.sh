#!/bin/bash
set -e

echo "Building Dark Editorial Command Center..."

# 1. REVERT TAILWIND TO EDITORIAL
cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: { 950: '#0c0a09', 900: '#1c1917', 800: '#292524', 700: '#44403c', 600: '#57534e' },
        brand: { DEFAULT: '#ff4d00', hover: '#e64500', light: 'rgba(255, 77, 0, 0.1)' }, // Signal Orange
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 77, 0, 0.5)',
      }
    },
  },
  plugins: [],
} satisfies Config
FILE

# 2. FIX GLOBAL CSS
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
  .glass {
    background: rgba(28, 25, 23, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}
FILE

# 3. SLICK BUTTON COMPONENT
cat > src/components/ds/Button.tsx << 'FILE'
import { ButtonHTMLAttributes } from 'react'

export const Button = ({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  // Variant detection based on className
  const isGhost = className.includes('bg-transparent') || className.includes('border-stone')
  const isOutline = className.includes('border-brand') && !className.includes('bg-brand')
  
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-none disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs px-6 py-3"
  
  const primary = "bg-brand text-white hover:bg-brand-hover hover:shadow-glow active:scale-[0.98]"
  const outline = "border border-brand text-brand bg-brand-light hover:bg-brand hover:text-white active:scale-[0.98]"
  const ghost = "border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white active:scale-[0.98]"

  const styles = isGhost ? ghost : isOutline ? outline : primary

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}
FILE

# 4. REVERT APP SHELL TO DARK EDITORIAL
cat > src/components/layout/AppShell.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'
import { Icon } from '../ds/Icon'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isAdmin = user?.role === 'WORKSHOP_ADMIN'

  const adminNav = [
    { name: 'Overview', href: '/admin', icon: 'gauge' },
    { name: 'Requests', href: '/admin/requests', icon: 'wrench' },
    { name: 'Customers', href: '/admin/customers', icon: 'users' },
    { name: 'Vehicles', href: '/admin/vehicles', icon: 'car' },
    { name: 'Payments', href: '/admin/payments', icon: 'shield' },
  ]
  const customerNav = [
    { name: 'My Garage', href: '/dashboard', icon: 'car' }, 
    { name: 'History', href: '/history', icon: 'gauge' }
  ]
  const navItems = isAdmin ? adminNav : customerNav

  return (
    <div className="min-h-screen bg-stone-950 flex font-sans">
      <aside className="w-64 border-r border-white/5 bg-stone-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-serif text-3xl font-bold text-white tracking-tight">
            Motora<span className="text-brand">.</span>
          </Link>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && loc.pathname.startsWith(item.href))
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
            <div className="w-10 h-10 bg-stone-800 flex items-center justify-center text-sm font-bold text-white group-hover:bg-brand transition-colors">
              {initials(user?.first_name, user?.last_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate group-hover:text-brand transition-colors">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-stone-500 truncate uppercase tracking-wider mt-0.5">{user?.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-24 border-b border-white/5 bg-stone-950 flex items-center justify-between px-8 sticky top-0 z-40 bg-opacity-90 backdrop-blur">
          <div className="text-sm text-stone-400 uppercase tracking-widest font-semibold">
            {isAdmin ? 'Workshop Operations' : 'Client Portal'}
          </div>
          <div className="flex gap-6 items-center">
            <button onClick={logout} className="text-xs font-bold text-stone-500 hover:text-brand uppercase tracking-wider transition-colors">Sign out</button>
          </div>
        </header>

        <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>

        <footer className="border-t border-white/5 py-6 px-8 text-xs text-stone-600 flex justify-between">
          <div>© 2026 Motora Systems.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
FILE

# 5. SLICK EDITORIAL ADMIN DASHBOARD
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
      
      {/* HEADER */}
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden group">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-white mb-2">{ngn(data.statistics.total_revenue)}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-brand font-bold">↑ {data.statistics.completed_last_30_days}</span> jobs completed (30d)
          </div>
        </div>

        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden group">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Requests</div>
          <div className="text-3xl font-mono text-white mb-2">{data.statistics.total_requests}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-stone-300 font-bold">↑ {data.statistics.created_last_30_days}</span> new this month
          </div>
        </div>

        <Link to="/admin/requests?status=AWAITING_APPROVAL" className="bg-stone-900 border border-brand/30 hover:border-brand p-6 relative overflow-hidden group transition-colors block">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
             <Icon name="shield" className="w-20 h-20 text-brand" />
          </div>
          <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Awaiting Approval</div>
          <div className="text-3xl font-mono text-white mb-2">{data.awaiting_customer_approval.count}</div>
          <div className="text-xs text-stone-400">Clients need to approve estimates</div>
        </Link>

        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">System Alerts</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400">Failed emails</span>
              <span className={`font-mono ${data.notification_problems.failed_count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.notification_problems.failed_count}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400">Payment review</span>
              <span className={`font-mono ${data.payments_needing_review.count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.payments_needing_review.count}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-8">
        {/* MAIN QUEUE TABLE */}
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
                  <th className="p-4 font-medium">Issue</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pending_work.items.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">Queue is empty.</td></tr>
                ) : data.pending_work.items.slice(0, 5).map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white text-sm">{item.customer_name}</div>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                        <span className="font-mono text-brand border border-brand/20 bg-brand-light px-1.5 py-0.5">{item.plate_number}</span>
                        {item.vehicle}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-stone-400 max-w-[200px] truncate">{item.description}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'PENDING' ? 'border-stone-500 text-stone-300' :
                        item.status === 'ACCEPTED' ? 'border-blue-500/50 text-blue-400' :
                        item.status === 'INSPECTING' ? 'border-purple-500/50 text-purple-400' :
                        'border-brand/50 text-brand'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/requests/${item.id}`} className="inline-block border border-stone-700 text-stone-300 hover:bg-brand hover:border-brand hover:text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR ACTIVITY & QUICK ACTIONS */}
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/requests" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group">
                <span className="text-sm font-medium text-white group-hover:text-brand">View All Requests</span>
                <Icon name="arrow-right" className="w-4 h-4 text-stone-500 group-hover:text-brand" />
              </Link>
              <Link to="/admin/customers" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group">
                <span className="text-sm font-medium text-white group-hover:text-brand">Customer Directory</span>
                <Icon name="users" className="w-4 h-4 text-stone-500 group-hover:text-brand" />
              </Link>
              <Link to="/admin/payments" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group">
                <span className="text-sm font-medium text-white group-hover:text-brand">Payment Ledger</span>
                <Icon name="shield" className="w-4 h-4 text-stone-500 group-hover:text-brand" />
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Recent Activity</h2>
            <div className="bg-stone-900 border border-white/5 p-6 space-y-6">
              {data.recent_activity.slice(0, 4).map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />}
                  <div className={`w-6 h-6 border-2 border-stone-900 flex items-center justify-center shrink-0 z-10 ${
                    activity.status === 'COMPLETED' ? 'bg-brand' : 'bg-stone-700'
                  }`}>
                    {activity.status === 'COMPLETED' && <Icon name="check" className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">{activity.description}</div>
                    <div className="text-xs text-stone-400">{activity.customer_name}</div>
                    <div className="text-[10px] text-stone-600 font-mono uppercase mt-1">{dateTime(activity.occurred_at)}</div>
                  </div>
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

echo "Dark Command Center applied."
