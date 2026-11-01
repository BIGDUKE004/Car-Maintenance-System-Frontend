import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { api, auth, label } from "./api";

export const Pill = ({ s }) => <span className={`pill ${s}`}>{label(s)}</span>;
export const Card = ({ title, action, children, className = "" }) => (
  <section className={`card ${className}`}>
    {(title || action) && <div className="card-head"><h3>{title}</h3>{action}</div>}
    {children}
  </section>
);
export const Err = ({ e }) => (e ? <p className="err">{e}</p> : null);

export function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = () => fn().then(setData).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, deps);
  return { data, error, reload };
}

export function Shell({ role, links }) {
  const nav = useNavigate();
  const { data: me } = useLoad(() => api("/auth/me"));
  const [unread, setUnread] = useState(0);
  const refresh = () => role === "CUSTOMER" && api("/customer/notifications/unread-count").then((r) => setUnread(r.unread)).catch(() => {});
  useEffect(() => { refresh(); window.addEventListener("notif", refresh); return () => window.removeEventListener("notif", refresh); }, []);
  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to={auth.role === "WORKSHOP_ADMIN" ? "/admin" : "/app"} replace />;
  const name = me ? `${me.first_name} ${me.last_name}` : "";
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">MOTORA<small>Drive with Confidence</small></div>
        <nav>{links.map(([to, text, end]) => <NavLink key={to} to={to} end={end}>{text}{text === "Notifications" && unread > 0 && <em>{unread}</em>}</NavLink>)}</nav>
        <button className="ghost" onClick={() => { auth.clear(); nav("/"); }}>Log out</button>
      </aside>
      <main className="main"><div className="top">{role === "WORKSHOP_ADMIN" && <AdminSearch />}<span>{name}</span><span className="avatar">{name[0]}</span></div><Outlet /></main>
    </div>
  );
}

function AdminSearch() {
  const [q, setQ] = useState(""), [r, setR] = useState(null);
  useEffect(() => {
    if (q.trim().length < 2) return setR(null);
    const t = setTimeout(() => api(`/admin/search?q=${encodeURIComponent(q)}`).then(setR).catch(() => setR(null)), 300);
    return () => clearTimeout(t);
  }, [q]);
  const close = () => { setQ(""); setR(null); };
  return (
    <div className="search"><input placeholder="Search requests, customers, or vehicles..." value={q} onChange={(e) => setQ(e.target.value)} />
      {r && <div className="results" onClick={close}>
        {r.requests.map((x) => <Link key={x.id} to={`/admin/requests/${x.id}`}>Request · {x.description.slice(0, 40)} <small>{x.vehicle.plate_number}</small></Link>)}
        {r.customers.map((x) => <Link key={x.id} to="/admin/customers">Customer · {x.first_name} {x.last_name} <small>{x.email}</small></Link>)}
        {r.vehicles.map((x) => <Link key={x.id} to="/admin/vehicles">Vehicle · {x.make} {x.model} <small>{x.plate_number}</small></Link>)}
        {!r.requests.length && !r.customers.length && !r.vehicles.length && <span className="empty">No matches</span>}
      </div>}
    </div>
  );
}
