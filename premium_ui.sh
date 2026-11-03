#!/bin/bash
set -e

echo "Applying premium UI..."

# 1. ADD ICON COMPONENT
cat > src/components/ds/Icon.tsx << 'FILE'
export const Icon = ({ name, className = '' }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    car: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-8 5h5M5 18v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2m18 0v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2M3 15h18a2 2 0 002-2V9a2 2 0 00-2-2h-1.5l-1.2-2.4A2 2 0 0014.5 3h-5a2 2 0 00-1.8 1.6L6.5 7H5a2 2 0 00-2 2v4a2 2 0 002 2z" />,
    gauge: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  }
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className}>
      {icons[name]}
    </svg>
  )
}
FILE

# 2. PREMIUM LANDING PAGE
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Icon } from '@/components/ds/Icon'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-900 text-slate-300 font-body selection:bg-cyan-500/30">
      {/* Nav */}
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-ink-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-2xl font-bold tracking-tighter text-white">
            <div className="w-3 h-3 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
          </div>
          <div className="flex gap-4">
            <Link to="/login"><Button className="bg-transparent text-white hover:bg-white/5 border-none">Log in</Button></Link>
            <Link to="/register"><Button className="bg-white text-ink-900 hover:bg-slate-200 border-none">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 object-center" alt="Mechanic" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Precision Engineering
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white leading-[1.05] tracking-tight mb-8">
              Your vehicle,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">fully documented.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Hand over the keys with absolute confidence. Transparent pricing, real-time status updates, and a complete digital service history for your peace of mind.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/register"><Button className="h-14 px-8 text-lg rounded-xl shadow-glow">Book a service</Button></Link>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Icon name="shield" className="w-5 h-5 text-teal-400" />
                Encrypted & secure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/5 bg-ink-950/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          <div><div className="text-3xl font-mono text-white mb-1">10+</div><div className="text-xs text-slate-500 uppercase tracking-widest">Years in operation</div></div>
          <div><div className="text-3xl font-mono text-white mb-1">5,000+</div><div className="text-xs text-slate-500 uppercase tracking-widest">Vehicles serviced</div></div>
          <div><div className="text-3xl font-mono text-white mb-1">100%</div><div className="text-xs text-slate-500 uppercase tracking-widest">Digital records</div></div>
          <div><div className="text-3xl font-mono text-white mb-1">OEM</div><div className="text-xs text-slate-500 uppercase tracking-widest">Parts guarantee</div></div>
        </div>
      </section>
    </div>
  )
}
FILE

# 3. PREMIUM CUSTOMER DASHBOARD
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
  
  if (isLoading) return <div className="p-8 space-y-8 max-w-6xl mx-auto pt-24"><Skeleton className="h-64 rounded-3xl" /></div>

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 pt-24 space-y-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display text-white mb-2">My Garage</h1>
          <p className="text-slate-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <Button className="h-12 px-6 flex items-center gap-2">
          <Icon name="car" className="w-5 h-5" /> Add Vehicle
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {cars?.map(car => (
          <div key={car.id} className="group relative rounded-3xl bg-surface-900 border border-white/5 overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-10px_rgba(56,225,255,0.15)] flex flex-col">
            {/* Image Area */}
            <div className="h-56 relative overflow-hidden bg-ink-950">
              {car.image_url ? (
                <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-800 to-ink-950 flex items-center justify-center">
                  <Icon name="car" className="w-24 h-24 text-white/5" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                  <div className="text-cyan-400 font-mono text-sm tracking-widest mb-1">{car.plate_number}</div>
                  <h3 className="text-2xl font-display text-white">{car.year} {car.make} {car.model}</h3>
                </div>
              </div>
            </div>

            {/* Data Area */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Next Service</div>
                  <div className="text-white font-mono flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {date(car.requests[0]?.next_service_date) || 'Not scheduled'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Outstanding Balance</div>
                  <div className={`font-mono text-lg ${car.requests.some(r => Number(r.balance) > 0) ? 'text-amber-400' : 'text-slate-300'}`}>
                    {ngn(car.requests.reduce((s, r) => s + Number(r.balance), 0))}
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-medium text-slate-300">
                    {car.requests.length > 0 ? car.requests[0].status.replace('_', ' ') : 'No active requests'}
                  </span>
                </div>
                <Link to={`/vehicle/${car.id}`}>
                  <Button className="bg-surface-800 hover:bg-surface-700 text-white border-none text-sm py-2">View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {cars?.length === 0 && (
          <div className="col-span-2 text-center p-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <Icon name="car" className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No vehicles in your garage</h3>
            <p className="text-slate-400 mb-6">Add your first vehicle to start tracking maintenance.</p>
            <Button>Add Vehicle</Button>
          </div>
        )}
      </div>
    </div>
  )
}
FILE

# 4. FIX THE SHELL TO MATCH
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

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col font-body">
      <header className="h-20 border-b border-white/5 bg-ink-950/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-display font-bold text-2xl tracking-tighter text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-cyan-400 rotate-45" /> MOTORA
            </Link>
            <nav className="hidden md:flex gap-2">
              {isAdmin ? (
                <>
                  <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === '/admin' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Overview</Link>
                  <Link to="/admin/requests" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname.startsWith('/admin/requests') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Requests</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname.startsWith('/dashboard') || loc.pathname.startsWith('/vehicle') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>My Garage</Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-white font-medium">{user?.first_name} {user?.last_name}</div>
                <div className="text-xs text-cyan-400 font-mono tracking-wider uppercase">{user?.role.replace('_', ' ')}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300">
                {initials(user?.first_name, user?.last_name)}
              </div>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-white transition-colors" title="Sign out">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-20"><Outlet /></main>
    </div>
  )
}
FILE

echo "Premium UI applied successfully."
