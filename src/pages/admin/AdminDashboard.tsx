import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date, dateTime } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ds/Icon'
import { Button } from '@/components/ds/Button'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dash'], queryFn: api.adminDashboard })
  
  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /><Skeleton className="h-96" /></div>
  if (!data) return null

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="text-brand text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> Live Workshop
          </div>
          <h1 className="text-5xl font-serif text-white mb-2">Command Center</h1>
          <p className="text-stone-400 text-lg">Manage active jobs, approvals, and revenue.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/reports"><Button className="bg-transparent border-stone-700">Export Report</Button></Link>
          <Link to="/admin/requests"><Button>New Request</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-white mb-2">{ngn(data.statistics.total_revenue)}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1"><span className="text-brand font-bold">↑ {data.statistics.completed_last_30_days}</span> jobs completed</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Requests</div>
          <div className="text-3xl font-mono text-white mb-2">{data.statistics.total_requests}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1"><span className="text-stone-300 font-bold">↑ {data.statistics.created_last_30_days}</span> new this month</div>
        </div>
        <Link to="/admin/requests" className="bg-stone-900 border border-brand/30 hover:border-brand p-6 group transition-colors block">
          <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Awaiting Approval</div>
          <div className="text-3xl font-mono text-white mb-2">{data.awaiting_customer_approval.count}</div>
          <div className="text-xs text-stone-400">Clients need to approve</div>
        </Link>
        <div className="bg-stone-900 border border-white/5 p-6">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">System Alerts</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-sm"><span className="text-stone-400">Failed emails</span><span className={`font-mono ${data.notification_problems.failed_count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.notification_problems.failed_count}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-stone-400">Payment review</span><span className={`font-mono ${data.payments_needing_review.count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.payments_needing_review.count}</span></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-serif text-white">Work Queue</h2>
            <Link to="/admin/requests" className="text-xs font-bold text-brand uppercase tracking-wider border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">View All</Link>
          </div>
          <div className="bg-stone-900 border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Customer & Vehicle</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pending_work.items.slice(0, 5).map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white text-sm">{item.customer_name}</div>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                        <span className="font-mono text-brand border border-brand/20 bg-brand-light px-1.5 py-0.5">{item.plate_number}</span>{item.vehicle}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${item.status === 'PENDING' ? 'border-stone-500 text-stone-300' : 'border-brand/50 text-brand'}`}>{item.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/requests/${item.id}`} className="inline-block border border-stone-700 text-stone-300 hover:bg-brand hover:border-brand hover:text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/requests" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">View All Requests</span><Icon name="arrow-right" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
              <Link to="/admin/customers" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">Customer Directory</span><Icon name="users" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
              <Link to="/admin/payments" className="w-full flex items-center justify-between p-4 bg-stone-900 border border-white/5 hover:border-brand transition-colors group"><span className="text-sm font-medium text-white group-hover:text-brand">Payment Ledger</span><Icon name="shield" className="w-4 h-4 text-stone-500 group-hover:text-brand" /></Link>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white mb-6">Recent Activity</h2>
            <div className="bg-stone-900 border border-white/5 p-6 space-y-6">
              {data.recent_activity.slice(0, 4).map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />}
                  <div className={`w-6 h-6 border-2 border-stone-900 flex items-center justify-center shrink-0 z-10 ${activity.status === 'COMPLETED' ? 'bg-brand' : 'bg-stone-700'}`}>{activity.status === 'COMPLETED' && <Icon name="check" className="w-3 h-3 text-white" />}</div>
                  <div><div className="text-sm font-medium text-white mb-1">{activity.description}</div><div className="text-xs text-stone-400">{activity.customer_name}</div><div className="text-[10px] text-stone-600 font-mono uppercase mt-1">{dateTime(activity.occurred_at)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
