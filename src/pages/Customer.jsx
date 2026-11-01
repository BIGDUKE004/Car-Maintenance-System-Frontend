import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, naira, fmt, label } from "../api";
import { Card, Err, Pill, useLoad } from "../ui";

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
      <h1>Welcome back 👋</h1><p className="sub">Here's what's happening with your vehicles.</p>
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
      <div className="bar"><div><h1>My Vehicles</h1><p className="sub">Manage your garage and view maintenance history.</p></div><button className="btn dark" onClick={() => setOpen(!open)}>+ Add Vehicle</button></div>
      {open && <Card><form className="form" onSubmit={add}>
        {Object.keys(f).map((k) => <label key={k} className="field">{label(k)}<input required value={f[k]} type={k === "year" ? "number" : "text"} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        <Err e={err} /><button className="btn blue">Save Vehicle</button></form></Card>}
      <Err e={error} />
      <div className="grid3">{data?.cars.map((c) => (
        <Card key={c.id} className="car">{c.image_url && <img className="carimg" src={c.image_url} alt="" />}<h3><Link to={`/app/vehicles/${c.id}`}>{c.make} {c.model}</Link></h3><small>{c.year} · {c.color}</small>
          <dl><dt>Plate</dt><dd>{c.plate_number}</dd><dt>VIN</dt><dd>{c.vin}</dd></dl>
          <small>{data.requests.filter((r) => r.car.id === c.id).length} maintenance request(s)</small></Card>))}</div>
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
      <div className="bar"><div><h1>Maintenance Requests</h1><p className="sub">Track all maintenance requests for your vehicles.</p></div><button className="btn red" onClick={() => setOpen(!open)}>+ New Request</button></div>
      {done && <div className="alert ok"><div><h3>Request Submitted</h3><p>Our service team will review it and get back to you shortly.</p></div><button className="btn dark sm" onClick={() => setDone(false)}>OK</button></div>}
      {open && <Card><form className="form" onSubmit={create}>
        <label className="field">Vehicle<select required value={f.car_id} onChange={(e) => setF({ ...f, car_id: e.target.value })}><option value="">Select a vehicle</option>{data?.cars.map((c) => <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate_number})</option>)}</select></label>
        <label className="field">What does the car need? (10+ characters)<textarea required minLength={10} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <Err e={err} /><button className="btn blue">Submit Request</button></form></Card>}
      <div className="tabs">{["ALL", ...STEPS].map((s) => <button key={s} className={tab === s ? "on" : ""} onClick={() => setTab(s)}>{label(s)}</button>)}</div>
      <Err e={error} />
      <Card>{list.length ? list.map((r) => <ReqRow key={r.id} r={r} />) : <p className="empty">No requests here.</p>}</Card>
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
      <div className="bar"><div><h1>Maintenance Request</h1><p className="sub">{req.description}</p></div><Pill s={req.status} /></div>
      {pending.length > 0 && <div className="alert"><div><h3>Additional Service Requires Approval</h3><p>Our team recommends the work below. Please review and approve to continue.</p></div><b>{naira(pending.reduce((n, s) => n + Number(s.cost), 0))}</b></div>}
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
      {req.next_service_date && <Card title="Next service due"><p>{fmt(req.next_service_date)}</p></Card>}
      {images.length > 0 && <Card title="Photos"><div className="photos">{images.map((i) => <figure key={i.id}><img src={i.image_url} alt={i.category} /><figcaption>{label(i.category)}</figcaption></figure>)}</div></Card>}
    </>
  );
}
