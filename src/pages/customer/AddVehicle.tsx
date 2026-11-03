import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function AddVehicle(){
 const [form,setForm]=useState({make:'',model:'',year:new Date().getFullYear(),color:'',plate_number:'',vin:''})
 const [error,setError]=useState('');const qc=useQueryClient();const nav=useNavigate()
 const mutation=useMutation({mutationFn:()=>api.addCar(form),onSuccess:async()=>{await qc.invalidateQueries({queryKey:['my-cars']});nav('/dashboard')},onError:(e:any)=>setError(e.message)})
 const field=(key:keyof typeof form,label:string,placeholder:string,type='text')=><label className="block text-xs uppercase tracking-wider text-stone-500">{label}<Input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:type==='number'?Number(e.target.value):e.target.value})} required className="mt-2 h-12 bg-stone-950 border-stone-700" placeholder={placeholder}/></label>
 return <div className="mx-auto max-w-2xl space-y-7"><header className="border-b border-white/10 pb-6"><Link to="/dashboard" className="text-xs uppercase tracking-widest text-stone-500">← My garage</Link><h1 className="mt-3 text-4xl font-serif text-white">Add a vehicle</h1><p className="mt-2 text-sm text-stone-400">Register your vehicle before requesting maintenance.</p></header>{error&&<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}<form onSubmit={e=>{e.preventDefault();mutation.mutate()}} className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6 sm:grid-cols-2">{field('make','Make','Toyota')}{field('model','Model','Camry')}{field('year','Year','2022','number')}{field('color','Color','Black')}{field('plate_number','Plate number','ABC-123-XY')}{field('vin','VIN','Vehicle identification number')}<div className="sm:col-span-2"><Button type="submit" disabled={mutation.isPending} className="w-full">{mutation.isPending?'Saving…':'Save vehicle'}</Button></div></form></div>
}
