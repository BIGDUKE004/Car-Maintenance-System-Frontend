import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Button } from '@/components/ds/Button'
import { useState } from 'react'

export default function AdminPayments() {
  const [status,setStatus] = useState('NEEDS_REVIEW')
  const qc = useQueryClient()
  const { data: payments, isLoading, error } = useQuery({ queryKey: ['admin-payments',status], queryFn: () => api.adminPayments(status) })
  const resolve = useMutation({mutationFn:(reference:string)=>api.resolvePayment(reference),onSuccess:()=>qc.invalidateQueries({queryKey:['admin-payments']})})
  if (isLoading) return <Skeleton className="h-96" />
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
      <div><h1 className="text-4xl font-serif text-white">Payment review</h1><p className="mt-2 text-sm text-stone-400">Paystack transactions requiring workshop attention.</p></div>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"><option value="NEEDS_REVIEW">Needs review</option><option value="SUCCESS">Successful</option><option value="PENDING">Pending</option><option value="RESOLVED">Resolved</option><option value="FAILED">Failed</option></select>
    </div>
    {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">Could not load payment transactions.</p>}
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-stone-900">
      <table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-white/5 text-xs uppercase tracking-wider text-stone-500"><th className="p-4">Reference</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4 text-right">Action</th></tr></thead>
      <tbody className="divide-y divide-white/5">{payments?.map(p=><tr key={p.id}><td className="p-4 font-mono text-xs text-stone-200">{p.reference}</td><td className="p-4 font-mono text-brand">{ngn(p.amount)}</td><td className="p-4 text-xs uppercase text-stone-300">{p.status.replaceAll('_',' ')}</td><td className="p-4 text-sm text-stone-500">{date(p.created_at)}</td><td className="p-4 text-right">{p.status==='NEEDS_REVIEW'&&<Button disabled={resolve.isPending} onClick={()=>resolve.mutate(p.reference)}>Resolve</Button>}</td></tr>)}
      {!payments?.length&&<tr><td colSpan={5} className="p-8 text-center text-sm text-stone-500">No transactions in this category.</td></tr>}</tbody></table>
    </div>
  </div>
}
