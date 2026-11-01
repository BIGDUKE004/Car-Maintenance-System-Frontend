import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, naira, fmt, label, mr } from "../api";
import { Card, Err, Head, Pill, useLoad } from "../ui";
import { Ic } from "../icons";

const STEPS = ["PENDING", "ACCEPTED", "INSPECTING", "AWAITING_APPROVAL", "IN_PROGRESS", "COMPLETED"];

async function loadAll() {
  const [cars, requests] = await Promise.all([api("/customer/cars"), api("/customer/maintenance-requests")]);
  return { cars: cars || [], requests };
}

const Timeline = ({ status }) => (
  <div className="steps">{STEPS.map((s, i) => <div key={s} className={i <= STEPS.indexOf(status) ? "done" : ""}><i />{label(s)}</div>)}</div>
);

const ReqRow = ({ r }) => (
  <Link to={`/app/requests/${r.id}`} className="row">
    <div><b>{r.car.year} {r.car.make} {r.car.model}</b><small>{r.description.slice(0, 60)} · {fmt(r.request_date)}</small></div>
    <Pill s={r.status} />
  </Link>
);

export function CHome() {
  const { data, error } = useLoad(loadAll);
  if (!data) return <Err e={error} />;
  const live = data.requests.find((r) => !["COMPLETED", "CANCELED"].includes(r.status));
  return (
    <>
      <Head t="Dashboard" s="Welcome back" />
      <div className="grid2">
        <Card title="My Vehicles" action={<Link to="/app/vehicles">View all →</Link>}>
          {data.cars.length ? data.cars.slice(0, 3).map((c) => <div className="row" key={c.id}><div><b>{c.year} {c.make} {c.model}</b><small>{c.plate_number} · {c.color}</small></div></div>) : <p className="empty">No vehicles yet. <Link to="/app/vehicles">Add one</Link></p>}
        </Card>
        <Card title="Current Request" action={<Link to="/app/requests">All requests →</Link>}>
          {live ? <><ReqRow r={live} /><Timeline status={live.status} /></> : <p className="empty">Nothing in progress.</p>}
        </Card>
      </div>
    </>
  );
}

export function Vehicles() {
  const { data, error, reload } = useLoad(loadAll);
  const [open, setOpen] = useState(false), [f, setF] = useState({ make: "", model: "", year: 2020, color: "", plate_number: "", vin: "" }), [err, setErr] = useState("");
  const add = async (e) => {
    e.preventDefault(); setErr("");
    try { await api("/customer/cars", { method: "POST", body: { ...f, year: +f.year } }); setOpen(false); reload(); } catch (x) { setErr(x.message); }
  };
  return (
    <>
      <Head t="My Vehicles" s="Manage your garage and view maintenance history."><button className="btn blue" onClick={() => setOpen(!open)}>+ Add Vehicle</button></Head>
      {open && <Card><form className="form" onSubmit={add}>
        {Object.keys(f).map((k) => <label key={k} className="field">{label(k)}<input required value={f[k]} type={k === "year" ? "number" : "text"} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        <Err e={err} /><button className="btn blue">Save Vehicle</button></form></Card>}
      <Err e={error} />
      <div className="grid2">{data?.cars.map((c) => (
        <div key={c.id} className="vcard">
          <div className="vphoto" style={c.image_url ? { backgroundImage: `url(${c.image_url})` } : undefined}><i>{c.year}</i><h3>{c.make} {c.model}</h3></div>
          <dl><div><dt>COLOR</dt><dd>{c.color}</dd></div><div><dt>PLATE NUMBER</dt><dd>{c.plate_number}</dd></div></dl>
          <Link to={`/app/vehicles/${c.id}`} className="btn dark wide">View Details</Link>
          <Link to="/app/requests" className="btn line dk wide">Maintenance History ({data.requests.filter((r) => r.car.id === c.id).length})</Link>
        </div>))}</div>
    </>
  );
}

export function Requests() {
  const { data, error, reload } = useLoad(loadAll);
  const [tab, setTab] = useState("ALL"), [done, setDone] = useState(false), [open, setOpen] = useState(false), [f, setF] = useState({ car_id: "", description: "" }), [err, setErr] = useState("");
  const create = async (e) => {
    e.preventDefault(); setErr("");
    try { await api("/customer/maintenance-requests", { method: "POST", body: { ...f, request_date: new Date().toISOString() } }); setOpen(false); setF({ car_id: "", description: "" }); setDone(true); reload(); } catch (x) { setErr(x.message); }
  };
  const list = (data?.requests || []).filter((r) => tab === "ALL" || r.status === tab);
  return (
    <>
      <Head t="Maintenance Requests" s="Track all maintenance requests for your vehicles."><button className="btn red" onClick={() => setOpen(!open)}>+ New Request</button></Head>
      {done && <div className="alert ok"><div><h3>Request Submitted</h3><p>Our service team will review it and get back to you shortly.</p></div><button className="btn dark sm" onClick={() => setDone(false)}>OK</button></div>}
      {open && <Card><form className="form" onSubmit={create}>
        <label className="field">Vehicle<select required value={f.car_id} onChange={(e) => setF({ ...f, car_id: e.target.value })}><option value="">Select a vehicle</option>{data?.cars.map((c) => <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate_number})</option>)}</select></label>
        <label className="field">What does the car need? (10+ characters)<textarea required minLength={10} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <Err e={err} /><button className="btn blue">Submit Request</button></form></Card>}
      <div className="tabs bar-white">{["ALL", ...STEPS].map((s) => <button key={s} className={tab === s ? "on" : ""} onClick={() => setTab(s)}>{label(s)}</button>)}</div>
      <Err e={error} />
      {list.map((r) => (
        <div key={r.id} className={`rcard ${r.status}`}>
          <div className="rtop"><span className="wr"><Ic n="wrench" s={26} /></span><div><b>{mr(r.id)}</b> <Pill s={r.status} /><small>{r.car.make} {r.car.model} • {fmt(r.request_date)}</small></div></div>
          <small className="cap">PROBLEM DESCRIPTION</small><p>{r.description}</p>
          <div className="rfoot"><div><small className="cap">TOTAL COST</small><b>{naira(r.total_cost)}</b></div><div><small className="cap">OUTSTANDING</small><b className="redt">{naira(r.balance)}</b></div><Link className="btn red" to={`/app/requests/${r.id}`}>View Details</Link></div>
        </div>))}
      {list.length === 0 && <Card><p className="empty">No requests here.</p></Card>}
    </>
  );
}

export function RequestDetail() {
  const { id } = useParams();
  const { data, error, reload } = useLoad(async () => ({ req: await api(`/maintenance-requests/${id}`), services: await api(`/customer/maintenance-services/${id}`), images: await api(`/maintenance-requests/${id}/images`) }), [id]);
  const [err, setErr] = useState("");
  const act = async (sid, what) => { setErr(""); try { await api(`/customer/maintenance-services/${sid}/${what}`, { method: "PATCH" }); reload(); } catch (x) { setErr(x.message); } };
  if (!data) return <Err e={error} />;
  const { req, services, images } = data;
  const pending = services.filter((s) => s.is_additional && s.approval === "PENDING");
  return (
    <>
      <Head t="Maintenance Request" s={`ID: ${mr(req.id)}`}><Pill s={req.status} /></Head><Card><small className="cap">PROBLEM DESCRIPTION</small><p>{req.description}</p></Card>
      {pending.length > 0 && <div className="alert"><div><h3>Additional Service Requires Approval</h3><p>Our team recommends the work below. Please review and approve to continue.</p></div><div className="adj"><small className="cap">TOTAL ADJUSTMENT</small><b>{naira(pending.reduce((n, s) => n + Number(s.cost), 0))}</b></div></div>}
      <Err e={err} />
      <Card title="Service Timeline"><Timeline status={req.status} /></Card>
      <Card title="Services">
        {services.length ? services.map((s) => (
          <div className="row" key={s.id}>
            <div><b>{s.name}{s.is_additional && " (additional)"}</b><small>{s.description}</small></div>
            <div className="end"><b>{naira(s.cost)}</b>
              {s.is_additional && s.approval === "PENDING" ? <><button className="btn blue sm" onClick={() => act(s.id, "approve")}>Approve</button><button className="btn line sm dk" onClick={() => act(s.id, "reject")}>Reject</button></> : s.is_additional && <Pill s={s.approval} />}
            </div>
          </div>)) : <p className="empty">Services will appear here once our team inspects your vehicle.</p>}
      </Card>
      <section className="paysum"><h3>Payment Summary</h3><div><span>Subtotal</span><b>{naira(services.filter((x) => !x.is_additional).reduce((n, x) => n + Number(x.cost), 0))}</b></div><div className="pend"><span>Pending Items</span><b>+ {naira(pending.reduce((n, x) => n + Number(x.cost), 0))}</b></div><div className="tot"><span>Total</span><b>{naira(services.reduce((n, x) => n + Number(x.cost), 0))}</b></div><Link to="/app/payments" className="btn blue wide">Pay Outstanding</Link></section>
      {req.next_service_date && <Card title="Next service due"><p>{fmt(req.next_service_date)}</p></Card>}
      {images.length > 0 && <Card title="Photos"><div className="photos">{images.map((i) => <figure key={i.id}><img src={i.image_url} alt={i.category} /><figcaption>{label(i.category)}</figcaption></figure>)}</div></Card>}
    </>
  );
}
