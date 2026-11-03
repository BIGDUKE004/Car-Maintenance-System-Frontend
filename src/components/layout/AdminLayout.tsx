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
