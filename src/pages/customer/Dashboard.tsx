import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, date } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { Icon } from '@/components/ds/Icon'

export default function Dashboard() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['my-cars'], queryFn: api.listMyCars })
  if (isLoading) return <div className="space-y-8"><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-white mb-2">My Garage</h1>
          <p className="text-stone-400 text-lg">Manage your vehicles and service history.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/payments"><Button className="bg-transparent border-stone-700"><Icon name="credit-card" className="w-4 h-4 mr-2 inline" /> Pay Balance</Button></Link>
          <Link to="/request-service"><Button className="px-6 py-4"><Icon name="wrench" className="w-4 h-4 mr-2 inline" /> Request Service</Button></Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {cars?.map(car => {
          const requests = car.requests || [];
          const nextService = requests.length > 0 ? requests[0].next_service_date : null;
          const totalBalance = requests.reduce((sum, r) => sum + Number(r.balance || 0), 0);

          return (
            <div key={car.id} className="group relative">
              <div className="h-64 relative overflow-hidden bg-stone-900 mb-6 rounded-xl">
                {car.image_url ? <img src={car.image_url} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-stone-700 bg-stone-800">No Image Provided</div>}
                <div className="absolute top-4 left-4 bg-stone-950/80 px-3 py-1 text-xs font-mono text-white tracking-widest border border-white/10 rounded">{car.plate_number}</div>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-serif text-white mb-1">{car.year} {car.make} {car.model}</h3>
                  <div className="text-sm text-stone-500 uppercase tracking-wider">VIN: {car.vin}</div>
                </div>
                <Link to={`/vehicle/${car.id}`} className="text-brand text-sm font-bold uppercase tracking-wider border-b border-brand pb-1 hover:text-white hover:border-white transition-colors">Details</Link>
              </div>
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
                <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Next Service</div><div className="text-white font-mono text-lg">{date(nextService) || 'Not scheduled'}</div></div>
                <div><div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Outstanding</div><div className={`font-mono text-lg ${totalBalance > 0 ? 'text-brand' : 'text-stone-300'}`}>{ngn(totalBalance)}</div></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
