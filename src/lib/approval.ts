import type { MaintenanceServiceResponse } from '@/services/types'

/** Additional services the customer still has to approve or decline. */
export const pendingAdditional = (services: Pick<MaintenanceServiceResponse, 'is_additional' | 'approval'>[] = []) =>
  services.filter(s => s.is_additional && s.approval === 'PENDING').length

/** Status text for display. "Awaiting approval" only shows while something is actually waiting. */
export const displayStatus = (status: string, pending: number) =>
  status === 'AWAITING_APPROVAL' && pending === 0 ? 'APPROVED' : status.replaceAll('_', ' ')
