import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken } from '@/services/api'
import { loadProfile, saveProfile } from '@/lib/profile'
import { decodeJwt } from '@/lib/jwt'
import type { UserProfileResponse } from '@/services/types'

interface AuthCtx { user: UserProfileResponse | null; loading: boolean; logout: () => void; reloadUser: () => Promise<void>; updateLocal: (p: Partial<UserProfileResponse>) => void }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, logout: () => {}, reloadUser: async () => {}, updateLocal: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const load = async () => {
    const token = getToken()
    if (!token) { setUser(null); setLoading(false); return }
    const payload = decodeJwt(token)
    if (!payload || !payload.sub || !payload.role || payload.exp * 1000 <= Date.now()) {
      clearToken(); setUser(null); setLoading(false); return
    }
    const local = loadProfile(payload.sub)
    setUser({ id: payload.sub, role: payload.role, ...local, created_at: '' })
    setLoading(false)
    // Refresh from the API if the backend exposes a profile route; otherwise keep the local profile.
    try {
      const me = await api.me()
      if (me) { saveProfile(payload.sub, me); setUser({ ...me, id: payload.sub, role: payload.role }) }
    } catch { /* keep local profile */ }
  }
  useEffect(() => { void load() }, [])
  const logout = () => { clearToken(); setUser(null); window.location.href = '/' }
  const updateLocal = (p: Partial<UserProfileResponse>) => setUser(u => { if (!u) return u; saveProfile(u.id, p); return { ...u, ...p } })
  return <Ctx.Provider value={{ user, loading, logout, reloadUser: load, updateLocal }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
