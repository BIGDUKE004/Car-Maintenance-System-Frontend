import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { Link } from 'react-router-dom'
import { date } from '@/lib/format'

export default function AdminRequests() {
  const { data: requests, isLoading } = useQuery({ queryKey: ['admin-requests'], queryFn: () => api.adminRequests() })
  
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Work Queue</h1>
          <p className="text-stone-400">Manage all incoming and active maintenance requests.</p>
        </div>
      </div>
      
      <div className="bg-stone-900 border border-white/5 overflow-hidden rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Vehicle</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests?.map(req => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-white text-sm">{req.customer.first_name} {req.customer.last_name}</div>
                  <div className="text-xs text-stone-500">{req.customer.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-stone-300">{req.vehicle.year} {req.vehicle.make} {req.vehicle.model}</div>
                  <div className="text-xs text-brand font-mono mt-1">{req.vehicle.plate_number}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-brand/50 text-brand rounded">{req.status.replace('_', ' ')}</span>
                </td>
                <td className="p-4 text-sm text-stone-400">{date(req.request_date)}</td>
                <td className="p-4 text-right">
                  <Link to={`/admin/requests/${req.id}`} className="inline-block border border-stone-700 text-stone-300 hover:bg-brand hover:border-brand hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">Workbench</Link>
                </td>
              </tr>
            ))}
            {requests?.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-stone-500">No requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
