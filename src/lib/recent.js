// The backend has no "list all requests" endpoint, so the admin console keeps a
// small per-device list of requests the admin has opened. It is a convenience
// only; nothing here is a source of truth.
const KEY = 'motora_admin_recent';
const MAX = 8;

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function rememberRequest(entry) {
  try {
    const rest = getRecent().filter((r) => r.id !== entry.id);
    localStorage.setItem(KEY, JSON.stringify([{ ...entry, at: Date.now() }, ...rest].slice(0, MAX)));
  } catch { /* storage unavailable: ignore */ }
}

export function forgetRequest(id) {
  try { localStorage.setItem(KEY, JSON.stringify(getRecent().filter((r) => r.id !== id))); } catch { /* ignore */ }
}
