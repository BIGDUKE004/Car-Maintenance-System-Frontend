#!/bin/bash
set -e

echo "Building professional marketing site and app shell..."

# 1. THE LANDING PAGE (Full Marketing Site)
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Icon } from '@/components/ds/Icon'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-300 font-body selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-ink-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tighter text-white">
              <div className="w-3 h-3 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
            </Link>
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">Log in</Link>
            <Link to="/register"><Button className="bg-white text-ink-900 hover:bg-slate-200 border-none rounded-lg px-6">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover opacity-30 object-center" alt="Mechanic inspecting engine" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Premium Vehicle Care
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight mb-6">
              Your vehicle,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">fully documented.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Hand over the keys with absolute confidence. Transparent pricing, real-time status updates, and a complete digital service history for your peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register" className="w-full sm:w-auto"><Button className="w-full h-14 px-8 text-lg rounded-xl shadow-[0_0_30px_-5px_rgba(56,225,255,0.4)] bg-cyan-500 hover:bg-cyan-400 text-ink-950 font-semibold border-none">Book a service</Button></Link>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Icon name="shield" className="w-5 h-5 text-teal-400" /> Encrypted & secure
              </div>
            </div>
          </div>
          
          {/* Floating UI Panel */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-3xl rounded-full" />
            <div className="relative glass p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><Icon name="wrench" className="w-5 h-5" /></div>
                  <div>
                    <div className="text-white font-medium">Service in Progress</div>
                    <div className="text-xs text-slate-400">Request #REQ-4092</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">Live</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="text-white font-mono">2022 Toyota Camry</span>
                </div>
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-slate-400">Next Service</span>
                  <span className="text-white font-mono">Dec 15, 2026</span>
                </div>
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-slate-400">Estimated Cost</span>
                  <span className="text-cyan-400 font-mono">₦85,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-white/5 bg-ink-900">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          <div><div className="text-4xl font-mono text-white mb-2">10+</div><div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Years in operation</div></div>
          <div><div className="text-4xl font-mono text-white mb-2">5,000+</div><div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Vehicles serviced</div></div>
          <div><div className="text-4xl font-mono text-white mb-2">100%</div><div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Digital records</div></div>
          <div><div className="text-4xl font-mono text-white mb-2">OEM</div><div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Parts guarantee</div></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-ink-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">How it works</h2>
            <p className="text-lg text-slate-400">Three simple steps to hand over your keys with absolute confidence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Submit Request', desc: 'Describe the issue. We instantly generate a digital intake record for your vehicle.', icon: 'car' },
              { step: '02', title: 'Approve Estimate', desc: 'Our technicians inspect the vehicle and send you a transparent, itemized estimate on your dashboard.', icon: 'gauge' },
              { step: '03', title: 'Track & Pay', desc: 'Monitor progress in real-time, view before/after photos, and pay securely online.', icon: 'check' },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-3xl bg-surface-900 border border-white/5 hover:border-cyan-500/30 transition-colors group">
                <div className="text-6xl font-display font-bold text-white/5 absolute top-6 right-6 group-hover:text-cyan-500/10 transition-colors">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
                  <Icon name={item.icon} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 bg-ink-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-12 text-center">Trusted by thousands</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'David A.', car: '2021 BMW X5', text: 'The real-time updates are a game changer. I knew exactly when my car was being inspected and approved the extra brake work right from my phone.' },
              { name: 'Sarah M.', car: '2019 Honda Accord', text: 'No more shady mechanics. The itemized estimates and before/after photos make the entire process completely transparent.' },
              { name: 'James O.', car: '2023 Toyota Camry', text: 'Handing over the keys used to be stressful. Now I just open the app, see the timeline, and know my service history is permanently documented.' },
            ].map((r, i) => (
              <div key={i} className="p-8 rounded-3xl bg-ink-950 border border-white/5">
                <div className="flex gap-1 text-cyan-400 mb-6">
                  {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-slate-300 mb-8 italic">"{r.text}"</p>
                <div>
                  <div className="font-semibold text-white">{r.name}</div>
                  <div className="text-sm text-slate-500">{r.car}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink-950 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tighter text-white mb-6">
              <div className="w-3 h-3 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
            </Link>
            <p className="text-slate-400 max-w-sm mb-6">
              The premium standard for vehicle maintenance. Transparent pricing, real-time updates, and a digital service history you actually own.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Icon name="shield" className="w-5 h-5" /> End-to-end encrypted data
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400">Routine Maintenance</a></li>
              <li><a href="#" className="hover:text-cyan-400">Brake Systems</a></li>
              <li><a href="#" className="hover:text-cyan-400">Engine Diagnostics</a></li>
              <li><a href="#" className="hover:text-cyan-400">Tire Balancing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>© 2026 Motora Systems. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
FILE

# 2. PROFESSIONAL APP SHELL (Sidebar layout)
cat > src/components/layout/AppShell.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '../ds/Button'
import { initials } from '@/lib/format'
import { Icon } from '../ds/Icon'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isAdmin = user?.role === 'WORKSHOP_ADMIN'

  const customerNav = [
    { name: 'My Garage', href: '/dashboard', icon: 'car' },
    { name: 'Service History', href: '/history', icon: 'gauge' },
  ]
  const adminNav = [
    { name: 'Overview', href: '/admin', icon: 'gauge' },
    { name: 'Requests', href: '/admin/requests', icon: 'wrench' },
    { name: 'Customers', href: '/admin/customers', icon: 'shield' },
  ]
  const navItems = isAdmin ? adminNav : customerNav

  return (
    <div className="min-h-screen bg-ink-950 flex font-body">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-ink-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-display font-bold text-2xl tracking-tighter text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Menu</div>
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && loc.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* PROFILE / LOGOUT */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={logout}>
            <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300">
              {initials(user?.first_name, user?.last_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* MOBILE HEADER */}
        <header className="h-16 border-b border-white/5 bg-ink-900 flex md:hidden items-center justify-between px-6">
          <Link to="/" className="font-display font-bold text-xl tracking-tighter text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
          </Link>
          <div className="text-sm font-medium text-white">{user?.first_name}</div>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>

        {/* APP FOOTER */}
        <footer className="border-t border-white/5 py-6 px-10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-4">
          <div>© 2026 Motora Systems. End-to-end encrypted.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Help Center</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
FILE

# 3. FIX ROUTER TO HANDLE NEW PATHS
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
  if (loading) return <div className="min-h-screen bg-ink-950 flex items-center justify-center text-cyan-400">Loading...</div>
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
        { path: '/history', element: <div className="p-8 text-white">Service History</div> },
        { path: '/admin', element: <AdminDashboard /> },
        { path: '/admin/requests', element: <div className="p-8 text-white">Requests Dashboard</div> },
        { path: '/admin/customers', element: <div className="p-8 text-white">Customers List</div> },
      ]
    }]
  }
])

export function AppRouter() { return <RouterProvider router={router} /> }
FILE

echo "Professional layout applied."
