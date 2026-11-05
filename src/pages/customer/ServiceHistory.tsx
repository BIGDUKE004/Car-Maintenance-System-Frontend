import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import type { CustomerMaintenanceHistory } from '@/services/types'
import { date, ngn } from '@/lib/format'
import { Skeleton } from '@/components/ds/Skeleton'
import { Button } from '@/components/ds/Button'
import { Icon } from '@/components/ds/Icon'

function statusStyle(status: string) {
  switch (status) {
    case 'COMPLETED': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    case 'CANCELED': return 'border-red-500/30 bg-red-500/10 text-red-300'
    case 'IN_PROGRESS':
    case 'INSPECTING': return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    default: return 'border-white/10 bg-white/5 text-stone-300'
  }
}

export default function ServiceHistory() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['customer-service-history'],
    queryFn: async () => {
      const cars = await api.listMyCars()
      const results = await Promise.all(
        cars.map(async car => ({
          car,
          history: await api.customerServiceHistory(car.id),
        }))
      )
      return results
    },
  })

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-24" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>

  if (isError) return (
    <div className="max-w-3xl rounded-xl border border-red-500/20 bg-red-500/5 p-8">
      <h1 className="font-serif text-3xl text-white">Service history unavailable</h1>
      <p className="mt-3 text-sm leading-6 text-stone-400">{error instanceof Error ? error.message : 'We could not load your service history. Please try again.'}</p>
      <Button className="mt-6" onClick={() => refetch()} disabled={isFetching}>Try again</Button>
    </div>
  )

  const vehicles = data ?? []
  const allHistory = vehicles.flatMap(item => item.history.map(entry => ({ ...entry, vehicle: item.car })))
    .sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime())

  return (
    <div className="space-y-9">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">Your maintenance record</p>
          <h1 className="font-serif text-5xl text-white">Service History</h1>
          <p className="mt-3 max-w-2xl text-stone-400">A complete record of maintenance requests, work carried out and payments for your vehicles.</p>
        </div>
        <Link to="/request-service"><Button><Icon name="wrench" className="mr-2 inline h-4 w-4" /> Request service</Button></Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/60 p-12 text-center">
          <Icon name="car" className="mx-auto h-9 w-9 text-stone-600" />
          <h2 className="mt-4 font-serif text-2xl text-white">No vehicles in your garage</h2>
          <p className="mt-2 text-stone-400">Add a vehicle before you can view its maintenance history.</p>
          <Link to="/vehicles/new" className="mt-6 inline-block"><Button>Add a vehicle</Button></Link>
        </div>
      ) : allHistory.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-stone-900 p-10 text-center">
          <Icon name="calendar" className="mx-auto h-8 w-8 text-stone-600" />
          <h2 className="mt-4 font-serif text-2xl text-white">No service records yet</h2>
          <p className="mt-2 text-stone-400">Your maintenance requests and completed work will appear here.</p>
          <Link to="/request-service" className="mt-6 inline-block"><Button>Book your first service</Button></Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-stone-900 p-5"><p className="text-xs uppercase tracking-widest text-stone-500">Service requests</p><p className="mt-2 font-mono text-3xl text-white">{allHistory.length}</p></div>
            <div className="rounded-xl border border-white/5 bg-stone-900 p-5"><p className="text-xs uppercase tracking-widest text-stone-500">Total billed</p><p className="mt-2 font-mono text-2xl text-white">{ngn(allHistory.reduce((sum, item) => sum + Number(item.payment_summary?.total_cost ?? 0), 0))}</p></div>
            <div className="rounded-xl border border-white/5 bg-stone-900 p-5"><p className="text-xs uppercase tracking-widest text-stone-500">Outstanding</p><p className="mt-2 font-mono text-2xl text-brand">{ngn(allHistory.reduce((sum, item) => sum + Number(item.payment_summary?.outstanding_balance ?? 0), 0))}</p></div>
          </div>

          {allHistory.map((item) => (
            <article key={item.request_id} className="overflow-hidden rounded-xl border border-white/10 bg-stone-900">
              <div className="flex flex-col gap-4 border-b border-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">{item.vehicle.plate_number} · {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}</p>
                  <h2 className="mt-2 font-serif text-2xl text-white">Service request</h2>
                  <p className="mt-1 text-sm text-stone-400">Requested {date(item.request_date)} · Ref {item.request_id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${statusStyle(item.request_status)}`}>{item.request_status.replaceAll('_', ' ')}</span>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Work carried out</h3>
                  {item.services.length === 0 ? (
                    <p className="rounded-lg border border-white/5 bg-stone-950/50 p-4 text-sm text-stone-500">No services have been added to this request yet.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {item.services.map((service) => (
                        <div key={service.service_id} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-white">{service.service_name}</p>
                            {service.description && <p className="mt-1 text-sm leading-5 text-stone-500">{service.description}</p>}
                            <p className="mt-2 text-xs uppercase tracking-wider text-stone-500">{service.payment.status.replaceAll('_', ' ')}</p>
                          </div>
                          <div className="shrink-0 text-left sm:text-right">
                            <p className="font-mono text-white">{ngn(service.cost)}</p>
                            <p className="mt-1 text-xs text-stone-500">Paid {ngn(service.payment.amount_paid)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <aside className="h-fit rounded-lg border border-white/5 bg-stone-950/60 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Payment summary</h3>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 text-stone-400"><span>Total cost</span><span className="font-mono text-white">{ngn(item.payment_summary.total_cost)}</span></div>
                    <div className="flex justify-between gap-3 text-stone-400"><span>Amount paid</span><span className="font-mono text-emerald-300">{ngn(item.payment_summary.total_paid)}</span></div>
                    <div className="border-t border-white/10 pt-3"><div className="flex justify-between gap-3"><span className="font-medium text-stone-300">Balance</span><span className="font-mono font-semibold text-brand">{ngn(item.payment_summary.outstanding_balance)}</span></div></div>
                  </div>
                  {Number(item.payment_summary.outstanding_balance) > 0 && <Link to="/payments" className="mt-5 block"><Button className="w-full">Pay balance</Button></Link>}
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
