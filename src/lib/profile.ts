// The backend JWT only carries id + role, so we keep a small local profile
// (name/email) captured at registration/login and refreshed from the API when possible.
export interface LocalProfile { first_name: string; last_name: string; email: string; phone: string }
const key = (id: string) => `motora.profile.${id}`
const emailKey = (email: string) => `motora.pending.${email.trim().toLowerCase()}`

export const saveProfile = (id: string, p: Partial<LocalProfile>) => {
  try { localStorage.setItem(key(id), JSON.stringify({ ...loadProfile(id), ...p })) } catch {}
}
export const loadProfile = (id: string): LocalProfile => {
  try { return { first_name: '', last_name: '', email: '', phone: '', ...JSON.parse(localStorage.getItem(key(id)) || '{}') } }
  catch { return { first_name: '', last_name: '', email: '', phone: '' } }
}
export const rememberRegistration = (p: LocalProfile) => {
  try { localStorage.setItem(emailKey(p.email), JSON.stringify(p)) } catch {}
}
export const recallRegistration = (email: string): LocalProfile | null => {
  try { const v = localStorage.getItem(emailKey(email)); return v ? JSON.parse(v) : null } catch { return null }
}
