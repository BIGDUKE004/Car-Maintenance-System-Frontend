import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { date } from '@/lib/format'

export default function AdminCustomers() {
 const {data:requests=[],isLoading}=useQuery({queryKey:['admin-requests'],queryFn:()=>api.adminRequests()})
 if(isLoading)return <Skeleton className="h-96"/>
 const customers=[...new Map(requests.map(r=>[r.customer.id,{...r.customer,created_at:r.created_at}])).values()]
 return <div className="space-y-7"><header className="border-b border-white/10 pb-6"><h1 className="text-4xl font-serif text-white">Customer Directory</h1><p className="mt-2 text-sm text-stone-500">Customers associated with submitted maintenance requests.</p></header><div className="overflow-x-auto rounded-xl border border-white/10 bg-stone-900"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-500"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">First request</th></tr></thead><tbody className="divide-y divide-white/5">{customers.map(c=><tr key={c.id}><td className="p-4 text-white">{c.first_name} {c.last_name}</td><td className="p-4 text-stone-400">{c.email}</td><td className="p-4 font-mono text-stone-400">{c.phone}</td><td className="p-4 text-sm text-stone-500">{date(c.created_at)}</td></tr>)}{!customers.length&&<tr><td colSpan={4} className="p-8 text-center text-stone-500">No customer records are available through the current backend endpoints.</td></tr>}</tbody></table></div></div>
}
