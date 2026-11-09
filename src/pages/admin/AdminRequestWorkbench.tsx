import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { ngn, date } from '@/lib/format'
import { Button } from '@/components/ds/Button'
import { Skeleton } from '@/components/ds/Skeleton'
import { Icon } from '@/components/ds/Icon'
import { pendingAdditional, displayStatus } from '@/lib/approval'
import type { ImageCategory, MaintenanceServiceResponse } from '@/services/types'

export default function AdminRequestWorkbench() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [cost,setCost] = useState('')
  const [nextDate,setNextDate] = useState('')
  const [message,setMessage] = useState('')
  const [file,setFile] = useState<File|null>(null)
  const [category,setCategory] = useState<ImageCategory>('BEFORE')
  const [fileKey,setFileKey] = useState(0)
  const [justUploaded,setJustUploaded] = useState(false)
  const [reqCost,setReqCost] = useState('')
  const [showExtra,setShowExtra] = useState(false)
  const preview = file ? URL.createObjectURL(file) : null
  const {data: request,isLoading,error} = useQuery({queryKey:['admin-request',id],queryFn:()=>api.requestById(id),enabled:!!id,refetchInterval:15000})
  const {data: servicesRaw} = useQuery({queryKey:['admin-request-services',id],queryFn:()=>api.adminRequestServices(id),enabled:!!id,refetchInterval:15000})
  const services: MaintenanceServiceResponse[] = servicesRaw ?? []
  const {data: images = []} = useQuery({queryKey:['request-images',id],queryFn:()=>api.requestImages(id),enabled:!!id})
  const refresh = async () => { await qc.invalidateQueries({queryKey:['admin-request-services',id]}); await qc.invalidateQueries({queryKey:['request-images',id]}); await qc.invalidateQueries({queryKey:['admin-request',id]}); await qc.invalidateQueries({queryKey:['admin-requests']}) }
  const action = useMutation({mutationFn:(fn:()=>Promise<any>)=>fn(),onSuccess:async()=>{setMessage('Request updated.');await refresh()},onError:(e:any)=>setMessage(e.message)})
  const addService = useMutation({mutationFn:(p:{name:string;description:string;cost:number;is_additional:boolean})=>api.addMaintenanceService({maintenance_request_id:id,...p}),onSuccess:async(_d,p)=>{if(p.is_additional){setName('');setDescription('');setCost('');setShowExtra(false)}else setReqCost('');setMessage(p.is_additional?'Additional service added. The customer can now approve or decline it.':'Cost saved.');await refresh()},onError:(e:any)=>setMessage(e.message)})
  const uploadImage = useMutation({
    mutationFn:()=>{ if(!file) throw new Error('Choose an image first.'); return api.addMaintenanceImage(id,file,category) },
    onSuccess:async()=>{ setFile(null); setFileKey(k=>k+1); setMessage('Image added. The customer can now see it under this service request.'); setJustUploaded(true); setTimeout(()=>setJustUploaded(false),5000); await refresh() },
    onError:(e:any)=>setMessage(e.status===404?'The server has no image-upload route (tried /admin/maintenance-requests/{id}/images, /admin/maintenance-images, /maintenance-images). Send me the real path from the backend docs.':e.message)
  })
  if(isLoading) return <Skeleton className="h-96"/>
  if(error || !request) return <div className="space-y-4 text-stone-300"><p>Unable to load this maintenance request. Check that the request exists and your admin session is valid.</p><Link className="text-brand" to="/admin/requests">Back to work queue</Link></div>
  const requestedTotal = services.filter((x:MaintenanceServiceResponse)=>!x.is_additional).reduce((n:number,x:MaintenanceServiceResponse)=>n+Number(x.cost),0)
  const approvedExtra = services.filter((x:MaintenanceServiceResponse)=>x.is_additional&&x.approval==='APPROVED').reduce((n:number,x:MaintenanceServiceResponse)=>n+Number(x.cost),0)
  const pendingCount = pendingAdditional(services)
  const requestedServices = services.filter((x:MaintenanceServiceResponse)=>!x.is_additional)
  const additionalServices = services.filter((x:MaintenanceServiceResponse)=>x.is_additional)
  const canPrice = !['PENDING','CANCELED','CANCELLED'].includes(request.status)
  // The customer's own note is the service description; the admin only supplies the cost.
  const saveRequestedCost = () => addService.mutate({name:request.description.trim().slice(0,20)||'Requested service',description:request.description.trim().slice(0,100)||'Customer requested service',cost:Number(reqCost),is_additional:false})
  const svcRow = (sv:MaintenanceServiceResponse) => <div key={sv.id} className="flex items-start justify-between gap-4 py-3"><div className="min-w-0"><p className="text-white">{sv.name}</p>{sv.is_additional&&sv.description&&<p className="mt-1 text-xs text-stone-500">Note: {sv.description}</p>}</div><div className="shrink-0 text-right"><p className={`font-mono ${sv.approval==='REJECTED'?'text-stone-500 line-through':'text-white'}`}>{ngn(sv.cost)}</p>{sv.is_additional&&<span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${sv.approval==='APPROVED'?'border-emerald-500/30 text-emerald-300':sv.approval==='REJECTED'?'border-red-500/30 text-red-300':'border-brand/40 text-brand'}`}>{sv.approval==='PENDING'?'Awaiting customer':sv.approval==='APPROVED'?'Approved':'Declined'}</span>}</div></div>
  return <div className="space-y-8 max-w-5xl">
    <div className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-6">
      <div><Link to="/admin/requests" className="text-xs uppercase tracking-widest text-stone-500 hover:text-white">← Work queue</Link><h1 className="mt-3 text-4xl font-serif text-white">Request workbench</h1><p className="mt-2 text-sm text-stone-400">Request {id.slice(0,8)} · {date(request.request_date)}</p></div>
      <div className="flex h-fit flex-wrap items-center gap-2">{images.length>0&&<span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300"><Icon name="image" className="h-3.5 w-3.5"/>{images.length} image{images.length>1?'s':''} added</span>}<span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${pendingCount>0?'border-amber-500 bg-amber-500/10 text-amber-300':servicesRaw&&request.status==='AWAITING_APPROVAL'?'border-emerald-500 bg-emerald-500/10 text-emerald-300':'border-brand/50 text-brand'}`}>{pendingCount>0?`Waiting for approval (${pendingCount})`:servicesRaw?displayStatus(request.status,pendingCount):request.status.replaceAll('_',' ')}</span></div>
    </div>
    {message && <div role="status" className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-stone-200">{message}</div>}
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-stone-900 p-6"><p className="text-xs uppercase tracking-widest text-stone-500">Customer vehicle ID</p><p className="mt-2 break-all text-white">{request.car_id}</p><p className="mt-6 text-xs uppercase tracking-widest text-stone-500">Request description</p><p className="mt-2 whitespace-pre-wrap text-stone-200">{request.description}</p></div>
      <div className="rounded-xl border border-white/10 bg-stone-900 p-6"><p className="text-xs uppercase tracking-widest text-stone-500">Timeline</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-stone-500">Submitted</dt><dd className="text-stone-200">{date(request.created_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-stone-500">Last updated</dt><dd className="text-stone-200">{date(request.updated_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-stone-500">Next service</dt><dd className="text-stone-200">{date(request.next_service_date)||'Not set'}</dd></div></dl></div>
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <h2 className="text-xl font-serif text-white">Workflow actions</h2>
      <div className="flex flex-wrap gap-3">
        {request.status==='PENDING' && <Button icon="check" variant="success" loading={action.isPending} loadingText="Working…" onClick={()=>action.mutate(()=>api.acceptRequest(id))}>Accept request</Button>}
        {['ACCEPTED','INSPECTING'].includes(request.status) && <Button icon="search" variant="info" loading={action.isPending} loadingText="Working…" onClick={()=>action.mutate(()=>api.inspectRequest(id))}>Mark inspected</Button>}
        <Button icon="wrench" loading={action.isPending} disabled={request.status==='IN_PROGRESS'} className="bg-transparent border border-stone-600" onClick={()=>action.mutate(()=>api.updateRequestStatus(id,'IN_PROGRESS'))}>{request.status==='IN_PROGRESS'?'In progress ✓':'Mark in progress'}</Button>
        <Button icon="check" loading={action.isPending} disabled={request.status==='COMPLETED'} className="bg-transparent border border-stone-600" onClick={()=>action.mutate(()=>api.updateRequestStatus(id,'COMPLETED'))}>{request.status==='COMPLETED'?'Completed ✓':'Mark completed'}</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-xs uppercase tracking-wider text-stone-500">Next service date<input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label><Button icon="calendar" loading={action.isPending} disabled={!nextDate} onClick={()=>action.mutate(()=>api.setNextServiceDate(id,nextDate))}>Save date</Button></div>
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <div><h2 className="text-xl font-serif text-white">Upload images{images.length>0&&<span className="ml-3 rounded-full border border-sky-500/60 bg-sky-500/10 px-2.5 py-0.5 align-middle text-xs font-bold text-sky-300">{images.length} added</span>}</h2><p className="mt-1 text-sm text-stone-500">Attach before/after photos and part images to this request (JPEG, PNG or WebP).</p></div>
      <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={e=>{e.preventDefault();uploadImage.mutate()}}>
        <label className="text-xs uppercase tracking-wider text-stone-500">Image
          <input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setFile(e.target.files?.[0]??null)} className="mt-2 block w-full text-sm text-stone-400 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-stone-700"/>
        </label>
        <label className="text-xs uppercase tracking-wider text-stone-500">Category
          <select value={category} onChange={e=>setCategory(e.target.value as ImageCategory)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white">
            {(['BEFORE','DAMAGE_PART','REMOVED_PART','REPLACEMENT_PART','AFTER'] as ImageCategory[]).map(c=><option key={c} value={c}>{c.replaceAll('_',' ')}</option>)}
          </select>
        </label>
        {preview && <img src={preview} alt="Selected upload preview" className="h-40 w-full rounded-lg object-cover md:col-span-2"/>}
        {images.length>0&&<div className="grid grid-cols-3 gap-2 md:col-span-2">{images.map(im=><a key={im.id} href={im.image_url} target="_blank" rel="noreferrer" title={im.category.replaceAll('_',' ')}><img src={im.image_url} alt={im.category} className="h-24 w-full rounded-lg object-cover"/></a>)}</div>}
        <div className="md:col-span-2"><Button type="submit" icon={justUploaded?'check':'upload'} variant={justUploaded?'success':'primary'} loading={uploadImage.isPending} loadingText="Uploading…" disabled={!file}>{justUploaded?'Image added ✓':'Upload image'}</Button></div>
      </form>
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <div className="flex items-end justify-between"><h2 className="text-xl font-serif text-white">Requested service cost</h2><span className="font-mono text-sm text-stone-400">{ngn(requestedTotal)}</span></div>
      {requestedServices.length>0
        ? <div className="divide-y divide-white/5">{requestedServices.map(svcRow)}</div>
        : canPrice
          ? <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={e=>{e.preventDefault();saveRequestedCost()}}>
              <label className="text-xs uppercase tracking-wider text-stone-500">Cost (₦)<input required type="number" min="0.01" step="0.01" value={reqCost} onChange={e=>setReqCost(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
              <Button type="submit" icon="save" loading={addService.isPending&&addService.variables?.is_additional===false} loadingText="Saving…" disabled={addService.isPending||Number(reqCost)<=0}>Save cost</Button>
            </form>
          : <p className="rounded-lg border border-white/10 bg-stone-950 p-4 text-sm text-stone-400">Accept the request first, then set the cost of the service the customer requested.</p>}
    </section>
    <section className="rounded-xl border border-white/10 bg-stone-900 p-6 space-y-4">
      <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-serif text-white">Additional services <span className="text-sm text-stone-500">(optional)</span></h2><p className="mt-1 text-sm text-stone-500">Extra work found during inspection. The customer approves or declines each one before it counts toward the cost.</p></div><span className="shrink-0 font-mono text-sm text-stone-400">Approved {ngn(approvedExtra)}</span></div>
      {additionalServices.length>0&&<div className="divide-y divide-white/5">{additionalServices.map(svcRow)}</div>}
      {request.status==='INSPECTING'
        ? showExtra
          ? <form className="grid gap-4 md:grid-cols-2" onSubmit={e=>{e.preventDefault();addService.mutate({name,description,cost:Number(cost),is_additional:true})}}>
              <label className="text-xs uppercase tracking-wider text-stone-500">Service name<input required minLength={2} maxLength={20} value={name} onChange={e=>setName(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
              <label className="text-xs uppercase tracking-wider text-stone-500">Cost (₦)<input required type="number" min="0.01" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} className="mt-2 block w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
              <label className="text-xs uppercase tracking-wider text-stone-500 md:col-span-2">Note for the customer<textarea required minLength={5} maxLength={100} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What was found and why it needs work" className="mt-2 block min-h-24 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-3 text-white"/></label>
              <div className="flex gap-3 md:col-span-2"><Button type="submit" icon="plus" loading={addService.isPending&&addService.variables?.is_additional===true} loadingText="Adding…" disabled={addService.isPending||!name||!description||Number(cost)<=0}>Add additional service</Button><Button type="button" icon="x" className="bg-transparent" onClick={()=>setShowExtra(false)}>Cancel</Button></div>
            </form>
          : <Button icon="plus" className="bg-transparent" onClick={()=>setShowExtra(true)}>Add additional service</Button>
        : additionalServices.length===0&&<p className="rounded-lg border border-white/10 bg-stone-950 p-4 text-sm text-stone-400">Additional services can only be added while the request is in the <strong className="text-stone-200">Inspecting</strong> state.</p>}
    </section>
  </div>
}
