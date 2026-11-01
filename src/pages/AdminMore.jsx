import { useState } from "react";
import { Link } from "react-router-dom";
import { api, naira, fmt, label } from "../api";
import { Card, Err, Pill, useLoad } from "../ui";

const Table = ({ head, rows, empty = "Nothing here yet." }) => (
  <Card><table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
    {rows.length === 0 && <p className="empty">{empty}</p>}</Card>
);
const SearchBox = ({ value, onChange, ph }) => <input className="searchbox" placeholder={ph} value={value} onChange={(e) => onChange(e.target.value)} />;

export function Customers() {
  const [q, setQ] = useState("");
  const { data, error } = useLoad(() => api(`/admin/customers?search=${encodeURIComponent(q)}`), [q]);
  return (<><h1>Customers</h1><SearchBox value={q} onChange={setQ} ph="Search by name, email or phone" /><Err e={error} />
    <Table head={["Name", "Email", "Phone", "Vehicles", "Joined"]} rows={(data || []).map((c) => [`${c.first_name} ${c.last_name}`, c.email, c.phone, c.vehicle_count, fmt(c.created_at)])} /></>);
}

export function Vehicles() {
  const [q, setQ] = useState("");
  const { data, error } = useLoad(() => api(`/admin/vehicles?search=${encodeURIComponent(q)}`), [q]);
  return (<><h1>Vehicles</h1><SearchBox value={q} onChange={setQ} ph="Search by plate, VIN, make or owner" /><Err e={error} />
    <Table head={["Vehicle", "Plate", "VIN", "Color", "Owner"]} rows={(data || []).map((v) => [`${v.year} ${v.make} ${v.model}`, v.plate_number, v.vin, v.color, v.owner_name])} /></>);
}

export function AdminPayments() {
  const { data, error } = useLoad(() => api("/admin/payments"));
  const { data: review, reload } = useLoad(() => api("/admin/payment-transactions"));
  const [err, setErr] = useState("");
  const resolve = async (ref) => { setErr(""); try { await api(`/admin/payment-transactions/${ref}/resolve`, { method: "PATCH" }); reload(); } catch (x) { setErr(x.message); } };
  return (<><h1>Payments</h1><Err e={err || error} />
    {review?.length > 0 && <Card title="Payments requiring review">{review.map((t) => <div className="row" key={t.reference}><div><b>{t.reference}</b><small>{naira(t.amount)} · {fmt(t.created_at)}</small></div><button className="btn blue sm" onClick={() => resolve(t.reference)}>Mark resolved</button></div>)}</Card>}
    <Table head={["Reference", "Customer", "Vehicle", "Service", "Method", "Date", "Amount"]} rows={(data || []).map((p) => [p.reference, p.customer_name, p.plate_number, p.service_name || "-", p.method, fmt(p.payment_date), naira(p.amount)])} /></>);
}

export function Images() {
  const [cat, setCat] = useState("");
  const { data, error } = useLoad(() => api(`/admin/maintenance-images${cat ? `?category=${cat}` : ""}`), [cat]);
  return (<><h1>Maintenance Images</h1>
    <div className="tabs">{["", "BEFORE", "DAMAGE_PART", "REMOVED_PART", "REPLACEMENT_PART", "AFTER"].map((c) => <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c ? label(c) : "ALL"}</button>)}</div><Err e={error} />
    <div className="photos big">{(data || []).map((i) => <Link key={i.id} to={`/admin/requests/${i.maintenance_request_id}`}><figure><img src={i.image_url} alt="" /><figcaption>{label(i.category)} · {i.plate_number}<br />{i.customer_name}</figcaption></figure></Link>)}</div>
    {data?.length === 0 && <p className="empty">No images.</p>}</>);
}

export function NotificationProblems() {
  const { data, error, reload } = useLoad(() => api("/admin/email-notifications"));
  const [msg, setMsg] = useState("");
  const run = (path, fn) => async () => { setMsg(""); try { const r = await api(path, { method: "POST" }); setMsg(fn(r)); reload(); } catch (x) { setMsg(x.message); } };
  return (<><div className="bar"><div><h1>Notification Problems</h1><p className="sub">Emails that failed to send.</p></div><button className="btn dark" onClick={run("/admin/email-notifications/retry-failed", (r) => `${r.sent} sent, ${r.still_failed} still failing.`)}>Retry all failed</button></div>
    <Err e={error} />{msg && <p className="note">{msg}</p>}
    <Table empty="No failed emails. 🎉" head={["Recipient", "Subject", "Status", ""]} rows={(data || []).map((n) => [n.recipient_email || "-", n.subject, <Pill s="CANCELED" />, <button className="btn dark sm" onClick={run(`/admin/email-notifications/${n.id}/retry`, (r) => `Status: ${r.status}`)}>Retry</button>])} /></>);
}

export function Administrators() {
  const { data, error, reload } = useLoad(() => api("/admin/admins"));
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" }), [err, setErr] = useState("");
  const add = async (e) => { e.preventDefault(); setErr(""); try { await api("/admin/admins", { method: "POST", body: f }); setF({ first_name: "", last_name: "", email: "", phone: "", password: "" }); reload(); } catch (x) { setErr(x.message); } };
  return (<><h1>Administrators</h1><Err e={error} />
    <Table head={["Name", "Email", "Phone", "Added"]} rows={(data || []).map((a) => [`${a.first_name} ${a.last_name}`, a.email, a.phone, fmt(a.created_at)])} />
    <Card title="Add Administrator"><form className="inline" onSubmit={add}>{Object.keys(f).map((k) => <input key={k} required placeholder={label(k)} type={k === "password" ? "password" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}<button className="btn dark sm">Add</button></form><Err e={err} /></Card></>);
}

export function Reports() {
  const { data: r, error } = useLoad(() => api("/admin/reports?days=180"));
  if (!r) return <Err e={error} />;
  const max = Math.max(1, ...r.revenue_by_month.map((m) => Number(m.revenue)));
  return (<><h1>Reports</h1><p className="sub">Last {r.period_days} days.</p>
    <div className="grid4"><Card className="stat"><span>Revenue</span><b>{naira(r.total_revenue)}</b></Card><Card className="stat"><span>New requests</span><b>{r.requests_created}</b></Card></div>
    <div className="grid2">
      <Card title="Revenue by month">{r.revenue_by_month.map((m) => <div key={m.month} className="bar-row"><span>{m.month}</span><i style={{ width: `${(Number(m.revenue) / max) * 100}%` }} /><b>{naira(m.revenue)}</b></div>)}{r.revenue_by_month.length === 0 && <p className="empty">No payments in this period.</p>}</Card>
      <Card title="Requests by status">{Object.entries(r.requests_by_status).map(([k, v]) => <div className="row" key={k}><Pill s={k} /><b>{v}</b></div>)}</Card>
      <Card title="Top services">{r.top_services.map((s) => <div className="row" key={s.name}><div><b>{s.name}</b><small>{s.count} job(s)</small></div><b>{naira(s.revenue)}</b></div>)}</Card>
      <Card title="Payments by method">{Object.entries(r.payments_by_method).map(([k, v]) => <div className="row" key={k}><span>{k}</span><b>{naira(v)}</b></div>)}</Card>
    </div></>);
}
