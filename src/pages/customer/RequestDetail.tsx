import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Skeleton } from '@/components/ds/Skeleton'
import { date, ngn } from '@/lib/format'
import { pendingAdditional, displayStatus } from '@/lib/approval'
import type { MaintenanceServiceResponse } from '@/services/types'

const badge: Record<string, string> = {
  APPROVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  REJECTED: 'border-red-500/30 bg-red-500/10 text-red-300',
  PENDING: 'border-brand/40 bg-brand/10 text-brand',
}
const categoryLabel = (c: string) => c.replaceAll('_', ' ')

export default function RequestDetail() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const { data: request, isLoading, error } = useQuery({ queryKey: ['request', id], queryFn: () => api.requestById(id), enabled: !!id, refetchOnMount: 'always', refetchInterval: 15000 })
  const { data: services = [], isLoading: loadingServices } = useQuery({ queryKey: ['request-services', id], queryFn: () => api.requestServices(id), enabled: !!id, refetchOnMount: 'always', refetchInterval: 15000 })
  const { data: images = [] } = useQuery({ queryKey: ['request-images', id], queryFn: () => api.requestImages(id), enabled: !!id, refetchOnMount: 'always', refetchInterval: 30000 })
  const { data: cars } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  const car = cars?.find(c => c.id === request?.car_id)

  const refresh = async () => {
    for (const k of ['request', 'request-services', 'customer-request-services', 'customer-service-history', 'my-cars', 'payment-summary']) await qc.invalidateQueries({ queryKey: [k] })
  }
  const approve = useMutation({ mutationFn: (sid: string) => api.approveService(sid), onSuccess: refresh })
  const reject = useMutation({ mutationFn: (sid: string) => api.rejectService(sid), onSuccess: refresh })
  const busy = approve.isPending || reject.isPending

  if (isLoading || loadingServices) return <Skeleton className="h-96" />
  if (error || !request) return <div className="space-y-4 text-stone-300"><p>This service request could not be loaded.</p><Link to="/dashboard" className="text-brand">Back to my garage</Link></div>

  const requested = services.filter(s => !s.is_additional)
  const awaiting = services.filter(s => s.is_additional && s.approval === 'PENDING')
  const additionalHistory = services.filter(s => s.is_additional && s.approval !== 'PENDING')
  const sum = (list: MaintenanceServiceResponse[]) => list.reduce((n, s) => n + Number(s.cost), 0)
  const requestedTotal = sum(requested)
  const approvedExtra = sum(additionalHistory.filter(s => s.approval === 'APPROVED'))
  const waiting = pendingAdditional(services)
  const error_ = (approve.error || reject.error) as Error | null

  const row = (s: MaintenanceServiceResponse, decide = false) => (
    <div key={s.id} className={`rounded-lg border p-4 ${s.approval === 'PENDING' ? 'border-brand/40 bg-brand/5' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">{s.name}</p>
          {s.description && <p className="mt-1 text-sm text-stone-500">{s.description}</p>}
          <p className="mt-2 text-xs text-stone-500">Added {date(s.created_at)}{s.approved_at ? ` · Decided ${date(s.approved_at)}` : ''}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`font-mono ${s.approval === 'REJECTED' ? 'text-stone-500 line-through' : 'text-white'}`}>{ngn(s.cost)}</p>
          {s.is_additional && <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${badge[s.approval] ?? ''}`}>{s.approval === 'PENDING' ? 'Needs your decision' : s.approval === 'REJECTED' ? 'Denied' : 'Approved'}</span>}
        </div>
      </div>
      {decide && (
        <div className="mt-3 flex justify-end gap-3">
          <Button icon="x" variant="danger" loading={reject.isPending && reject.variables === s.id} loadingText="Denying…" disabled={busy && !(reject.isPending && reject.variables === s.id)} onClick={() => reject.mutate(s.id)}>Deny</Button>
          <Button icon="check" variant="success" loading={approve.isPending && approve.variables === s.id} loadingText="Approving…" disabled={busy && !(approve.isPending && approve.variables === s.id)} onClick={() => approve.mutate(s.id)}>Approve</Button>
        </div>
      )}
    </div>
  )

  const grouped = images.reduce<Record<string, typeof images>>((acc, im) => { (acc[im.category] ||= []).push(im); return acc }, {})

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-white/10 pb-6">
        <Link to={car ? `/vehicles/${car.id}` : '/dashboard'} className="text-xs uppercase tracking-widest text-stone-500 hover:text-white">← {car ? `${car.year} ${car.make} ${car.model}` : 'My garage'}</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-white">Service request</h1>
            <p className="mt-2 text-sm text-stone-400">Ref {id.slice(0, 8).toUpperCase()} · Requested {date(request.request_date)}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-200">{waiting > 0 ? `Waiting for approval (${waiting})` : displayStatus(request.status, waiting)}</span>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-stone-900 p-6">
        <p className="text-xs uppercase tracking-widest text-stone-500">Service you requested</p>
        <p className="mt-2 whitespace-pre-wrap text-stone-200">{request.description}</p>
        <p className="mt-4 text-xs text-stone-500">Next service: {request.next_service_date ? date(request.next_service_date) : 'Not scheduled'}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between"><h2 className="text-2xl font-serif text-white">Requested services</h2><span className="font-mono text-sm text-stone-400">{ngn(requestedTotal)}</span></div>
        {requested.length === 0 ? <p className="rounded-lg border border-white/5 bg-stone-900 p-5 text-sm text-stone-500">The workshop has not priced your requested service yet.</p> : requested.map(s => row(s))}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-serif text-white">Additional services found during inspection</h2>
        <p className="text-sm text-stone-500">These are separate from what you requested and carry their own cost. Work on them starts only if you approve.</p>
        {awaiting.length === 0
          ? <p className="rounded-lg border border-white/5 bg-stone-900 p-5 text-sm text-stone-500">{['PENDING', 'ACCEPTED', 'INSPECTING'].includes(request.status) ? 'Nothing awaiting your decision. Any extra work found during inspection will appear here.' : 'Nothing awaiting your decision.'}</p>
          : awaiting.map(s => row(s, true))}
        {error_ && <p className="text-sm text-red-300">{error_.message}</p>}
      </section>

      {additionalHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between"><h2 className="text-2xl font-serif text-white">Additional services history</h2><span className="font-mono text-sm text-stone-400">Approved: {ngn(approvedExtra)}</span></div>
          {additionalHistory.map(s => row(s))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-serif text-white">Activities carried out</h2>
        <p className="text-sm text-stone-500">Photos from the workshop documenting the work done on your vehicle.</p>
        {images.length === 0 ? <p className="rounded-lg border border-white/5 bg-stone-900 p-5 text-sm text-stone-500">No photos of the work have been uploaded yet.</p> : Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="rounded-xl border border-white/10 bg-stone-900 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-500">{categoryLabel(cat)}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {list.map(im => <a key={im.id} href={im.image_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg bg-stone-800"><img src={im.image_url} alt={categoryLabel(cat)} loading="lazy" className="h-36 w-full object-cover transition-transform hover:scale-105" /></a>)}
            </div>
          </div>
        ))}
      </section>

      <div className="space-y-2 rounded-xl border border-white/10 bg-stone-900 p-5 text-sm">
        <div className="flex justify-between text-stone-400"><span>Requested services</span><span className="font-mono text-white">{ngn(requestedTotal)}</span></div>
        <div className="flex justify-between text-stone-400"><span>Approved additional services</span><span className="font-mono text-white">{ngn(approvedExtra)}</span></div>
        <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-stone-300">Total</span><span className="font-mono text-xl text-white">{ngn(requestedTotal + approvedExtra)}</span></div>
      </div>
    </div>
  )
}
