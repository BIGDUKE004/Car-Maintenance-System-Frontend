import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, naira, fmt, label } from "../api";
import { Card, Err, Head, Pill, useLoad } from "../ui";
import { Ic } from "../icons";

export function VehicleDetail() {
  const { id } = useParams();
  const { data: c, error, reload } = useLoad(() => api(`/customer/cars/${id}`), [id]);
  const [err, setErr] = useState("");
  const upload = async (e) => { setErr(""); const f = new FormData(); f.append("file", e.target.files[0]); try { await api(`/customer/cars/${id}/photo`, { method: "POST", form: f }); reload(); } catch (x) { setErr(x.message); } };
  if (!c) return <Err e={error} />;
  return (
    <>
      <Head t={`${c.make} ${c.model}`} s={`${c.year} · ${c.color}`}><label className="btn dark">Change photo<input hidden type="file" accept="image/*" onChange={upload} /></label></Head>
      <Err e={err} />
      <Card className="car">{c.image_url && <img className="carimg" src={c.image_url} alt="" />}<dl><dt>Plate</dt><dd>{c.plate_number}</dd><dt>VIN</dt><dd>{c.vin}</dd></dl></Card>
      <Card title="Maintenance History">{c.requests.length ? c.requests.map((r) => (
        <Link key={r.id} to={`/app/requests/${r.id}`} className="row"><div><b>{r.description.slice(0, 60)}</b><small>{fmt(r.request_date)} · {naira(r.total_cost)}</small></div><Pill s={r.status} /></Link>)) : <p className="empty">No maintenance yet.</p>}</Card>
    </>
  );
}

export function Payments() {
  const { data: sum, error, reload } = useLoad(() => api("/customer/payments/summary"));
  const { data: list } = useLoad(() => api("/customer/payments"));
  const [err, setErr] = useState("");
  const pay = async (service_id) => { setErr(""); try { const r = await api("/payments/paystack/initialize", { method: "POST", body: { maintenance_service_id: service_id } }); location.href = r.authorization_url; } catch (x) { setErr(x.message); } };
  if (!sum) return <Err e={error} />;
  return (
    <>
      <Head t="Payments" s="Manage your transactions and outstanding balance."><div className="owing"><small>OUTSTANDING BALANCE</small><b>{naira(sum.outstanding_balance)}</b></div></Head>
      <Err e={err} />
      {sum.unpaid_services.length > 0 && <Card title="Pay for a service">{sum.unpaid_services.map((u) => (
        <div className="row" key={u.service_id}><div><b>{u.name}</b><small>Balance {naira(u.balance)}</small></div><button className="btn blue sm" onClick={() => pay(u.service_id)}>Pay Now</button></div>))}</Card>}
      <Card title="Recent Payments"><table><thead><tr><th>Reference</th><th>Request</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
        <tbody>{(list || []).map((p) => <tr key={p.reference}><td>{p.reference}</td><td>{p.request_description.slice(0, 30)}</td><td>{fmt(p.date)}</td><td><Pill s={p.status === "SUCCESS" ? "COMPLETED" : p.status === "FAILED" ? "CANCELED" : "PENDING"} /></td><td>{naira(p.amount)}</td></tr>)}</tbody></table>
        {list?.length === 0 && <p className="empty">No payments yet.</p>}</Card>
    </>
  );
}

export function PaymentSuccess() {
  const [q] = useSearchParams();
  const { data: r, error } = useLoad(() => api(`/customer/payments/verify/${q.get("reference")}`));
  return (
    <Card className="center"><h1>{r?.status === "SUCCESS" ? "Payment Successful" : "Payment Status"}</h1>
      <Err e={error} />{r && <><p>{r.message}</p><p><b>{naira(r.amount)}</b> · {r.reference}</p></>}
      <Link to="/app/requests" className="btn dark">Back to Maintenance Requests</Link> <Link to="/app/payments" className="btn line dk">View Payment History</Link></Card>
  );
}

export function Notifications() {
  const [tab, setTab] = useState("ALL");
  const { data, error, reload } = useLoad(() => api("/customer/notifications" + (tab === "UNREAD" ? "?unread_only=true" : tab === "ALL" ? "" : `?category=${tab}`)), [tab]);
  const read = async (id) => { await api(`/customer/notifications/${id}/read`, { method: "PATCH" }); reload(); window.dispatchEvent(new Event("notif")); };
  const all = async () => { await api("/customer/notifications/read-all", { method: "POST" }); reload(); window.dispatchEvent(new Event("notif")); };
  return (
    <>
      <Head t="Notifications" s="Stay updated with your vehicle maintenance progress."><button className="btn soft" onClick={all}>Mark all as read</button></Head>
      <div className="tabs bar-white">{["ALL", "UNREAD", "MAINTENANCE", "PAYMENTS", "APPROVALS"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{label(t)}</button>)}</div>
      <Err e={error} />
      {(data || []).map((n) => (
        <Card key={n.id} className={`ncard ${n.category} ${n.is_read ? "" : "unread"}`}><div className="row"><span className="nic"><Ic n={n.category === "APPROVALS" ? "alert" : n.category === "PAYMENTS" ? "card" : "check"} s={24} /></span><div className="grow"><b>{n.title}</b><p>{n.message}</p><small>{fmt(n.created_at)}</small></div>
          <div className="end">{n.maintenance_request_id && <Link className="btn dark sm" to={`/app/requests/${n.maintenance_request_id}`}>{n.category === "APPROVALS" ? "Review & Approve" : "View"}</Link>}{!n.is_read && <button className="btn line sm dk" onClick={() => read(n.id)}>Mark as read</button>}</div></div></Card>))}
      {data?.length === 0 && <p className="empty">You're all caught up.</p>}
    </>
  );
}
