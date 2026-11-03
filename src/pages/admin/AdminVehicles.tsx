import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'

export default function AdminVehicles() {
  const { data: vehicles, isLoading } = useQuery({ queryKey: ['admin-vehicles'], queryFn: () => api.adminVehicles() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Registered Vehicles</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Vehicle</th><th className="p-4">Plate</th><th className="p-4">VIN</th><th className="p-4">Owner</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {vehicles?.map(v => (
              <tr key={v.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white">{v.year} {v.make} {v.model}</td>
                <td className="p-4 text-brand font-mono">{v.plate_number}</td>
                <td className="p-4 text-stone-500 font-mono text-xs">{v.vin}</td>
                <td className="p-4 text-stone-400">{v.owner_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
