import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'

export default function AdminPayments() {
  const { data: payments, isLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: () => api.adminPayments() })
  if (isLoading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white">Payment Ledger</h1>
      </div>
      <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/5 text-xs text-stone-500 uppercase tracking-wider"><th className="p-4">Reference</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Customer</th><th className="p-4">Date</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {payments?.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white font-mono text-xs">{p.reference}</td>
                <td className="p-4 text-brand font-mono">{ngn(p.amount)}</td>
                <td className="p-4 text-stone-400"><span className="border border-white/10 px-2 py-1 text-xs rounded uppercase">{p.method}</span></td>
                <td className="p-4 text-stone-400">{p.customer_name} <span className="text-xs text-stone-600">({p.plate_number})</span></td>
                <td className="p-4 text-stone-500 text-sm">{date(p.payment_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
