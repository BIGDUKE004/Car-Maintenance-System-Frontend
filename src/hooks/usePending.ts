import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { pendingAdditional } from '@/lib/approval'
import type { MaintenanceServiceResponse } from '@/services/types'

export type ServiceMap = Record<string, MaintenanceServiceResponse[] | null>

/** Customer side: every request's services. null = could not be loaded (never treated as "approved"). */
export function useCustomerRequestServices(ids: string[]) {
  return useQuery({
    queryKey: ['customer-request-services', ids.join(',')],
    enabled: ids.length > 0,
    refetchInterval: 15000,
    refetchOnMount: 'always',
    queryFn: async () =>
      Object.fromEntries(await Promise.all(ids.map(async id => [id, await api.requestServices(id).catch(() => null)] as const))) as ServiceMap,
  })
}

/** Pending count for a request; falls back to a server-provided count when the list is unknown. */
export const pendingFor = (map: ServiceMap | undefined, id: string, fallback = 0) => {
  const list = map?.[id]
  return list ? pendingAdditional(list) : fallback
}

/** Admin side: pending counts for requests the server still marks AWAITING_APPROVAL. null = unknown. */
export function useAdminPending(requests: { id: string; status: string }[] | undefined) {
  const ids = (requests ?? []).filter(r => r.status === 'AWAITING_APPROVAL').map(r => r.id)
  const q = useQuery({
    queryKey: ['admin-pending-counts', ids.join(',')],
    enabled: ids.length > 0,
    refetchInterval: 15000,
    queryFn: async () =>
      Object.fromEntries(await Promise.all(ids.map(async id => {
        const list = await api.adminRequestServices(id).catch(() => null)
        return [id, list ? pendingAdditional(list) : null] as const
      }))) as Record<string, number | null>,
  })
  return q.data ?? ({} as Record<string, number | null>)
}

/** Label for an admin request: only "Waiting for approval" while something is actually waiting. */
export const adminStatusLabel = (status: string, pending: number | null | undefined) => {
  if (status !== 'AWAITING_APPROVAL') return { text: status.replaceAll('_', ' '), tone: 'normal' as const }
  if (pending == null) return { text: 'AWAITING APPROVAL', tone: 'waiting' as const }
  return pending > 0
    ? { text: `Waiting for approval (${pending})`, tone: 'waiting' as const }
    : { text: 'APPROVED', tone: 'approved' as const }
}
