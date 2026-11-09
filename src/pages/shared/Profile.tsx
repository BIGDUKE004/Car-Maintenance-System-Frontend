import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'
import { fullName, initials } from '@/lib/format'

export default function Profile() {
  const { user, updateLocal, logout } = useAuth()
  const [form, setForm] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone: user?.phone ?? '' })
  const [pw, setPw] = useState({ current_password: '', new_password: '' })
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setSaving(true)
    const clean = { first_name: form.first_name.trim(), last_name: form.last_name.trim(), phone: form.phone.trim() }
    try {
      const updated = await api.updateProfile(clean)
      updateLocal({ ...clean, ...updated }); setMsg({ kind: 'ok', text: 'Profile updated.' })
    } catch (err: any) {
      if (err?.status === 404 || err?.status === 405) {
        updateLocal(clean)
        setMsg({ kind: 'ok', text: 'Saved on this device. The server has no profile-update route yet, so these details are not synced.' })
      } else setMsg({ kind: 'err', text: err.message })
    } finally { setSaving(false) }
  }

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(null)
    if (pw.new_password.length < 10) { setPwMsg({ kind: 'err', text: 'New password must contain at least 10 characters.' }); return }
    setChanging(true)
    try { const r = await api.changePassword(pw); setPwMsg({ kind: 'ok', text: r.message || 'Password changed.' }); setPw({ current_password: '', new_password: '' }) }
    catch (err: any) { setPwMsg({ kind: 'err', text: err.status === 404 ? 'Password change is not available on the server. Use “Forgot password” on the login page.' : err.message }) }
    finally { setChanging(false) }
  }

  const note = (m: typeof msg) => m && <p role="status" className={`rounded-lg border p-3 text-sm ${m.kind === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>{m.text}</p>
  const label = 'block text-xs uppercase tracking-wider text-stone-500'
  const input = 'mt-2 h-12 bg-stone-950 border-stone-700'

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="flex items-center gap-5 border-b border-white/10 pb-6">
        <div className="flex h-16 w-16 items-center justify-center bg-brand text-xl font-bold text-white">{initials(user?.first_name, user?.last_name)}</div>
        <div>
          <h1 className="text-4xl font-serif text-white">{fullName(user)}</h1>
          <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">{user?.role === 'WORKSHOP_ADMIN' ? 'Workshop Admin' : 'Customer'}</p>
        </div>
      </header>

      <form onSubmit={save} className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6 sm:grid-cols-2">
        <h2 className="text-xl font-serif text-white sm:col-span-2">Personal details</h2>
        <label className={label}>First name<Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required minLength={2} maxLength={15} className={input} /></label>
        <label className={label}>Last name<Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required minLength={2} maxLength={15} className={input} /></label>
        <label className={`${label} sm:col-span-2`}>Email address<Input value={user?.email ?? ''} readOnly disabled className={`${input} opacity-60`} /></label>
        <label className={`${label} sm:col-span-2`}>Phone number<Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} minLength={11} maxLength={14} className={input} /></label>
        <div className="space-y-3 sm:col-span-2">{note(msg)}<Button type="submit" icon="save" loading={saving} loadingText="Saving…">Save changes</Button></div>
      </form>

      <form onSubmit={changePw} className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6">
        <h2 className="text-xl font-serif text-white">Change password</h2>
        <label className={label}>Current password<Input type="password" value={pw.current_password} onChange={e => setPw({ ...pw, current_password: e.target.value })} required className={input} /></label>
        <label className={label}>New password<Input type="password" value={pw.new_password} onChange={e => setPw({ ...pw, new_password: e.target.value })} required minLength={10} maxLength={72} className={input} placeholder="At least 10 characters" /></label>
        {note(pwMsg)}
        <div><Button type="submit" icon="shield" loading={changing} loadingText="Updating…">Update password</Button></div>
      </form>

      <Button icon="logout" className="bg-transparent" onClick={logout}>Sign out</Button>
    </div>
  )
}
