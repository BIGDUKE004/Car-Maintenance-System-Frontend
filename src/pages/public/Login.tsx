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
      const payload = JSON.parse(atob((localStorage.getItem('motora.token') || '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      nav(payload.role === 'WORKSHOP_ADMIN' ? '/admin' : '/dashboard')
    } catch (e: any) { setErr(e.message || 'Login failed. Please check your credentials.') }
  }

  return (
    <div className="min-h-screen flex bg-stone-950">
      {/* Left: Cinematic Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" alt="Workshop" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
        
        <div className="absolute bottom-16 left-16 max-w-lg z-10">
          <div className="w-12 h-1 bg-brand mb-6" />
          <h2 className="text-5xl font-serif text-white leading-[1.1] mb-6">Precision in every detail.</h2>
          <p className="text-stone-400 text-lg leading-relaxed">Log in to track your vehicle's service history, approve work, and manage your maintenance.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="font-serif text-3xl font-bold text-white block mb-16">Motora<span className="text-brand">.</span></Link>
          
          <h1 className="text-3xl font-serif text-white mb-2">Client Login</h1>
          <p className="text-stone-400 mb-10">Enter your details to access your garage.</p>

          {err && <div className="mb-6 p-4 border border-brand/50 bg-brand/10 text-brand text-sm">{err}</div>}

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Email address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-stone-900 border-stone-700 h-14 rounded-none focus:ring-brand" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-stone-500 hover:text-brand">Forgot password?</Link>
              </div>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-stone-900 border-stone-700 h-14 rounded-none focus:ring-brand" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-14 text-lg mt-4 rounded-none uppercase tracking-wider text-sm font-bold">Sign In</Button>
          </form>

          <p className="mt-12 text-sm text-stone-500">
            Don't have an account? <Link to="/register" className="text-brand hover:text-white font-medium ml-1 transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
