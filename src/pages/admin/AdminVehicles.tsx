import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'

export default function AdminVehicles() {
 const {data:requests=[],isLoading}=useQuery({queryKey:['admin-requests'],queryFn:()=>api.adminRequests()})
 if(isLoading)return <Skeleton className="h-96"/>
 const vehicles=[...new Map(requests.map(r=>[r.vehicle.id,{...r.vehicle,owner_name:`${r.customer.first_name} ${r.customer.last_name}`}])).values()]
 return <div className="space-y-7"><header className="border-b border-white/10 pb-6"><h1 className="text-4xl font-serif text-white">Registered Vehicles</h1><p className="mt-2 text-sm text-stone-500">Vehicles attached to maintenance requests.</p></header><div className="overflow-x-auto rounded-xl border border-white/10 bg-stone-900"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-500"><th className="p-4">Vehicle</th><th className="p-4">Plate</th><th className="p-4">VIN</th><th className="p-4">Owner</th></tr></thead><tbody className="divide-y divide-white/5">{vehicles.map(v=><tr key={v.id}><td className="p-4 text-white">{v.year} {v.make} {v.model}</td><td className="p-4 font-mono text-brand">{v.plate_number}</td><td className="p-4 font-mono text-xs text-stone-500">{v.vin}</td><td className="p-4 text-stone-400">{v.owner_name}</td></tr>)}{!vehicles.length&&<tr><td colSpan={4} className="p-8 text-center text-stone-500">No vehicle records are available yet.</td></tr>}</tbody></table></div></div>
}
