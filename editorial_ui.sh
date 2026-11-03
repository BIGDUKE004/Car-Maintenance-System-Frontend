#!/bin/bash
set -e

echo "Building editorial automotive UI..."

# 1. UPDATE FONTS IN HTML
cat > index.html << 'FILE'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Motora — Precision Auto Care</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-stone-950 text-stone-300 font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
FILE

# 2. UPDATE TAILWIND CONFIG
cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: { 950: '#0c0a09', 900: '#1c1917', 800: '#292524', 700: '#44403c' },
        brand: { DEFAULT: '#ff4d00', hover: '#e64500' }, // Signal Orange
        surface: { DEFAULT: '#1c1917', light: '#292524' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
} satisfies Config
FILE

# 3. UPDATE INDEX CSS
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

# 4. PREMIUM EDITORIAL LANDING PAGE
cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-950 font-sans">
      {/* HEADER */}
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-white">
            Motora<span className="text-brand">.</span>
          </Link>
          <div className="hidden md:flex gap-10 text-sm font-medium text-stone-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#heritage" className="hover:text-white transition-colors">Heritage</a>
            <a href="#process" className="hover:text-white transition-colors">Process</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-white hover:text-brand transition-colors">Client Login</Link>
            <Link to="/register"><Button className="bg-white text-stone-950 hover:bg-stone-200 border-none rounded-none px-8 py-3 uppercase tracking-wider text-xs font-bold">Book Service</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center pt-24">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Dodge Challenger" />
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
              <Link to="/register"><Button className="h-14 px-10 text-lg rounded-none bg-brand text-white hover:bg-brand-hover font-semibold">Start Your Service</Button></Link>
              <div className="text-sm text-stone-400 uppercase tracking-widest font-medium">Est. 2014</div>
            </div>
          </div>
        </div>
      </section>

      {/* HERITAGE / STATS */}
      <section id="heritage" className="py-24 bg-stone-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Uncompromising standards.</h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-8">
              We believe that transparency and precision are not just buzzwords—they are the foundation of trust. Every vehicle that enters our facility is documented, photographed, and handled by certified technicians.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-4xl font-serif text-brand mb-1">10+</div>
                <div className="text-sm text-stone-500 uppercase tracking-wider">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-serif text-brand mb-1">5k+</div>
                <div className="text-sm text-stone-500 uppercase tracking-wider">Vehicles Serviced</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop" className="w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Mechanic working" />
            <div className="absolute -bottom-6 -left-6 bg-brand p-6 hidden md:block">
              <div className="text-white font-serif text-2xl italic">"Precision is the difference between good and great."</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES WITH IMAGES */}
      <section id="services" className="py-24 bg-stone-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Expertise</h2>
              <p className="text-stone-400">Comprehensive care for modern machines.</p>
            </div>
            <Link to="/register" className="hidden md:block text-brand uppercase tracking-wider text-sm font-bold border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">View all services</Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Engine Diagnostics', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' },
              { title: 'Brake Systems', img: 'https://images.unsplash.com/photo-1599819095905-49e98b7cc606?q=80&w=2070&auto=format&fit=crop' },
              { title: 'Performance Tires', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=2072&auto=format&fit=crop' },
            ].map((s) => (
              <div key={s.title} className="group cursor-pointer">
                <div className="overflow-hidden mb-6">
                  <img src={s.img} alt={s.title} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-brand transition-colors">{s.title}</h3>
                <p className="text-stone-500 text-sm">Certified technicians. OEM parts. Guaranteed work.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
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

# 5. REFINED APP SHELL
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
    <div className="min-h-screen bg-stone-950 flex font-sans">
      <aside className="w-64 border-r border-white/5 bg-stone-900 flex-col hidden md:flex fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-serif text-2xl font-bold text-white">
            Motora<span className="text-brand">.</span>
          </Link>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map(item => {
            const active = loc.pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && loc.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-white/5 text-brand border-l-2 border-brand' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}>
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
        <header className="h-24 border-b border-white/5 bg-stone-950 flex items-center justify-between px-8">
          <div className="text-sm text-stone-400 uppercase tracking-widest font-semibold">
            {isAdmin ? 'Workshop Operations' : 'Client Portal'}
          </div>
          <button onClick={logout} className="text-xs font-bold text-stone-500 hover:text-brand uppercase tracking-wider transition-colors">Sign out</button>
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

# 6. REFINE CUSTOMER DASHBOARD TO MATCH EDITORIAL STYLE
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
          <p className="text-stone-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <Button className="bg-brand text-white hover:bg-brand-hover border-none rounded-none uppercase tracking-wider text-xs px-6 py-4">Add Vehicle</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => (
          <div key={car.id} className="group relative">
            <div className="h-64 relative overflow-hidden bg-stone-900 mb-6">
              {car.image_url ? (
                <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-700">No Image</div>
              )}
              <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10">
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
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Next Service</div>
                <div className="text-white font-mono text-lg">{date(car.requests[0]?.next_service_date) || 'Not scheduled'}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Outstanding</div>
                <div className={`font-mono text-lg ${car.requests.some(r => Number(r.balance) > 0) ? 'text-brand' : 'text-stone-300'}`}>
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

echo "Editorial UI applied."
