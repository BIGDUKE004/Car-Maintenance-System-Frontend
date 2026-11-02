import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ic } from "./icons";
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext } from "react-router-dom";
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

const ICONS = { Dashboard: "home", "My Vehicles": "car", Requests: "wrench", "Maintenance Requests": "wrench", Payments: "card", Notifications: "bell", Profile: "user", Customers: "users", Vehicles: "car", "Maintenance Images": "image", Administrators: "users", Reports: "chart", Settings: "gear" };

// Pages put their title (and action button) into the header bar with <Head>.
export const Head = ({ t, s, children }) => {
  const slot = useOutletContext();
  return slot ? createPortal(<><div className="head-t"><h1>{t}</h1>{s && <small>{s}</small>}</div><div className="head-act">{children}</div></>, slot) : null;
};

export function Shell({ role, links }) {
  const nav = useNavigate();
  const { data: me } = useLoad(() => api("/auth/me"));
  const [unread, setUnread] = useState(0), [slot, setSlot] = useState(null);
  const customer = role === "CUSTOMER";
  const refresh = () => customer && api("/customer/notifications/unread-count").then((r) => setUnread(r.unread)).catch(() => {});
  useEffect(() => { refresh(); window.addEventListener("notif", refresh); return () => window.removeEventListener("notif", refresh); }, []);
  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to={auth.role === "WORKSHOP_ADMIN" ? "/admin" : "/app"} replace />;
  const name = me ? `${me.first_name} ${me.last_name}` : "";
  return (
    <div className={`shell ${customer ? "cust" : "admin"}`}>
      <aside className="side">
        <div className="logo">MOTORA<span>.</span>{!customer && <small>Drive with Confidence</small>}</div>
        {customer && <div className="menu-label">MENU</div>}
        <nav>{links.map(([to, text, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active " : "") + (text === "Requests" ? "red" : "")}><Ic n={ICONS[text] || "grid"} s={17} />{text}{text === "Notifications" && unread > 0 && <em>{unread}</em>}</NavLink>)}</nav>
        <button className="ghost" onClick={() => { auth.clear(); nav("/"); }}><Ic n="user" s={17} /> Log out</button>
      </aside>
      <main className="main">
        <div className="top"><div className="head-slot" ref={setSlot} />{!customer && <AdminSearch />}
          {customer && <Link to="/app/notifications" className="bell"><Ic n="bell" s={22} />{unread > 0 && <em>{unread}</em>}</Link>}
          <div className="who"><b>{name}</b><small>{customer ? "Premium Member" : "Administrator"}</small></div><span className="avatar">{name[0]}</span></div>
        <Outlet context={slot} />
      </main>
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
