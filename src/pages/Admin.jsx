import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, naira, fmt, label } from "../api";
import { Card, Err, Pill, useLoad } from "../ui";
import { Ic } from "../icons";

const FLOW = ["PENDING", "ACCEPTED", "INSPECTING", "IN_PROGRESS", "COMPLETED"];
const CATS = ["BEFORE", "DAMAGE_PART", "REMOVED_PART", "REPLACEMENT_PART", "AFTER"];

export function AHome() {
  const { data: d, error } = useLoad(() => api("/admin/dashboard"));
  const { data: reqs } = useLoad(() => api("/admin/maintenance-requests"));
  const { data: rep } = useLoad(() => api("/admin/reports?days=180"));
  const [open, setOpen] = useState(false), [f, setF] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" }), [msg, setMsg] = useState("");
  if (!d) return <Err e={error} />;
  const s = d.statistics.by_status, done = s.COMPLETED || 0, total = d.statistics.total_requests;
  const addAdmin = async (e) => { e.preventDefault(); setMsg(""); try { await api("/admin/admins", { method: "POST", body: f }); setMsg("Administrator added."); setOpen(false); } catch (x) { setMsg(x.message); } };
  const stat = (t, n, to, ic, c) => <Link to={to} className="card stat"><i className={`sic ${c}`}><Ic n={ic} s={28} /></i><div><span>{t}</span><b>{n}</b></div></Link>;
  return (
    <>
      <div className="bar"><div><h1>Welcome back, Admin 👋</h1><p className="sub">Here's what's happening with your workshop today.</p></div><span className="datechip">{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span></div>
      <div className="grid4">
        {stat("Pending Requests", s.PENDING || 0, "/admin/requests", "wrench", "b")}{stat("In Progress", s.IN_PROGRESS || 0, "/admin/requests", "check", "g")}
        {stat("Awaiting Approval", d.awaiting_customer_approval.count, "/admin/requests", "clock", "o")}{stat("Completed", done, "/admin/requests", "shield", "p")}
      </div>
      <div className="banner" style={{ backgroundImage: "linear-gradient(90deg,#071a3d 38%,#071a3d00),url(/banner.jpg)" }}><small>MOTORA AUTO SERVICE</small><h2>Keep Your Vehicle in Top Condition</h2><p>Professional. Reliable. Always Moving Forward.</p><Link to="/admin/requests" className="btn light">View Maintenance Requests →</Link></div>
      <div className="grid-main">
        <Card title="Recent Maintenance Requests" action={<Link to="/admin/requests">View All →</Link>}>
          <table><thead><tr><th>Customer</th><th>Vehicle</th><th>Description</th><th>Status</th><th>Date</th><th /></tr></thead>
            <tbody>{(reqs || []).slice(0, 5).map((r) => <tr key={r.id}><td>{r.customer.first_name} {r.customer.last_name}</td><td>{r.vehicle.make} {r.vehicle.model}<small>{r.vehicle.plate_number}</small></td><td>{r.description.slice(0, 40)}</td><td><Pill s={r.status} /></td><td>{fmt(r.request_date)}</td><td><Link className="btn dark sm" to={`/admin/requests/${r.id}`}>View</Link></td></tr>)}</tbody></table>
        </Card>
        <div>
          <Card title="Quick Actions">
            <Link to="/admin/requests" className="btn dark wide">View All Requests</Link>
            <button className="btn line wide dk" onClick={() => setOpen(!open)}>Add Administrator</button>
            <Link to="/admin/images" className="btn line wide dk">Upload Image</Link>
            {open && <form className="form" onSubmit={addAdmin}>{Object.keys(f).map((k) => <input key={k} required placeholder={label(k)} type={k === "password" ? "password" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}<button className="btn blue">Save</button></form>}
            {msg && <p className="note">{msg}</p>}
          </Card>
          <Card title="Notifications">
            <p className="dotline"><i className="red" />{d.payments_needing_review.count} payment(s) require review</p>
            <p className="dotline"><i className="blue" />{d.awaiting_customer_approval.count} request(s) awaiting customer</p>
            <p className="dotline"><i className="red" />{d.notification_problems.failed_count} email(s) failed to send</p>
          </Card>
        </div>
      </div>
      <div className="grid-3">
        <Card title="Awaiting Customer Approval" action={<Link to="/admin/requests">View →</Link>}>
          {d.awaiting_customer_approval.items.map((x) => <Link to={`/admin/requests/${x.id}`} className="mini" key={x.id}><span className="dot"><Ic n="clock" s={16} /></span><div><b>{x.customer_name} · {x.plate_number}</b><small>{x.pending_approval_count} service(s) pending</small></div></Link>)}
          {d.awaiting_customer_approval.items.length === 0 && <p className="empty">Nothing waiting on customers.</p>}
        </Card>
        <Card title="Payments Requiring Review" action={<Link to="/admin/payments">View →</Link>}>
          {d.payments_needing_review.items.map((t) => <div className="mini" key={t.reference}><span className="dot"><Ic n="card" s={16} /></span><div><b>{t.reference}</b><small>{naira(t.amount)} · {fmt(t.created_at)}</small></div></div>)}
          {d.payments_needing_review.items.length === 0 && <p className="empty">No payments need review.</p>}
        </Card>
        <Card title="Recent Activity">
          {d.recent_activity.slice(0, 5).map((a) => <Link to={`/admin/requests/${a.request_id}`} className="mini" key={a.request_id}><span className="dot"><Ic n="wrench" s={16} /></span><div><b>{a.customer_name} · {a.plate_number}</b><small>{label(a.status)} · {fmt(a.occurred_at)}</small></div></Link>)}
          {d.recent_activity.length === 0 && <p className="empty">No activity yet.</p>}
        </Card>
      </div>
      <div className="grid2">
        <Card title="Revenue by Month" action={<Link to="/admin/reports">Reports →</Link>}>
          {rep?.revenue_by_month.map((m) => <div key={m.month} className="bar-row"><span>{m.month}</span><i style={{ width: `${(Number(m.revenue) / Math.max(1, ...rep.revenue_by_month.map((x) => Number(x.revenue)))) * 100}%` }} /><b>{naira(m.revenue)}</b></div>)}
          {rep?.revenue_by_month.length === 0 && <p className="empty">No payments recorded yet.</p>}
        </Card>
        <Card title="Top Services">
          {rep?.top_services.map((t) => <div className="row" key={t.name}><div><b>{t.name}</b><small>{t.count} job(s)</small></div><b>{naira(t.revenue)}</b></div>)}
          {rep?.top_services.length === 0 && <p className="empty">No services yet.</p>}
        </Card>
      </div>
      <div className="grid2">
        <Card title="Maintenance Status Overview"><div className="steps">{FLOW.map((k) => <div key={k} className="done"><i />{label(k)}<b>{s[k] || 0}</b></div>)}</div></Card>
        <Card title="Quick Info"><div className="grid2"><div><small>Total Requests</small><h2>{total}</h2></div><div><small>Completion Rate</small><h2>{total ? Math.round((done / total) * 100) : 0}%</h2></div></div></Card>
      </div>
    </>
  );
}

export function ARequests() {
  const [tab, setTab] = useState("ALL");
  const { data, error } = useLoad(() => api("/admin/maintenance-requests" + (tab === "ALL" ? "" : `?status=${tab}`)), [tab]);
  return (
    <>
      <h1>Maintenance Requests</h1>
      <div className="tabs">{["ALL", ...FLOW.slice(0, 2), "INSPECTING", "AWAITING_APPROVAL", "IN_PROGRESS", "COMPLETED"].filter((v, i, a) => a.indexOf(v) === i).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{label(t)}</button>)}</div>
      <Err e={error} />
      <Card><table><thead><tr><th>Customer</th><th>Vehicle</th><th>Description</th><th>Status</th><th>Date</th><th /></tr></thead>
        <tbody>{(data || []).map((r) => <tr key={r.id}><td>{r.customer.first_name} {r.customer.last_name}<small>{r.customer.phone}</small></td><td>{r.vehicle.make} {r.vehicle.model}<small>{r.vehicle.plate_number}</small></td><td>{r.description.slice(0, 50)}</td><td><Pill s={r.status} /></td><td>{fmt(r.request_date)}</td><td><Link className="btn dark sm" to={`/admin/requests/${r.id}`}>View</Link></td></tr>)}</tbody></table>
        {data?.length === 0 && <p className="empty">No requests.</p>}</Card>
    </>
  );
}

export function ARequestDetail() {
  const { id } = useParams();
  const { data: r, error, reload } = useLoad(() => api(`/admin/maintenance-requests/${id}`), [id]);
  const [err, setErr] = useState(""), [notes, setNotes] = useState(""), [svc, setSvc] = useState({ name: "", description: "", cost: "", is_additional: false }), [cat, setCat] = useState("BEFORE"), [date, setDate] = useState("");
  const run = (fn) => async (e) => { e?.preventDefault(); setErr(""); try { await fn(); reload(); } catch (x) { setErr(x.message); } };
  const move = (p, opt) => run(() => api(`/admin/maintenance-requests/${id}/${p}`, { method: "PATCH", ...opt }));
  if (!r) return <Err e={error} />;
  const NEXT = { PENDING: ["Accept Request", move("accept")], ACCEPTED: ["Start Inspection", move("inspect", { body: { notes: notes || null } })], INSPECTING: ["Start Work", move("status?status=IN_PROGRESS")], AWAITING_APPROVAL: ["Start Work", move("status?status=IN_PROGRESS")], IN_PROGRESS: ["Mark Completed", move("status?status=COMPLETED")] }[r.status];
  const upload = run(async () => { const f = new FormData(); f.append("maintenance_request_id", id); f.append("category", cat); f.append("file", document.getElementById("file").files[0]); await api("/admin/maintenance-images/upload", { method: "POST", form: f }); });
  return (
    <>
      <div className="bar"><div><h1>Request Details</h1><p className="sub">{r.description}</p></div><Pill s={r.status} /></div>
      <Err e={err} />
      <div className="grid2">
        <Card title="Customer"><b>{r.customer.first_name} {r.customer.last_name}</b><small>{r.customer.email} · {r.customer.phone}</small></Card>
        <Card title="Vehicle"><b>{r.vehicle.year} {r.vehicle.make} {r.vehicle.model} ({r.vehicle.color})</b><small>Plate {r.vehicle.plate_number} · VIN {r.vehicle.vin}</small></Card>
      </div>
      {NEXT && <Card title="Next step">
        {r.status === "ACCEPTED" && <textarea placeholder="Inspection notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />}
        <button className="btn blue" onClick={NEXT[1]}>{NEXT[0]}</button>
        {r.status === "AWAITING_APPROVAL" && r.approvals.pending > 0 && <small> Waiting for the customer to answer {r.approvals.pending} service(s).</small>}
      </Card>}
      {r.inspection_notes && <Card title="Inspection notes"><p>{r.inspection_notes}</p></Card>}
      <Card title={`Services - total ${naira(r.total_cost)}, paid ${naira(r.total_paid)}`}>
        {r.services.map((s) => <div className="row" key={s.id}><div><b>{s.name}{s.is_additional && " (additional)"}</b><small>{s.description}</small></div><div className="end"><b>{naira(s.cost)}</b>{s.is_additional && <Pill s={s.approval} />}</div></div>)}
        {!["COMPLETED", "CANCELED"].includes(r.status) && <form className="inline" onSubmit={run(() => api("/admin/maintenance-services", { method: "POST", body: { ...svc, cost: svc.cost, maintenance_request_id: id } }).then(() => setSvc({ name: "", description: "", cost: "", is_additional: false })))}>
          <input required placeholder="Service name" value={svc.name} onChange={(e) => setSvc({ ...svc, name: e.target.value })} />
          <input required placeholder="Description" value={svc.description} onChange={(e) => setSvc({ ...svc, description: e.target.value })} />
          <input required type="number" min="1" placeholder="Cost (₦)" value={svc.cost} onChange={(e) => setSvc({ ...svc, cost: e.target.value })} />
          <label><input type="checkbox" checked={svc.is_additional} onChange={(e) => setSvc({ ...svc, is_additional: e.target.checked })} /> Additional</label>
          <button className="btn dark sm">Add</button></form>}
      </Card>
      <Card title="Photos">
        <div className="photos">{r.images.map((i) => <figure key={i.id}><img src={i.image_url} alt="" /><figcaption>{label(i.category)}</figcaption></figure>)}</div>
        <form className="inline" onSubmit={upload}><select value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select><input id="file" type="file" accept="image/*" required /><button className="btn dark sm">Upload</button></form>
      </Card>
      <Card title="Next service date"><form className="inline" onSubmit={move(`next-service-date?next_service_date=${date}`)}><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /><button className="btn dark sm">Save</button><small>{r.next_service_date ? `Current: ${fmt(r.next_service_date)}` : ""}</small></form></Card>
    </>
  );
}
