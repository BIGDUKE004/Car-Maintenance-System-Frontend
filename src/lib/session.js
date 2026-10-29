// The backend puts { sub, role, exp } in the JWT (app/config/security.py).
// We only read it to decide which area to show; the backend still enforces
// every permission (require_admin / assert_*_access).
export const ROLES = { customer: 'CUSTOMER', admin: 'WORKSHOP_ADMIN' };

export function decodeToken(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isExpired(payload) {
  return !payload?.exp || payload.exp * 1000 <= Date.now();
}

export function roleOf(token) {
  const payload = decodeToken(token);
  return payload && !isExpired(payload) ? payload.role : null;
}

export const isAdminRole = (role) => role === ROLES.admin;
export const homeFor = (role) => (isAdminRole(role) ? '/admin' : '/app');
