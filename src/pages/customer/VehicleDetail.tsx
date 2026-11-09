import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'
import { Skeleton } from '@/components/ds/Skeleton'
import { Icon } from '@/components/ds/Icon'
import { useCustomerRequestServices, pendingFor } from '@/hooks/usePending'
import { displayStatus } from '@/lib/approval'
import { date, ngn } from '@/lib/format'

export default function VehicleDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  const car = cars?.find(c => c.id === id)
  const { data: serviceLists } = useCustomerRequestServices((car?.requests ?? []).map(r => r.id))
  const [form, setForm] = useState({ make: '', model: '', year: new Date().getFullYear(), color: '', plate_number: '', vin: '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (car) setForm({ make: car.make, model: car.model, year: car.year, color: car.color, plate_number: car.plate_number, vin: car.vin })
  }, [car?.id])

  const save = useMutation({
    mutationFn: async () => {
      await api.updateCar(id, { ...form, make: form.make.trim(), model: form.model.trim(), color: form.color.trim(), plate_number: form.plate_number.trim(), vin: form.vin.trim(), year: Number(form.year) })
      if (photo) await api.uploadCarPhoto(id, photo)
    },
    onSuccess: async () => { setPhoto(null); setMsg({ ok: true, text: 'Vehicle updated.' }); await qc.invalidateQueries({ queryKey: ['my-cars'] }) },
    onError: (e: any) => setMsg({ ok: false, text: e.status === 404 || e.status === 405 ? 'The server has no route to update a vehicle (PATCH /customer/cars/{id}). It needs to be added to the backend.' : e.message }),
  })
  const remove = useMutation({
    mutationFn: () => api.deleteCar(id),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['my-cars'] }); nav('/dashboard', { replace: true }) },
    onError: (e: any) => { setConfirming(false); setMsg({ ok: false, text: e.status === 404 || e.status === 405 ? 'The server has no route to delete a vehicle (DELETE /customer/cars/{id}). It needs to be added to the backend.' : e.message }) },
  })

  if (isLoading) return <Skeleton className="h-96" />
  if (!car) return <div className="space-y-4 text-stone-300"><p>This vehicle could not be found.</p><Link to="/dashboard" className="text-brand">Back to my garage</Link></div>

  const label = 'block text-xs uppercase tracking-wider text-stone-500'
  const input = 'mt-2 h-12 bg-stone-950 border-stone-700'
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [k]: e.target.value }); setMsg(null) }
  const requests = car.requests ?? []
  const dated = requests.map(r => r.next_service_date).filter((d): d is string => !!d).sort()
  const upcoming = dated.filter(d => new Date(d).getTime() >= new Date().setHours(0, 0, 0, 0))
  const nextService = upcoming[0] ?? dated[dated.length - 1] ?? null
  const balance = requests.reduce((n, r) => n + Number(r.balance || 0), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="border-b border-white/10 pb-6">
        <Link to="/dashboard" className="text-xs uppercase tracking-widest text-stone-500 hover:text-white">← My garage</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-white">{car.year} {car.make} {car.model}</h1>
            <p className="mt-2 font-mono text-sm text-stone-400">{car.plate_number} · VIN {car.vin}</p>
          </div>
          <Link to={`/request-service?car=${car.id}`}><Button icon="wrench">Request service</Button></Link>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="h-52 overflow-hidden rounded-xl bg-stone-800">
            {car.image_url ? <img src={car.image_url} alt={car.model} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone-600">No Image Provided</div>}
          </div>
          <dl className="space-y-3 rounded-xl border border-white/10 bg-stone-900 p-5 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Color</dt><dd className="text-white">{car.color}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Added</dt><dd className="text-white">{date(car.created_at)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Requests</dt><dd className="text-white">{requests.length}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Next service</dt><dd className="text-white">{nextService ? date(nextService) : 'Not scheduled'}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Outstanding</dt><dd className={balance > 0 ? 'text-brand' : 'text-white'}>{ngn(balance)}</dd></div>
          </dl>
        </div>

        <form onSubmit={e => { e.preventDefault(); save.mutate() }} className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6 sm:grid-cols-2">
          <h2 className="text-xl font-serif text-white sm:col-span-2">Edit details</h2>
          <label className={label}>Make<Input value={form.make} onChange={set('make')} required maxLength={20} className={input} /></label>
          <label className={label}>Model<Input value={form.model} onChange={set('model')} required maxLength={20} className={input} /></label>
          <label className={label}>Year<Input type="number" value={form.year} onChange={set('year')} required min={1886} max={new Date().getFullYear() + 1} className={input} /></label>
          <label className={label}>Color<Input value={form.color} onChange={set('color')} required maxLength={20} className={input} /></label>
          <label className={label}>Plate number<Input value={form.plate_number} onChange={set('plate_number')} required maxLength={20} className={input} /></label>
          <label className={label}>VIN<Input value={form.vin} onChange={set('vin')} required maxLength={20} className={input} /></label>
          <label className={`${label} sm:col-span-2`}>Replace photo (optional)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPhoto(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-stone-400 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-stone-700" />
          </label>
          {msg && <p role="status" className={`rounded-lg border p-3 text-sm sm:col-span-2 ${msg.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>{msg.text}</p>}
          <div className="sm:col-span-2"><Button type="submit" icon="save" loading={save.isPending} loadingText="Saving…">Save changes</Button></div>
        </form>
      </div>

      <section className="rounded-xl border border-white/10 bg-stone-900">
        <h2 className="border-b border-white/10 p-5 text-xl font-serif text-white">Service requests</h2>
        {requests.length === 0 ? <p className="p-6 text-sm text-stone-500">No service requests for this vehicle yet.</p> : (
          <div className="divide-y divide-white/5">
            {requests.map(r => {
              const pending = pendingFor(serviceLists, r.id, r.pending_approval_count)
              return (
              <Link key={r.id} to={`/requests/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-white/[.03]">
                <div>
                  <p className="text-white">{r.description}</p>
                  <p className="mt-1 text-xs text-stone-500">{date(r.request_date)} · {displayStatus(r.status, pending)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {pending > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300"><Icon name="bell" className="h-3.5 w-3.5" />Waiting for approval ({pending})</span>}
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/60 bg-sky-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300"><Icon name="eye" className="h-4 w-4" />View</span>
                </div>
              </Link>
            )})}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-xl font-serif text-white">Delete vehicle</h2>
        <p className="mt-1 text-sm text-stone-400">This removes the vehicle from your garage. This cannot be undone.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!confirming
            ? <Button icon="trash" variant="danger" onClick={() => setConfirming(true)}>Delete vehicle</Button>
            : <>
                <Button icon="trash" variant="dangerSolid" loading={remove.isPending} loadingText="Deleting…" onClick={() => remove.mutate()}>Yes, delete permanently</Button>
                <Button icon="x" className="bg-transparent" onClick={() => setConfirming(false)} disabled={remove.isPending}>Cancel</Button>
              </>}
        </div>
      </section>
    </div>
  )
}
