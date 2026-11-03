import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn } from '@/lib/format'
import { Button } from '@/components/ds/Button'

export default function AdminReports() {
  const { data: report, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: () => api.adminReports() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Financial Reports</h1>
          <p className="text-stone-400">Last {report?.period_days || 180} days overview</p>
        </div>
        <Button className="bg-transparent border-stone-700">Export CSV</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-brand">{ngn(report?.total_revenue || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Requests Created</div>
          <div className="text-3xl font-mono text-white">{report?.requests_created}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Top Service</div>
          <div className="text-xl text-white truncate">{report?.top_services[0]?.name || 'N/A'}</div>
          <div className="text-xs text-stone-400 mt-1">{report?.top_services[0]?.count} bookings</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-serif text-white mb-6">Revenue By Month</h3>
          <div className="space-y-4">
            {report?.revenue_by_month.map(m => (
              <div key={m.month} className="flex justify-between items-center">
                <span className="text-stone-400 font-mono text-sm">{m.month}</span>
                <span className="text-white font-mono">{ngn(m.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-serif text-white mb-6">Requests By Status</h3>
          <div className="space-y-4">
            {Object.entries(report?.requests_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-stone-400 uppercase text-xs tracking-wider">{status}</span>
                <span className="text-white font-mono">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
