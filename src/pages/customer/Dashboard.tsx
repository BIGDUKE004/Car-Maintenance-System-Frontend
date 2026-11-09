import { useQuery } from '@tanstack/react-query'
import type { CustomerMaintenanceHistory } from '@/services/types'
import { useCustomerRequestServices, pendingFor } from '@/hooks/usePending'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'

const startOfToday = () => new Date().setHours(0, 0, 0, 0)
const pickNext = (dates: string[]) => {
  const sorted = [...dates].sort()
  return sorted.find(d => new Date(d).getTime() >= startOfToday()) ?? sorted[sorted.length - 1] ?? null
}

export default function Dashboard() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  const requestIds = (cars ?? []).flatMap(c => (c.requests ?? []).map(r => r.id))
  const carIds = (cars ?? []).map(c => c.id).join(',')
  const { data: serviceLists } = useCustomerRequestServices(requestIds)

  // Billing history gives accurate totals across all of a car's requests.
  const { data: histories } = useQuery({
    queryKey: ['customer-service-history', carIds],
    enabled: !!cars && cars.length > 0,
    refetchOnMount: 'always',
    queryFn: async () => Promise.all((cars ?? []).map(async car => ({
      car,
      history: await api.customerServiceHistory(car.id).catch(() => null as CustomerMaintenanceHistory[] | null),
    }))),
  })

  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /></div>

  const rows = (cars ?? []).map(car => {
    const requests = car.requests ?? []
    const hist = histories?.find(h => h.car.id === car.id)?.history
    const total = hist ? hist.reduce((n, h) => n + Number(h.payment_summary?.total_cost || 0), 0) : requests.reduce((n, r) => n + Number(r.total_cost || 0), 0)
    const outstanding = hist ? hist.reduce((n, h) => n + Number(h.payment_summary?.outstanding_balance || 0), 0) : requests.reduce((n, r) => n + Number(r.balance || 0), 0)
    const nextService = pickNext(requests.map(r => r.next_service_date).filter((d): d is string => !!d))
    const pendingByRequest = requests
      .map(r => ({ id: r.id, count: pendingFor(serviceLists, r.id, Number(r.pending_approval_count || 0)) }))
      .filter(x => x.count > 0)
    return { car, total, outstanding, nextService, pendingByRequest, pendingTotal: pendingByRequest.reduce((n, x) => n + x.count, 0) }
  })
  const grandTotal = rows.reduce((n, r) => n + r.total, 0)
  const grandOutstanding = rows.reduce((n, r) => n + r.outstanding, 0)
  const earliestNext = pickNext(rows.map(r => r.nextService).filter((d): d is string => !!d))

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-white mb-2">My Garage</h1>
          <p className="text-stone-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/vehicles/new"><Button icon="plus" variant="info">Add Vehicle</Button></Link>
          <Link to="/payments"><Button icon="credit-card" variant="warning">Pay Balance</Button></Link>
          <Link to="/request-service"><Button icon="wrench">Request Service</Button></Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/60 p-12 text-center">
          <h2 className="text-2xl font-serif text-white">Your garage is empty</h2>
          <p className="mt-2 text-stone-400">Add your first vehicle to start tracking maintenance.</p>
          <Link to="/vehicles/new" className="mt-6 inline-block"><Button icon="plus">Add your first vehicle</Button></Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-500/30 bg-stone-900 p-5"><p className="text-xs font-bold uppercase tracking-widest text-sky-300">Next service</p><p className="mt-2 font-mono text-2xl font-bold text-white">{earliestNext ? date(earliestNext) : 'Not scheduled'}</p></div>
            <div className="rounded-xl border border-white/10 bg-stone-900 p-5"><p className="text-xs font-bold uppercase tracking-widest text-stone-400">Total amount (all requests)</p><p className="mt-2 font-mono text-2xl font-bold text-white">{ngn(grandTotal)}</p></div>
            <div className="rounded-xl border border-brand/40 bg-stone-900 p-5"><p className="text-xs font-bold uppercase tracking-widest text-brand">Outstanding</p><p className="mt-2 font-mono text-2xl font-bold text-brand">{ngn(grandOutstanding)}</p></div>
          </div>

          <div className="grid gap-x-16 gap-y-24 md:grid-cols-2">
            {rows.map(({ car, total, outstanding, nextService, pendingByRequest, pendingTotal }) => (
              <div key={car.id} className="group relative">
                <Link to={`/vehicles/${car.id}`} className="block h-64 relative overflow-hidden bg-stone-900 mb-6 rounded-xl">
                  {car.image_url ? <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-800 font-bold">No Image Provided</div>}
                  <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono font-bold text-white tracking-widest border border-white/10 rounded">{car.plate_number}</div>
                </Link>
                <div className="mb-6">
                  <Link to={`/vehicles/${car.id}`}><h3 className="text-3xl font-serif text-white mb-1 hover:text-brand transition-colors">{car.year} {car.make} {car.model}</h3></Link>
                  <div className="text-sm font-semibold text-stone-400 uppercase tracking-wider">VIN: {car.vin}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div><div className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2">Next service</div><div className="text-white font-mono font-bold text-base">{nextService ? date(nextService) : 'Not scheduled'}</div></div>
                  <div><div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Total amount</div><div className="text-white font-mono font-bold text-base">{ngn(total)}</div></div>
                  <div><div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Outstanding</div><div className={`font-mono font-bold text-base ${outstanding > 0 ? 'text-brand' : 'text-emerald-300'}`}>{ngn(outstanding)}</div></div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                  <Link to={`/vehicles/${car.id}`} className="block"><Button icon="eye" variant="info" className="w-full">Details</Button></Link>
                  <Link to="/history" className="block"><Button icon="history" variant="ghost" className="w-full">History</Button></Link>
                  <Link to={`/request-service?car=${car.id}`} className="block"><Button icon="wrench" className="w-full">Request</Button></Link>
                  {pendingTotal > 0 && (
                    <Link to={pendingByRequest.length === 1 ? `/requests/${pendingByRequest[0].id}` : `/vehicles/${car.id}`} className="col-span-3 block">
                      <Button icon="bell" variant="warning" className="w-full">
                        Waiting for approval
                        <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-stone-950">{pendingTotal}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
