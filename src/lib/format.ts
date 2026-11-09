export const ngn = (v: string | number | null | undefined): string => {
  const n = typeof v === 'string' ? Number(v) : v ?? 0
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n)
}
export const date = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: '2-digit' })
}
export const dateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
export const initials = (first?: string, last?: string) => `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
export const fullName = (u?: { first_name?: string; last_name?: string; email?: string } | null) =>
  [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.email || 'My account'
