import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { ngn } from '@/lib/format'
import { Button } from '@/components/ds/Button'
import { Skeleton } from '@/components/ds/Skeleton'
import { useState } from 'react'

export default function Payments() {
  const { data: summary, isLoading } = useQuery({ queryKey: ['payment-summary'], queryFn: api.paymentOverview })
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const payService = async (serviceId: string) => {
    try {
      setLoadingId(serviceId)
      const res = await api.initializePayment({ maintenance_service_id: serviceId })
      window.location.href = res.authorization_url // Redirect to Paystack
    } catch (e: any) {
      alert(e.message)
      setLoadingId(null)
    }
  }

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white mb-2">Payments & Billing</h1>
        <p className="text-stone-400">View outstanding balances and pay securely via Paystack.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Billed</div>
          <div className="text-3xl font-mono text-white">{ngn(summary?.total_billed || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-2">Total Paid</div>
          <div className="text-3xl font-mono text-green-400">{ngn(summary?.total_paid || 0)}</div>
        </div>
        <div className="bg-stone-900 border border-white/5 p-6 rounded-xl border-brand/50">
          <div className="text-xs text-brand uppercase tracking-widest mb-2 font-bold">Outstanding</div>
          <div className="text-3xl font-mono text-brand">{ngn(summary?.outstanding_balance || 0)}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif text-white">Unpaid Services</h2>
        {summary?.unpaid_services.length === 0 ? (
          <div className="p-8 text-center text-stone-500 border border-white/5 bg-stone-900 rounded-xl">You have no outstanding balances.</div>
        ) : summary?.unpaid_services.map(srv => (
          <div key={srv.service_id} className="flex items-center justify-between p-6 bg-stone-900 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
            <div>
              <div className="text-white font-medium text-lg">{srv.name}</div>
              <div className="text-sm text-stone-500">Ref: {srv.maintenance_request_id.split('-')[0]}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xl font-mono text-white">{ngn(srv.balance)}</div>
              <Button onClick={() => payService(srv.service_id)} disabled={loadingId === srv.service_id}>
                {loadingId === srv.service_id ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
