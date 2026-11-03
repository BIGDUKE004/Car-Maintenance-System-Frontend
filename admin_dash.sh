#!/bin/bash
set -e

echo "Building Command Center..."

# 1. UPDATE API TYPES FOR DASHBOARD
cat > src/services/types.ts << 'FILE'
// Keep all existing types, just ensuring we have the full AdminDashboardResponse
export type UserRole = 'CUSTOMER' | 'WORKSHOP_ADMIN'
export type MaintenanceStatus = 'PENDING' | 'ACCEPTED' | 'INSPECTING' | 'AWAITING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'
export type ImageCategory = 'BEFORE' | 'DAMAGE_PART' | 'REMOVED_PART' | 'REPLACEMENT_PART' | 'AFTER'

export interface TokenResponse { access_token: string; token_type: string }
export interface UserProfileResponse { id: string; first_name: string; last_name: string; email: string; phone: string; role: UserRole; created_at: string }
export interface UserCreate { first_name: string; last_name: string; email: string; password: string; phone: string }
export interface LoginRequest { email: string; password: string }
export interface ProfileUpdate { first_name?: string; last_name?: string; phone?: string }
export interface ChangePasswordRequest { current_password: string; new_password: string }
export interface CarCreate { make: string; model: string; year: number; color: string; plate_number: string; vin: string }
export interface CustomerCarDetailResponse { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null; created_at: string; requests: CustomerRequestResponse[] }
export interface CustomerRequestResponse { id: string; description: string; request_date: string; status: MaintenanceStatus; updated_at: string; completed_at?: string | null; next_service_date?: string | null; car: { id: string; make: string; model: string; year: number; plate_number: string }; total_cost: string; total_paid: string; balance: string; pending_approval_count: number }
export interface MaintenanceRequestCreate { car_id: string; description: string; request_date: string }
export interface MaintenanceServiceResponse { id: string; maintenance_request_id: string; name: string; description: string; cost: string; is_additional: boolean; approval: ApprovalStatus; created_at: string; approved_at?: string | null; updated_at?: string | null }
export interface PaymentSummaryResponse { total_billed: string; total_paid: string; outstanding_balance: string; unpaid_services: { service_id: string; maintenance_request_id: string; name: string; balance: string }[] }
export interface CustomerPaymentItem { reference: string; maintenance_request_id: string; request_description: string; amount: string; date: string; status: string; method?: PaymentMethod | null }

export interface DashboardRequestItem { id: string; description: string; status: MaintenanceStatus; request_date: string; updated_at: string; customer_name: string; plate_number: string; vehicle: string; pending_approval_count?: number }
export interface DashboardSection { count: number; items: DashboardRequestItem[] }
export interface DashboardStatistics { total_requests: number; by_status: Record<string, number>; created_last_30_days: number; completed_last_30_days: number; total_revenue: string }
export interface DashboardActivityItem { request_id: string; status: MaintenanceStatus; description: string; customer_name: string; plate_number: string; occurred_at: string }
export interface PaymentTransactionResponse { id: string; reference: string; user_id: string; maintenance_request_id: string; maintenance_service_id: string; amount: string; status: string; created_at: string; paid_at?: string | null }

export interface AdminDashboardResponse {
  statistics: DashboardStatistics;
  pending_work: DashboardSection;
  awaiting_customer_approval: DashboardSection;
  payments_needing_review: { count: number; items: PaymentTransactionResponse[] };
  notification_problems: { failed_count: number };
  recent_activity: DashboardActivityItem[]
}

export interface AdminMaintenanceRequestResponse { id: string; description: string; request_date: string; status: MaintenanceStatus; created_at: string; updated_at: string; completed_at?: string | null; next_service_date?: string | null; inspection_notes?: string | null; inspected_at?: string | null; customer: { id: string; first_name: string; last_name: string; email: string; phone: string }; vehicle: { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null } }
export interface AdminMaintenanceRequestDetailResponse extends AdminMaintenanceRequestResponse { services: MaintenanceServiceResponse[]; images: { id: string; image_url: string; category: ImageCategory }[]; payments: { id: string; amount: string; method: PaymentMethod; reference: string; payment_date: string }[]; approvals: { pending: number; approved: number; rejected: number }; total_cost: string; total_paid: string; balance: string }
export interface AdminCustomerListItem { id: string; first_name: string; last_name: string; email: string; phone: string; created_at: string; vehicle_count: number }
export interface AdminVehicleListItem { id: string; make: string; model: string; year: number; color: string; plate_number: string; vin: string; image_url?: string | null; owner_id: string; owner_name: string }
export interface AdminAwaitingApprovalResponse { request: AdminMaintenanceRequestResponse; pending_services: MaintenanceServiceResponse[]; approvals: { pending: number; approved: number; rejected: number } }
export interface AdminReportResponse { period_days: number; total_revenue: string; requests_created: number; revenue_by_month: { month: string; revenue: string }[]; requests_by_status: Record<string, number>; payments_by_method: Record<string, string>; top_services: { name: string; count: number; revenue: string }[] }
FILE

# 2. UPGRADE ADMIN DASHBOARD
cat > src/pages/admin/AdminDashboard.tsx << 'FILE'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Skeleton } from '@/components/ds/Skeleton'
import { ngn, dateTime, date } from '@/lib/format'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ds/Icon'
import { Button } from '@/components/ds/Button'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dash'], queryFn: api.adminDashboard })
  
  if (isLoading) return <div className="space-y-6"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
  if (!data) return null

  return (
    <div className="space-y-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Command Center</h1>
          <p className="text-stone-400">Live workshop operations and financial overview.</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-stone-900 border border-white/10 text-white hover:bg-stone-800 uppercase tracking-wider text-xs px-6 py-3">Export Report</Button>
          <Link to="/admin/requests">
            <Button className="bg-brand text-white hover:bg-brand-hover uppercase tracking-wider text-xs px-6 py-3">New Request</Button>
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon name="gauge" className="w-16 h-16 text-brand" />
          </div>
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Total Revenue</div>
          <div className="text-3xl font-mono text-white mb-2">{ngn(data.statistics.total_revenue)}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-brand">↑ {data.statistics.completed_last_30_days}</span> jobs completed (30d)
          </div>
        </div>

        {/* Active Work */}
        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden group">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Requests</div>
          <div className="text-3xl font-mono text-white mb-2">{data.statistics.total_requests}</div>
          <div className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-stone-300">↑ {data.statistics.created_last_30_days}</span> new this month
          </div>
        </div>

        {/* Awaiting Approval */}
        <Link to="/admin/requests?status=AWAITING_APPROVAL" className="bg-stone-900 border border-brand/20 hover:border-brand/50 p-6 relative overflow-hidden group transition-colors block">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
             <Icon name="shield" className="w-16 h-16 text-brand" />
          </div>
          <div className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Awaiting Approval</div>
          <div className="text-3xl font-mono text-white mb-2">{data.awaiting_customer_approval.count}</div>
          <div className="text-xs text-stone-400">Clients need to approve estimates</div>
        </Link>

        {/* Alerts */}
        <div className="bg-stone-900 border border-white/5 p-6 relative overflow-hidden">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">System Alerts</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400">Failed emails</span>
              <span className={`font-mono ${data.notification_problems.failed_count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.notification_problems.failed_count}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400">Payment review</span>
              <span className={`font-mono ${data.payments_needing_review.count > 0 ? 'text-brand font-bold' : 'text-stone-500'}`}>{data.payments_needing_review.count}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* MAIN QUEUE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Work */}
          <div className="bg-stone-900 border border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-serif text-white">Pending Work Queue</h2>
              <Link to="/admin/requests" className="text-xs font-bold text-brand uppercase tracking-wider hover:text-white transition-colors">View All</Link>
            </div>
            <div className="divide-y divide-white/5">
              {data.pending_work.items.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-sm">No pending work in the queue.</div>
              ) : data.pending_work.items.map(item => (
                <Link to={`/admin/requests/${item.id}`} key={item.id} className="block p-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'PENDING' ? 'border-stone-500 text-stone-300' :
                        item.status === 'ACCEPTED' ? 'border-blue-500/50 text-blue-400' :
                        item.status === 'INSPECTING' ? 'border-purple-500/50 text-purple-400' :
                        'border-brand/50 text-brand'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </div>
                      <div className="font-medium text-white group-hover:text-brand transition-colors">{item.customer_name}</div>
                    </div>
                    <div className="text-xs font-mono text-stone-500">{date(item.request_date)}</div>
                  </div>
                  <div className="text-sm text-stone-400 flex items-center gap-2 mt-1 ml-1">
                    <span className="font-mono text-xs border border-white/10 px-1.5 py-0.5 text-stone-300">{item.plate_number}</span>
                    {item.vehicle}
                  </div>
                  <div className="text-sm text-stone-500 mt-2 truncate ml-1">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR ACTIVITY */}
        <div className="space-y-8">
          <div className="bg-stone-900 border border-white/5">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-serif text-white">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-6">
              {data.recent_activity.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 4 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />}
                  <div className={`w-6 h-6 rounded-full border-2 border-stone-900 flex items-center justify-center shrink-0 z-10 ${
                    activity.status === 'COMPLETED' ? 'bg-brand' : 'bg-stone-700'
                  }`}>
                    {activity.status === 'COMPLETED' && <Icon name="check" className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">{activity.description}</div>
                    <div className="text-xs text-stone-400">{activity.customer_name} • {activity.plate_number}</div>
                    <div className="text-[10px] text-stone-600 uppercase tracking-wider mt-1">{dateTime(activity.occurred_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
FILE

echo "Admin Command Center applied."
