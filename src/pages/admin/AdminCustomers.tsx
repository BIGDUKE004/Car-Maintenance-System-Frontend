import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { date } from '@/lib/format'

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: () => api.adminCustomers() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Customer Directory</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Joined</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {customers?.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white">{c.first_name} {c.last_name}</td>
                <td className="p-4 text-stone-400">{c.email}</td>
                <td className="p-4 text-stone-400 font-mono">{c.phone}</td>
                <td className="p-4 text-stone-500 text-sm">{date(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
