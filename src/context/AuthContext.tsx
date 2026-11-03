import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken } from '@/services/api'
import type { UserProfileResponse } from '@/services/types'

interface AuthCtx { user: UserProfileResponse | null; loading: boolean; logout: () => void; reloadUser: () => Promise<void> }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, logout: () => {}, reloadUser: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!getToken()) { setLoading(false); return }
    try { setUser(await api.me()) } catch { clearToken() } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const logout = () => { clearToken(); setUser(null); window.location.href = '/' }
  return <Ctx.Provider value={{ user, loading, logout, reloadUser: load }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
