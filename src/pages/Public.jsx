import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../api";
import { Err } from "../ui";

const Nav = () => (
  <header className="nav">
    <Link to="/" className="brand">MOTORA</Link>
    <nav><a href="#top" className="on">Home</a><a href="#features">Services</a><a href="#features">Why Motora</a></nav>
    <div><Link to="/login" className="btn line">Sign In</Link> <Link to="/register" className="btn blue">Create an Account</Link></div>
  </header>
);

export function Landing() {
  const feats = [["Trusted Service", "Professional and reliable car care."], ["Track Progress", "Know the status of your service in real-time."],
    ["Secure Payments", "Pay safely and conveniently."], ["24/7 Support", "We're always here to help."]];
  return (
    <div id="top" className="land">
      <Nav />
      <section className="hero">
        <h1>Your Car.<br /><span>Our Care.</span></h1>
        <p>Manage your vehicle maintenance, track service progress, review services, and stay informed - all in one place.</p>
        <div><Link to="/register" className="btn blue big">Get Started →</Link> <Link to="/login" className="btn line big">Sign In</Link></div>
        <small>New to Motora? <Link to="/register">Create an Account →</Link> | Already have an account? <Link to="/login">Sign In</Link></small>
      </section>
      <section id="features" className="feats">
        {feats.map(([t, d]) => <div key={t}><h4>{t}</h4><p>{d}</p></div>)}
      </section>
    </div>
  );
}

export function AuthPage({ title, sub, children }) {
  return (
    <div className="land"><Nav />
      <div className="auth">
        <div className="auth-art"><h1>{title[0]}<br /><span>{title[1]}</span></h1><p>{sub}</p></div>
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

export const Field = ({ label, ...p }) => <label className="field">{label}<input required {...p} /></label>;

export function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const r = await api("/auth/login", { method: "POST", body: f });
      auth.set(r.access_token);
      nav(auth.role === "WORKSHOP_ADMIN" ? "/admin" : "/app");
    } catch (x) { setErr(x.message); }
  };
  return (
    <AuthPage title={["Welcome", "Back"]} sub="Sign in to manage your vehicles and track your service.">
      <form onSubmit={submit}>
        <h2>Sign In</h2>
        <Field label="Email Address" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Err e={err} />
        <button className="btn blue wide">Sign In</button>
        <p className="alt"><Link to="/forgot-password">Forgot password?</Link> · No account? <Link to="/register">Create one</Link></p>
      </form>
    </AuthPage>
  );
}

export function Register() {
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState(""), [done, setDone] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirm) return setErr("Passwords do not match");
    const { confirm, ...body } = f;
    try { setDone((await api("/auth/register", { method: "POST", body })).message); } catch (x) { setErr(x.message); }
  };
  return (
    <AuthPage title={["Create Your", "Account"]} sub="Join Motora today and enjoy a seamless car maintenance experience.">
      {done ? <div><h2>Check your email</h2><p>{done}</p><Link to="/login" className="btn blue wide">Go to Sign In</Link></div> : (
        <form onSubmit={submit}>
          <h2>Registration</h2>
          <div className="two"><Field label="First Name" value={f.first_name} onChange={set("first_name")} /><Field label="Last Name" value={f.last_name} onChange={set("last_name")} /></div>
          <Field label="Email Address" type="email" value={f.email} onChange={set("email")} />
          <Field label="Phone Number" value={f.phone} onChange={set("phone")} />
          <div className="two"><Field label="Password (10+ characters)" type="password" value={f.password} onChange={set("password")} /><Field label="Confirm Password" type="password" value={f.confirm} onChange={set("confirm")} /></div>
          <Err e={err} />
          <button className="btn blue wide">Create Account</button>
          <p className="alt">Already have an account? <Link to="/login">Sign In</Link></p>
        </form>
      )}
    </AuthPage>
  );
}
