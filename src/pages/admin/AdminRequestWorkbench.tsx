import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { ngn, date } from '@/lib/format'
import { Button } from '@/components/ds/Button'
import { Skeleton } from '@/components/ds/Skeleton'

export default function AdminRequestWorkbench() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [cost,setCost] = useState('')
  const [additional,setAdditional] = useState(false)
  const [nextDate,setNextDate] = useState('')
  const [message,setMessage] = useState('')
  const {data: request,isLoading,error} = useQuery({queryKey:['admin-request',id],queryFn:()=>api.requestById(id),enabled:!!id})
  const refresh = async () => { await qc.invalidateQueries({queryKey:['admin-request',id]}); await qc.invalidateQueries({queryKey:['admin-requests']}) }
  const action = useMutation({mutationFn:(fn:()=>Promise<any>)=>fn(),onSuccess:async()=>{setMessage('Request updated.');await refresh()},onError:(e:any)=>setMessage(e.message)})
  const addService = useMutation({mutationFn:()=>api.addMaintenanceService({maintenance_request_id:id,name,description,cost:Number(cost),is_additional:additional}),onSuccess:async()=>{setName('');setDescription('');setCost('');setMessage('Service added.');await refresh()},onError:(e:any)=>setMessage(e.message)})
  if(isLoading) return <Skeleton className="h-96"/>
  if(error || !request) return <div className="space-y-4 text-stone-300"><p>Unable to load this maintenance request. Check that the request exists and your admin session is valid.</p><Link className="text-brand" to="/admin/requests">Back to work queue</Link></div>
  return <div className="space-y-8 max-w-5xl">
    <div className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-6">
      <div><Link to="/admin/requests" className="text-xs uppercase tracking-widest text-stone-500 hover:text-white">← Work queue</Link><h1 className="mt-3 text-4xl font-serif text-white">Request workbench</h1><p className="mt-2 text-sm text-stone-400">Request {id.slice(0,8)} · {date(request.request_date)}</p></div>
      <span className="h-fit rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">{request.status.replaceAll('_',' ')}</span>
    </div>
    {message && <div role="status" className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-stone-200">{message}</div>}
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-stone-900 p-6"><p className="text-xs uppercase tracking-widest text-stone-500">Customer vehicle ID</p><p className="mt-2 break-all text-white">{request.car_id}</p><p className="mt-6 text-xs uppercase tracking-widest text-stone-500">Request description</p><p className="mt-2 whitespace-pre-wrap text-stone-200">{request.description}</p></div>
      <div className="rounded-xl border border-white/10 bg-stone-900 p-6"><p className="text-xs uppercase tracking-widest text-stone-500">Timeline</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-stone-500">Submitted</dt><dd className="text-stone-200">{date(request.created_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-stone-500">Last updated</dt><dd className="text-stone-200">{date(request.updated_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-stone-500">Next service</dt><dd className="text-stone-200">{date(request.next_service_date)||'Not set'}</dd></div></dl></div>
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <h2 className="text-xl font-serif text-white">Workflow actions</h2>
      <div className="flex flex-wrap gap-3">
        {request.status==='PENDING' && <Button disabled={action.isPending} onClick={()=>action.mutate(()=>api.acceptRequest(id))}>Accept request</Button>}
        {['ACCEPTED','INSPECTING'].includes(request.status) && <Button disabled={action.isPending} onClick={()=>action.mutate(()=>api.inspectRequest(id))}>Mark inspected</Button>}
        <Button disabled={action.isPending} className="bg-transparent border border-stone-600" onClick={()=>action.mutate(()=>api.updateRequestStatus(id,'IN_PROGRESS'))}>Mark in progress</Button>
        <Button disabled={action.isPending} className="bg-transparent border border-stone-600" onClick={()=>action.mutate(()=>api.updateRequestStatus(id,'COMPLETED'))}>Mark completed</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-xs uppercase tracking-wider text-stone-500">Next service date<input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label><Button disabled={!nextDate||action.isPending} onClick={()=>action.mutate(()=>api.setNextServiceDate(id,nextDate))}>Save date</Button></div>
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <div><h2 className="text-xl font-serif text-white">Add a service</h2><p className="mt-1 text-sm text-stone-500">Additional services trigger customer approval through the backend.</p></div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={e=>{e.preventDefault();addService.mutate()}}>
        <label className="text-xs uppercase tracking-wider text-stone-500">Service name<input required minLength={2} maxLength={20} value={name} onChange={e=>setName(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
        <label className="text-xs uppercase tracking-wider text-stone-500">Cost (₦)<input required type="number" min="0.01" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
        <label className="text-xs uppercase tracking-wider text-stone-500 md:col-span-2">Description<textarea required minLength={5} maxLength={100} value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 block min-h-24 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
        <label className="flex items-center gap-2 text-sm text-stone-300 md:col-span-2"><input type="checkbox" checked={additional} onChange={e=>setAdditional(e.target.checked)}/> This is an additional service (requires customer approval)</label>
        <div className="md:col-span-2"><Button type="submit" disabled={addService.isPending||!name||!description||Number(cost)<=0}>{addService.isPending?'Adding…':'Add service'}</Button></div>
      </form>
    </section>
  </div>
}
