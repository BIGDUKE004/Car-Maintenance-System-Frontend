import { createContext, useContext, useEffect, useState } from 'react'
import { clearToken, getToken } from '@/services/api'
import { decodeJwt } from '@/lib/jwt'
import type { UserProfileResponse } from '@/services/types'

interface AuthCtx { user: UserProfileResponse | null; loading: boolean; logout: () => void; reloadUser: () => Promise<void> }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, logout: () => {}, reloadUser: async () => {} })

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
    setUser({ id: payload.sub, role: payload.role, first_name: '', last_name: '', email: '', phone: '', created_at: '' })
    setLoading(false)
  }
  useEffect(() => { void load() }, [])
  const logout = () => { clearToken(); setUser(null); window.location.href = '/' }
  return <Ctx.Provider value={{ user, loading, logout, reloadUser: load }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
