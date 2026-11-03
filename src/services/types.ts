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
