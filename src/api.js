const BASE = import.meta.env.VITE_API_URL || "https://dashboard.render.com/web/srv-db7mtd6q1p3s73d291r0";

export const auth = {
  get token() { return localStorage.getItem("motora_token"); },
  set(t) { localStorage.setItem("motora_token", t); },
  clear() { localStorage.removeItem("motora_token"); },
  get role() { try { return JSON.parse(atob(this.token.split(".")[1])).role; } catch { return null; } },
};

let refreshing = null;
async function keepAlive() {
  try {
    const exp = JSON.parse(atob(auth.token.split(".")[1])).exp * 1000;
    if (exp - Date.now() > 10 * 60 * 1000 || exp < Date.now()) return;
    refreshing ||= fetch(BASE + "/auth/refresh", { method: "POST", headers: { Authorization: `Bearer ${auth.token}` } })
      .then((r) => r.ok && r.json()).then((d) => d && auth.set(d.access_token)).finally(() => (refreshing = null));
    await refreshing;
  } catch { /* keep the old token */ }
}

export async function api(path, { method = "GET", body, form } = {}) {
  if (auth.token) await keepAlive();
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(auth.token && { Authorization: `Bearer ${auth.token}` }), ...(body && { "Content-Type": "application/json" }) },
    body: form || (body && JSON.stringify(body)),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401 && auth.token) { auth.clear(); location.href = "/login"; }
  if (!res.ok) {
    const d = data?.detail;
    throw new Error(typeof d === "string" ? d : d?.[0]?.msg || "Something went wrong");
  }
  return data;
}

export const naira = (n) => "₦" + Number(n || 0).toLocaleString();
export const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-");
export const label = (s) => String(s || "").replace(/_/g, " ");

export const mr = (id) => "#MR-" + String(id).slice(0, 5).toUpperCase();
