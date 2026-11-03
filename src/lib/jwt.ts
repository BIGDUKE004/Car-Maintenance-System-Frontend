export interface JwtPayload { sub: string; role: 'CUSTOMER' | 'WORKSHOP_ADMIN'; exp: number }
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload
  } catch { return null }
}
