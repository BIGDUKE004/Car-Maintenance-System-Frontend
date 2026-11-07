import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export default function AddVehicle() {
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plate_number: '',
    vin: '',
  })

  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')

  const qc = useQueryClient()
  const nav = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!image) {
        throw new Error('Vehicle image is required')
      }
      const car = await api.addCar({
        ...form,
        make: form.make.trim(),
        model: form.model.trim(),
        color: form.color.trim(),
        plate_number: form.plate_number.trim(),
        vin: form.vin.trim(),
      })

      if (image) {
        await api.uploadCarPhoto(car.car_id, image)
      }

      return car
    },

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-cars'] })
      nav('/dashboard')
    },

    onError: (e: any) => setError(e.message),
  })

  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    type = 'text'
  ) => (
    <label className="block text-xs uppercase tracking-wider text-stone-500">
      {label}

      <Input
        type={type}
        value={form[key]}
        onChange={e => {
          setForm({
            ...form,
            [key]: type === 'number'
              ? Number(e.target.value)
              : e.target.value,
          })
          setError('')
        }}
        required
        minLength={type === 'number' ? undefined : 1}
        maxLength={type === 'number' ? undefined : 20}
        min={type === 'number' ? 1886 : undefined}
        max={type === 'number' ? new Date().getFullYear() + 1 : undefined}
        className="mt-2 h-12 bg-stone-950 border-stone-700"
        placeholder={placeholder}
      />
    </label>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="border-b border-white/10 pb-6">
        <Link
          to="/dashboard"
          className="text-xs uppercase tracking-widest text-stone-500"
        >
          ← My garage
        </Link>

        <h1 className="mt-3 text-4xl font-serif text-white">
          Add a vehicle
        </h1>

        <p className="mt-2 text-sm text-stone-400">
          Register your vehicle before requesting maintenance.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <form
        onSubmit={e => {
          e.preventDefault()
          setError('')

          if (!form.make.trim()) {
            setError('Please enter the vehicle make.')
            return
          }

          if (!form.model.trim()) {
            setError('Please enter the vehicle model.')
            return
          }

          if (
            !Number.isInteger(Number(form.year)) ||
            Number(form.year) < 1886 ||
            Number(form.year) > new Date().getFullYear() + 1
          ) {
            setError('Enter a valid vehicle year.')
            return
          }

          if (!form.color.trim()) {
            setError('Please enter the vehicle color.')
            return
          }

          if (!form.plate_number.trim()) {
            setError('Please enter the plate number.')
            return
          }

          if (!form.vin.trim()) {
            setError('Please enter the VIN.')
            return
          }

          mutation.mutate()
        }}
        className="grid gap-5 rounded-xl border border-white/10 bg-stone-900 p-6 sm:grid-cols-2"
      >
        {field('make', 'Make', 'Toyota')}

        {field('model', 'Model', 'Camry')}

        {field('year', 'Year', '2022', 'number')}

        {field('color', 'Color', 'Black')}

        {field('plate_number', 'Plate number', 'ABC-123-XY')}

        {field('vin', 'VIN', 'Vehicle identification number')}

        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-wider text-stone-500">
            Vehicle image

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={e => {
                const selectedFile = e.target.files?.[0] ?? null
                setImage(selectedFile)
                setError('')
              }}
              className="mt-2 block w-full text-sm text-stone-400
                file:mr-4 file:rounded-lg file:border-0
                file:bg-stone-800 file:px-4 file:py-2
                file:text-sm file:text-white
                hover:file:bg-stone-700"
            />

            <p className="mt-2 text-xs text-stone-500">
              Optional. JPEG, PNG or WebP.
            </p>

            {image && (
              <p className="mt-2 text-xs text-stone-400">
                Selected: {image.name}
              </p>
            )}
          </label>
        </div>

        <div className="sm:col-span-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? 'Saving…' : 'Save vehicle'}
          </Button>
        </div>
      </form>
    </div>
  )
}