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
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-6">
      <div className="bg-stone-900 border border-stone-800 p-12 w-full max-w-md text-center">
        <h2 className="text-3xl font-serif text-white mb-4">Check your email</h2>
        <p className="text-stone-400 mb-8">{msg}</p>
        <Link to="/login"><Button className="w-full rounded-none uppercase tracking-wider text-xs font-bold">Back to login</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-stone-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" alt="Car" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
        <div className="absolute bottom-16 left-16 max-w-lg z-10">
          <div className="w-12 h-1 bg-brand mb-6" />
          <h2 className="text-5xl font-serif text-white leading-[1.1] mb-6">Join the standard.</h2>
          <p className="text-stone-400 text-lg leading-relaxed">Create an account to start documenting your vehicle's maintenance.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="font-serif text-3xl font-bold text-white block mb-12">Motora<span className="text-brand">.</span></Link>
          
          <h1 className="text-3xl font-serif text-white mb-2">Create an account</h1>
          <p className="text-stone-400 mb-8">Enter your details to get started.</p>

          {err && <div className="mb-6 p-4 border border-brand/50 bg-brand/10 text-brand text-sm">{err}</div>}

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">First name</label>
                <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required className="bg-stone-900 border-stone-700 h-12 rounded-none focus:ring-brand" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Last name</label>
                <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required className="bg-stone-900 border-stone-700 h-12 rounded-none focus:ring-brand" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Email address</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="bg-stone-900 border-stone-700 h-12 rounded-none focus:ring-brand" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Phone number</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="bg-stone-900 border-stone-700 h-12 rounded-none focus:ring-brand" placeholder="080 1234 5678" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Password</label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={10} className="bg-stone-900 border-stone-700 h-12 rounded-none focus:ring-brand" placeholder="Minimum 10 characters" />
            </div>
            <Button type="submit" className="w-full h-14 text-lg mt-4 rounded-none uppercase tracking-wider text-sm font-bold">Create account</Button>
          </form>

          <p className="mt-8 text-sm text-stone-500">
            Already have an account? <Link to="/login" className="text-brand hover:text-white font-medium ml-1 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
