#!/bin/bash
set -e

echo "Building Corporate Light Mode Dashboard..."

# 1. UPDATE TAILWIND FOR LIGHT MODE APP
cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // App UI Colors (Light Mode)
        app: { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0' },
        // Sidebar Colors (Dark)
        sidebar: { bg: '#0f172a', text: '#94a3b8', active: '#1e293b' },
        // Accent Colors
        primary: { DEFAULT: '#2563eb', hover: '#1d4ed8' },
        // Status Colors
        status: {
          pending: '#f59e0b', // Amber
          inspecting: '#3b82f6', // Blue
          progress: '#10b981', // Green
          completed: '#8b5cf6', // Purple
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
} satisfies Config
FILE

# 2. UPDATE INDEX HTML (Add Poppins for the headers)
cat > index.html << 'FILE'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Motora — Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-app-bg text-slate-800 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
FILE

# 3. REBUILD APP SHELL (Dark Sidebar, Light Content)
cat > src/components/layout/AppShell.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Icon } from '../ds/Icon'
import { initials } from '@/lib/format'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isAdmin = user?.role === 'WORKSHOP_ADMIN'

  const navItems = isAdmin ? [
    { name: 'Dashboard', href: '/admin', icon: 'gauge' },
    { name: 'Maintenance Requests', href: '/admin/requests', icon: 'wrench' },
    { name: 'Payments', href: '/admin/payments', icon: 'shield' },
    { name: 'Notifications', href: '/admin/notifications', icon: 'bell' },
    { name: 'Customers', href: '/admin/customers', icon: 'user' },
    { name: 'Vehicles', href: '/admin/vehicles', icon: 'car' },
    { name: 'Maintenance Images', href: '/admin/images', icon: 'image' },
    { name: 'Administrators', href: '/admin/admins', icon: 'users' },
    { name: 'Reports', href: '/admin/reports', icon: 'chart' },
    { name: 'Settings', href: '/admin/settings', icon: 'settings' },
  ] : [
    { name: 'My Garage', href: '/dashboard', icon: 'car' },
    { name: 'Service History', href: '/history', icon: 'gauge' },
  ]

  return (
    <div className="min-h-screen bg-app-bg flex font-sans">
      
      {/* DARK SIDEBAR */}
      <aside className="w-64 bg-sidebar-bg flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex flex-col">
            <div className="flex items-center gap-2 text-white font-display font-bold text-2xl tracking-tight">
              <Icon name="car" className="w-8 h-8 text-white" /> Motora
            </div>
            <div className="text-[10px] text-sidebar-text uppercase tracking-widest mt-1 ml-10">Drive with Confidence</div>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && loc.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-sidebar-active text-white border-l-4 border-primary' : 'text-sidebar-text hover:text-white hover:bg-slate-800'}`}>
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                {item.name}
                {item.name === 'Notifications' && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>}
              </Link>
            )
          })}
        </div>

        {/* ADMIN PROFILE BOTTOM */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white relative">
              {initials(user?.first_name, user?.last_name)}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-sidebar-bg rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-sidebar-text truncate">Motora Workshop</div>
            </div>
          </div>
          <button onClick={logout} className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-sidebar-text hover:text-white transition-colors">
            <Icon name="arrow-right" className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-app-border flex items-center justify-between px-8 sticky top-0 z-40">
          {/* Search Bar */}
          <div className="relative w-96">
            <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search requests, customers, or vehicles..." className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-slate-800">
              <Icon name="bell" className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">3</span>
            </button>
            <div className="flex items-center gap-3 border-l border-app-border pl-6">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white">
                {initials(user?.first_name, user?.last_name)}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-slate-800 leading-tight">Admin</div>
                <div className="text-slate-500 text-xs flex items-center gap-1">Admin <Icon name="chevron-down" className="w-3 h-3" /></div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
FILE

# 4. REBUILD ADMIN DASHBOARD
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
  
  if (isLoading) return <div className="space-y-6"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-slate-800 flex items-center gap-2">Welcome back, Admin 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your workshop today.</p>
        </div>
        <div className="bg-white border border-app-border px-4 py-2 rounded-lg text-sm text-slate-600 flex items-center gap-2 font-medium shadow-sm">
          <Icon name="calendar" className="w-4 h-4" /> {date(new Date().toISOString())}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Requests', val: data.pending_work.count, icon: 'wrench', color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'In Progress', val: data.statistics.by_status['IN_PROGRESS'] || 0, icon: 'check-circle', color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Awaiting Approval', val: data.awaiting_customer_approval.count, icon: 'clock', color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Completed', val: data.statistics.by_status['COMPLETED'] || 0, icon: 'flag', color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-app-border shadow-card flex items-center gap-5 relative group">
            <div className={`w-14 h-14 rounded-full ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
              <Icon name={kpi.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</div>
              <div className="text-3xl font-display font-bold text-slate-800">{kpi.val}</div>
            </div>
            <Link to="/admin/requests" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 group-hover:text-primary transition-colors">
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* HERO BANNER */}
      <div className="bg-sidebar-bg rounded-2xl p-8 flex items-center justify-between relative overflow-hidden shadow-lg mt-8">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar-bg via-sidebar-bg/90 to-transparent z-10" />
        {/* Background Image (Car) */}
        <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2070&auto=format&fit=crop" className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60 mix-blend-luminosity" alt="Car" />
        
        <div className="relative z-20 max-w-lg">
          <div className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Motora Auto Service</div>
          <h2 className="text-3xl font-display font-bold text-white leading-tight mb-2">Keep Your Vehicle in<br/>Top Condition</h2>
          <p className="text-slate-300 text-sm mb-6">Professional. Reliable. Always Moving Forward.</p>
          <Button className="bg-white text-sidebar-bg hover:bg-slate-100 rounded-full px-6 py-2 text-sm font-semibold">View Maintenance Requests →</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* RECENT REQUESTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-app-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-app-border flex justify-between items-center">
            <h2 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
              <Icon name="car" className="w-5 h-5 text-slate-400" /> Recent Maintenance Requests
            </h2>
            <Link to="/admin/requests" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">View All <Icon name="arrow-right" className="w-4 h-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Vehicle</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Request Date</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {data.pending_work.items.slice(0, 4).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                          {item.customer_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="font-medium text-slate-800 text-sm">{item.customer_name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-800 font-medium">{item.vehicle}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{item.plate_number}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate">{item.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        item.status === 'INSPECTING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        item.status === 'IN_PROGRESS' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-800">{date(item.request_date)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">9:16 PM</div>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/requests/${item.id}`} className="inline-block bg-sidebar-bg text-white hover:bg-slate-800 px-4 py-1.5 rounded-md text-xs font-medium transition-colors">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-app-border shadow-card p-5">
            <h2 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Icon name="wrench" className="w-5 h-5 text-slate-400" /> Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/admin/requests" className="w-full flex items-center gap-3 px-4 py-3 bg-sidebar-bg text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                <Icon name="wrench" className="w-4 h-4" /> View All Requests
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-app-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                <Icon name="user" className="w-4 h-4 text-slate-400" /> Add Administrator
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-app-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                <Icon name="image" className="w-4 h-4 text-slate-400" /> Upload Image
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-app-border shadow-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                <Icon name="bell" className="w-5 h-5 text-slate-400" /> Notifications
              </h2>
              <button className="text-xs font-semibold text-primary hover:underline">View All →</button>
            </div>
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                 <div>
                   <div className="text-sm text-slate-700">Payment requires review</div>
                   <div className="text-[10px] text-slate-400 mt-1">2 mins ago</div>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                 <div>
                   <div className="text-sm text-slate-700">New maintenance request</div>
                   <div className="text-[10px] text-slate-400 mt-1">5 mins ago</div>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                 <div>
                   <div className="text-sm text-slate-700">Email delivery failed</div>
                   <div className="text-[10px] text-slate-400 mt-1">12 mins ago</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS OVERVIEW BAR */}
      <div className="bg-white rounded-xl border border-app-border shadow-card p-5 mt-8 flex items-center justify-between">
         <h2 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2 shrink-0">
           <Icon name="settings" className="w-5 h-5 text-slate-400" /> Maintenance Status Overview
         </h2>
         
         <div className="flex-1 flex justify-center items-center gap-0 max-w-3xl ml-8 relative">
           {/* Line */}
           <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-100 z-0" />
           
           {['PENDING', 'ACCEPTED', 'INSPECTING', 'IN_PROGRESS', 'COMPLETED'].map((s, i) => (
             <div key={s} className="flex-1 flex flex-col items-center relative z-10">
               <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-2 shadow-sm">
                 <Icon name="check" className="w-4 h-4" />
               </div>
               <div className="text-xs font-semibold text-slate-600 capitalize">{s.replace('_', ' ')}</div>
             </div>
           ))}
         </div>

         <div className="flex gap-8 shrink-0 pl-8 border-l border-app-border">
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><Icon name="calendar" className="w-3 h-3"/> Total Requests</div>
              <div className="text-2xl font-mono text-slate-800">{data.statistics.total_requests}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><Icon name="chart" className="w-3 h-3 text-green-500"/> Completion Rate</div>
              <div className="text-2xl font-mono text-slate-800">93%</div>
            </div>
         </div>
      </div>

    </div>
  )
}
FILE

# 5. UPDATE ICON COMPONENT (Add missing icons)
cat > src/components/ds/Icon.tsx << 'FILE'
export const Icon = ({ name, className = '' }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    car: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-8 5h5M5 18v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2m18 0v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2M3 15h18a2 2 0 002-2V9a2 2 0 00-2-2h-1.5l-1.2-2.4A2 2 0 0014.5 3h-5a2 2 0 00-1.8 1.6L6.5 7H5a2 2 0 00-2 2v4a2 2 0 002 2z" />,
    gauge: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    'check-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
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
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className}>
      {icons[name]}
    </svg>
  )
}
FILE

echo "Corporate Dashboard applied."
