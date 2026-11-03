#!/bin/bash
set -e

echo "Applying sharp new UI..."

# 1. UPDATE TAILWIND CONFIG (Sharper Colors)
cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: { 950: '#080B14', 900: '#0F1422', 800: '#171E30' },
        brand: { DEFAULT: '#6366F1', hover: '#4F46E5' }, // Electric Indigo
        accent: { DEFAULT: '#2DD4BF', hover: '#14B8A6' }, // Teal
        surface: { DEFAULT: '#0F1422', light: '#171E30' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 40px -10px rgba(99, 102, 241, 0.4)',
        'glow-accent': '0 0 40px -10px rgba(45, 212, 191, 0.4)',
      }
    },
  },
  plugins: [],
} satisfies Config
FILE

# 2. UPDATE INDEX CSS
cat > src/index.css << 'FILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-base-950 text-slate-300 antialiased; font-feature-settings: "tnum" 1; }
  :focus-visible { @apply outline-none ring-2 ring-brand ring-offset-2 ring-offset-base-950 rounded; }
  ::selection { background: rgba(99, 102, 241, 0.3); }
}

@layer utilities {
  .text-tabular { font-variant-numeric: tabular-nums; }
  .glass {
    background: rgba(15, 20, 34, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}
FILE

# 3. UPDATE BUTTON COMPONENT
cat > src/components/ds/Button.tsx << 'FILE'
import { ButtonHTMLAttributes } from 'react'
export const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`bg-brand text-white hover:bg-brand-hover shadow-glow-brand active:scale-95 transition-all px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:pointer-events-none ${className}`} {...props} />
)
FILE

# 4. PREMIUM SPLIT-SCREEN LOGIN
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
    } catch (e: any) { setErr(e.message || 'Login failed. Check your credentials.') }
  }

  return (
    <div className="min-h-screen flex bg-base-950">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Car interior" />
        <div className="absolute inset-0 bg-gradient-to-r from-base-950/80 via-base-950/40 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="text-4xl font-serif text-white mb-4">Precision in every detail.</h2>
          <p className="text-slate-300 text-lg">Log in to track your vehicle's service history, approve work, and manage your fleet.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="text-2xl font-serif font-bold text-white block mb-12">Motora<span className="text-brand">.</span></Link>
          
          <h1 className="text-3xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-8">Enter your details to access your garage.</p>

          {err && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-base-900 border-slate-700/50 h-12" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-base-900 border-slate-700/50 h-12" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg mt-4">Sign In</Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-brand hover:text-brand-hover font-medium ml-1">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
FILE

# 5. PREMIUM SPLIT-SCREEN REGISTER
cat > src/pages/public/Register.tsx << 'FILE'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen flex items-center justify-center bg-base-950 p-6">
      <div className="glass p-12 rounded-3xl w-full max-w-md text-center shadow-glow-brand">
        <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-2xl text-white font-semibold mb-2">Check your email</h2>
        <p className="text-slate-400 mb-8">{msg}</p>
        <Link to="/login"><Button className="w-full">Back to login</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-base-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Luxury car" />
        <div className="absolute inset-0 bg-gradient-to-r from-base-950/80 via-base-950/40 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="text-4xl font-serif text-white mb-4">Join the standard.</h2>
          <p className="text-slate-300 text-lg">Create an account to start documenting your vehicle's maintenance.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="text-2xl font-serif font-bold text-white block mb-12">Motora<span className="text-brand">.</span></Link>
          
          <h1 className="text-3xl font-semibold text-white mb-2">Create an account</h1>
          <p className="text-slate-400 mb-8">Enter your details to get started.</p>

          {err && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">First name</label>
                <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required className="bg-base-900 border-slate-700/50 h-12" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Last name</label>
                <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required className="bg-base-900 border-slate-700/50 h-12" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email address</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="bg-base-900 border-slate-700/50 h-12" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone number</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="bg-base-900 border-slate-700/50 h-12" placeholder="080 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={10} className="bg-base-900 border-slate-700/50 h-12" placeholder="Minimum 10 characters" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg mt-4">Create account</Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-brand hover:text-brand-hover font-medium ml-1">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
FILE

# 6. UPDATE THE APP SHELL TO MATCH NEW COLORS
cat > src/components/layout/AppShell.tsx << 'FILE'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'
import { Icon } from '../ds/Icon'

export function AppShell() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const isAdmin = user?.role === 'WORKSHOP_ADMIN'

  const customerNav = [{ name: 'My Garage', href: '/dashboard', icon: 'car' }, { name: 'History', href: '/history', icon: 'gauge' }]
  const adminNav = [{ name: 'Overview', href: '/admin', icon: 'gauge' }, { name: 'Requests', href: '/admin/requests', icon: 'wrench' }]
  const navItems = isAdmin ? adminNav : customerNav

  return (
    <div className="min-h-screen bg-base-950 flex font-sans">
      <aside className="w-64 border-r border-white/5 bg-base-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-serif text-2xl font-bold text-white">
            Motora<span className="text-brand">.</span>
          </Link>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && loc.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-brand/10 text-brand border-l-2 border-brand' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-brand' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={logout}>
            <div className="w-10 h-10 bg-base-800 flex items-center justify-center text-sm font-bold text-white group-hover:bg-brand transition-colors">
              {initials(user?.first_name, user?.last_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate group-hover:text-brand transition-colors">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-slate-500 truncate uppercase tracking-wider mt-0.5">{user?.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-24 border-b border-white/5 bg-base-950 flex items-center justify-between px-8">
          <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
            {isAdmin ? 'Workshop Operations' : 'Client Portal'}
          </div>
          <button onClick={logout} className="text-xs font-bold text-slate-500 hover:text-brand uppercase tracking-wider transition-colors">Sign out</button>
        </header>

        <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>

        <footer className="border-t border-white/5 py-6 px-8 text-xs text-slate-600 flex justify-between">
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

# 7. UPDATE LANDING PAGE TO USE NEW COLORS
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-950 font-sans">
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-base-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-white">
            Motora<span className="text-brand">.</span>
          </Link>
          <div className="hidden md:flex gap-10 text-sm font-medium text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#heritage" className="hover:text-white transition-colors">Heritage</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-white hover:text-brand transition-colors">Client Login</Link>
            <Link to="/register"><Button className="rounded-lg px-8 py-3 uppercase tracking-wider text-xs font-bold">Book Service</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center pt-24">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Dodge Challenger" />
          <div className="absolute inset-0 bg-gradient-to-r from-base-950 via-base-950/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-serif text-white leading-[1.1] mb-8">
              The art of<br/>automotive care.
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
              We treat every vehicle like a classic. From routine maintenance to complex diagnostics, experience a standard of service usually reserved for the track.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/register"><Button className="h-14 px-10 text-lg rounded-xl font-semibold">Start Your Service</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="heritage" className="py-24 bg-base-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Uncompromising standards.</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              We believe that transparency and precision are not just buzzwords—they are the foundation of trust. Every vehicle that enters our facility is documented, photographed, and handled by certified technicians.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-4xl font-serif text-accent mb-1">10+</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-serif text-accent mb-1">5k+</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">Vehicles Serviced</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop" className="w-full h-[500px] object-cover rounded-2xl" alt="Mechanic working" />
            <div className="absolute -bottom-6 -left-6 bg-brand p-6 hidden md:block rounded-xl shadow-glow-brand">
              <div className="text-white font-serif text-2xl italic">"Precision is the difference between good and great."</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-base-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Expertise</h2>
              <p className="text-slate-400">Comprehensive care for modern machines.</p>
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
                <p className="text-slate-500 text-sm">Certified technicians. OEM parts. Guaranteed work.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-base-900 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="font-serif text-3xl font-bold text-white block mb-6">Motora<span className="text-brand">.</span></Link>
            <p className="text-slate-400 max-w-sm mb-8">
              Redefining the standard of vehicle maintenance. Digital records, transparent pricing, and uncompromising quality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-brand">Routine Maintenance</a></li>
              <li><a href="#" className="hover:text-brand">Brake Systems</a></li>
              <li><a href="#" className="hover:text-brand">Engine Diagnostics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-brand">About</a></li>
              <li><a href="#" className="hover:text-brand">Careers</a></li>
              <li><a href="#" className="hover:text-brand">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>© 2026 Motora Systems. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
FILE

# 8. UPDATE DASHBOARD TO MATCH NEW COLORS
cat > src/pages/customer/Dashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'

export default function Dashboard() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  
  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-white mb-2">My Garage</h1>
          <p className="text-slate-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <Button className="uppercase tracking-wider text-xs px-6 py-4">Add Vehicle</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => (
          <div key={car.id} className="group relative">
            <div className="h-64 relative overflow-hidden rounded-xl bg-base-900 mb-6">
              {car.image_url ? (
                <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">No Image</div>
              )}
              <div className="absolute top-4 left-4 bg-base-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10 rounded">
                {car.plate_number}
              </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-serif text-white mb-1">{car.year} {car.make} {car.model}</h3>
                <div className="text-sm text-slate-500 uppercase tracking-wider">VIN: {car.vin}</div>
              </div>
              <Link to={`/vehicle/${car.id}`} className="text-brand text-sm font-bold uppercase tracking-wider border-b border-brand pb-1 hover:text-brand-hover hover:border-brand-hover transition-colors">Details</Link>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Next Service</div>
                <div className="text-white font-mono text-lg">{date(car.requests[0]?.next_service_date) || 'Not scheduled'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Outstanding</div>
                <div className={`font-mono text-lg ${car.requests.some(r => Number(r.balance) > 0) ? 'text-accent' : 'text-slate-300'}`}>
                  {ngn(car.requests.reduce((s, r) => s + Number(r.balance), 0))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
FILE

echo "Sharp UI applied."
