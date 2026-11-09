import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function RequestService() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  const [params] = useSearchParams()
  const presetCarId = params.get('car') || ''
  const [carId, setCarId] = useState(presetCarId)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => api.submitRequest({ car_id: presetCarId && carId === presetCarId ? carId : carId, description, request_date: new Date().toISOString() }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['my-cars'] }); nav('/dashboard') },
    onError: (err: any) => setError(err.message)
  })

  if (isLoading) return <div className="text-white">Loading...</div>
  const presetCar = presetCarId ? cars?.find(c => c.id === presetCarId) : undefined

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-serif text-white mb-2">Request Service</h1>
        <p className="text-stone-400">Describe the issue and we'll get your vehicle back on the road.</p>
      </div>

      {error && <div className="p-4 bg-brand/10 border border-brand text-brand text-sm rounded-xl">{error}</div>}

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-6">
        {presetCar ? (
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Vehicle</label>
            <div className="flex items-center justify-between rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-white">
              <span>{presetCar.year} {presetCar.make} {presetCar.model} <span className="font-mono text-xs text-stone-400">({presetCar.plate_number})</span></span>
              <button type="button" onClick={() => { setCarId(''); nav('/request-service', { replace: true }) }} className="text-xs uppercase tracking-wider text-brand hover:text-white">Change</button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Select Vehicle</label>
            <select
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:ring-brand focus:border-brand outline-none"
              value={carId}
              onChange={e => setCarId(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose a vehicle --</option>
              {cars?.map(c => <option key={c.id} value={c.id}>{c.year} {c.make} {c.model} ({c.plate_number})</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Issue Description</label>
          <textarea 
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white h-32 focus:ring-brand focus:border-brand outline-none"
            placeholder="E.g., The brakes are squeaking when I stop, and there's a vibration in the steering wheel..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={10}
          />
        </div>

        <Button type="submit" icon="wrench" loading={mutation.isPending} loadingText="Submitting…" disabled={!carId} className="w-full py-4 text-base">Submit Request</Button>
      </form>
    </div>
  )
}
