import { useState } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function AddAdmin() {
  const empty = { first_name: '', last_name: '', email: '', phone: '', password: '' }
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [k]: e.target.value }); setMsg(null) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 10) { setMsg({ ok: false, text: 'Password must contain at least 10 characters.' }); return }
    setBusy(true)
    try {
      const r = await api.createAdmin({ ...form, first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() })
      setMsg({ ok: true, text: r.message || 'Admin account created.' }); setForm(empty)
    } catch (err: any) {
      setMsg({ ok: false, text: err.status === 404 ? 'The server does not expose an “create admin” route (POST /admin/admins). Add it to the backend, or tell me its path and I will point the form at it.' : err.message })
    } finally { setBusy(false) }
  }
  const label = 'block text-xs uppercase tracking-wider text-stone-500'
  const input = 'mt-2 h-12 bg-stone-950 border-stone-700'
  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Add admin</h1>
        <p className="mt-2 text-sm text-stone-400">Create another workshop administrator account.</p>
      </header>
      {msg && <p role="status" className={`rounded-lg border p-4 text-sm ${msg.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>{msg.text}</p>}
      <form onSubmit={submit} className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6 sm:grid-cols-2">
        <label className={label}>First name<Input value={form.first_name} onChange={set('first_name')} required minLength={2} maxLength={15} className={input} /></label>
        <label className={label}>Last name<Input value={form.last_name} onChange={set('last_name')} required minLength={2} maxLength={15} className={input} /></label>
        <label className={`${label} sm:col-span-2`}>Email address<Input type="email" value={form.email} onChange={set('email')} required className={input} /></label>
        <label className={`${label} sm:col-span-2`}>Phone number<Input type="tel" value={form.phone} onChange={set('phone')} required minLength={11} maxLength={14} className={input} /></label>
        <label className={`${label} sm:col-span-2`}>Temporary password<Input type="password" value={form.password} onChange={set('password')} required minLength={10} maxLength={72} className={input} placeholder="At least 10 characters" /></label>
        <div className="sm:col-span-2"><Button type="submit" icon="plus" loading={busy} loadingText="Creating…">Create admin</Button></div>
      </form>
    </div>
  )
}
