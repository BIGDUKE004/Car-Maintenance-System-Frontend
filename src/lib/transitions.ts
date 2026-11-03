import type { MaintenanceStatus } from '@/services/types'
export const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  PENDING: ['ACCEPTED'], ACCEPTED: ['INSPECTING'], INSPECTING: ['AWAITING_APPROVAL', 'IN_PROGRESS'],
  AWAITING_APPROVAL: ['IN_PROGRESS'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [], CANCELED: [],
}
export const STATUS_ORDER: MaintenanceStatus[] = ['PENDING', 'ACCEPTED', 'INSPECTING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'COMPLETED']
export const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  PENDING: 'Received', ACCEPTED: 'Accepted', INSPECTING: 'Inspecting',
  AWAITING_APPROVAL: 'Awaiting approval', IN_PROGRESS: 'In progress', COMPLETED: 'Ready', CANCELED: 'Canceled',
}
