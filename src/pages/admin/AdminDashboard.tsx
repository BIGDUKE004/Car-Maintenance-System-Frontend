import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ds/Skeleton'
import { Button } from '@/components/ds/Button'
import { ngn } from '@/lib/format'

export default function AdminDashboard() {
  const {data:requests=[],isLoading,error}=useQuery({queryKey:['admin-requests'],queryFn:()=>api.adminRequests()})
  const {data:payments=[]}=useQuery({queryKey:['admin-payments','NEEDS_REVIEW'],queryFn:()=>api.adminPayments()})
  if(isLoading)return <Skeleton className="h-96"/>
  const count=(s:string)=>requests.filter(r=>r.status===s).length
  const pending=requests.filter(r=>['PENDING','ACCEPTED','INSPECTING','IN_PROGRESS','AWAITING_APPROVAL'].includes(r.status))
  const customers=new Set(requests.map(r=>r.customer.id)).size
  if(error)return <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">Could not load workshop requests. Check the API connection and admin access.</p>
  return <div className="space-y-9">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-7"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-brand">Workshop overview</p><h1 className="text-5xl font-serif text-white">Command Center</h1><p className="mt-2 text-stone-400">Live operational data from your maintenance request records.</p></div><Link to="/admin/requests"><Button>Open work queue</Button></Link></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['All requests',requests.length],['Active work',pending.length],['Awaiting approval',count('AWAITING_APPROVAL')],['Customers seen',customers]].map(([label,value])=><div key={label} className="rounded-xl border border-white/10 bg-stone-900 p-6"><p className="text-xs uppercase tracking-widest text-stone-500">{label}</p><p className="mt-3 font-mono text-4xl text-white">{value}</p></div>)}
    </div>
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <section className="overflow-hidden rounded-xl border border-white/10 bg-stone-900"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="text-xl font-serif text-white">Recent requests</h2><Link to="/admin/requests" className="text-xs font-bold uppercase tracking-wider text-brand">View all</Link></div>
        <div className="divide-y divide-white/5">{requests.slice(0,7).map(r=><Link key={r.id} to={`/admin/requests/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-white/[.03]"><div><p className="font-medium text-white">{r.customer.first_name} {r.customer.last_name}</p><p className="mt-1 text-sm text-stone-500">{r.vehicle.year} {r.vehicle.make} {r.vehicle.model} · {r.vehicle.plate_number}</p></div><span className="rounded-full border border-brand/30 px-3 py-1 text-[10px] uppercase tracking-wider text-brand">{r.status.replaceAll('_',' ')}</span></Link>)}{!requests.length&&<p className="p-8 text-center text-stone-500">No maintenance requests have been submitted.</p>}</div>
      </section>
      <section className="space-y-5"><div className="rounded-xl border border-white/10 bg-stone-900 p-6"><h2 className="text-xl font-serif text-white">Request breakdown</h2><div className="mt-5 space-y-4">{['PENDING','ACCEPTED','INSPECTING','AWAITING_APPROVAL','IN_PROGRESS','COMPLETED','CANCELED'].map(s=><div key={s} className="flex justify-between text-sm"><span className="text-stone-400">{s.replaceAll('_',' ')}</span><span className="font-mono text-white">{count(s)}</span></div>)}</div></div>
      <Link to="/admin/payments" className="block rounded-xl border border-brand/30 bg-stone-900 p-6 hover:border-brand"><p className="text-xs uppercase tracking-widest text-brand">Payment review</p><p className="mt-2 text-3xl font-mono text-white">{payments.length}</p><p className="mt-1 text-sm text-stone-400">Transactions needing attention</p></Link></section>
    </div>
  </div>
}
