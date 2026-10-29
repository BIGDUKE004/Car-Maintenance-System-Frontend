export const money = (n) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const label = (value) => String(value ?? '').replaceAll('_', ' ');

export const pillClass = (value) => `status-pill status-${String(value || 'pending').toLowerCase()}`;

export const dateOnly = (value) => (value ? new Date(value).toLocaleDateString() : '—');
export const dateTime = (value) => (value ? new Date(value).toLocaleString() : '—');

// <input type="datetime-local"> wants LOCAL time; toISOString() is UTC.
export function toLocalInput(date = new Date()) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

export const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v).trim());

// The backend rejects passwords over 72 BYTES (bcrypt), not 72 characters.
export const byteLength = (s) => new TextEncoder().encode(s).length;
