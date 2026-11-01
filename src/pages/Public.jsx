import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../api";
import { Err } from "../ui";

import { Ic } from "../icons";
export { Ic };

const Nav = ({ pill }) => (
  <header className="nav">
    <Link to="/"><img src="/logo.png" alt="Motora" className="logo-img" /></Link>
    <nav>{["Home", "About", "Services", "Why Motora", "Support"].map((t, i) => <a key={t} href={i ? "/#features" : "/"} className={i === 0 ? (pill ? "pill-on" : "on") : ""}>{t}</a>)}</nav>
    <div><Link to="/login" className="btn outline">Sign In</Link><Link to="/register" className="btn blue">Create an Account</Link></div>
  </header>
);

export function Landing() {
  const feats = [["shield", "Trusted Service", "Professional and reliable car care."], ["clock", "Track Progress", "Know the status of your service in real-time."],
    ["card", "Secure Payments", "Pay safely and conveniently."], ["help", "24/7 Support", "We're always here to help."]];
  return (
    <div className="landing">
      <Nav pill />
      <section className="hero">
        <div className="hero-copy">
          <h1>Your Car.<span>Our Care.</span></h1>
          <p>Manage your vehicle maintenance, track service progress, review services, and stay informed - all in one place.</p>
          <div className="cta"><Link to="/register" className="btn blue pillbtn"><Ic n="car" s={26} /> Get Started →</Link><Link to="/login" className="btn outline pillbtn"><Ic n="user" s={24} /> Sign In</Link></div>
          <div className="divider"><span>New to Motora?</span></div>
          <p className="links"><Link to="/register">Create an Account →</Link><i /> Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
        <div className="hero-curve" />
      </section>
      <section id="features" className="feat-card">
        {feats.map(([i, t, d]) => <div key={t}><img src={`/i-${i}.png`} alt="" /><div><h4>{t}</h4><p>{d}</p></div></div>)}
      </section>
      <section className="brands"><h4><span>Trusted by thousands of car owners</span></h4><img src="/brands.png" alt="Toyota, BMW, Mercedes-Benz, Hyundai, Honda, Ford" /></section>
    </div>
  );
}

// Split layout used by Sign In, Register and the password pages.
export function AuthPage({ title, sub, bullets, children }) {
  return (
    <div className="authpage"><Nav />
      <div className="auth">
        <div className="auth-art">
          <h1>{title[0]}<span>{title[1]}</span></h1><p>{sub}</p>
          {bullets && <ul>{bullets.map(([i, t]) => <li key={t}><b><Ic n={i} s={22} /></b>{t}</li>)}</ul>}
        </div>
        <div className="auth-right"><div className="auth-card">{children}</div></div>
      </div>
    </div>
  );
}

export function Field({ label, icon, type = "text", ...p }) {
  const [show, setShow] = useState(false);
  const pw = type === "password";
  return (
    <label className="field">{label} <em>*</em>
      <span className="inp">{icon && <Ic n={icon} />}<input required type={pw && show ? "text" : type} {...p} />{pw && <button type="button" onClick={() => setShow(!show)} aria-label="Show password"><Ic n="eye" /></button>}</span>
    </label>
  );
}

const Secure = () => <div className="secure"><b><Ic n="shield" s={26} /></b><div><strong>Your information is secure with Motora.</strong><small>We never share your details with third parties.</small></div></div>;
const Head = ({ t, s }) => <div className="auth-head"><b><Ic n="user" s={34} /></b><div><h2>{t}</h2><p>{s}</p></div></div>;

export function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" }), [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { auth.set((await api("/auth/login", { method: "POST", body: f })).access_token); nav(auth.role === "WORKSHOP_ADMIN" ? "/admin" : "/app"); } catch (x) { setErr(x.message); }
  };
  return (
    <AuthPage title={["Welcome ", "Back"]} sub="Sign in to manage your vehicles and track your service." bullets={[["car", "Manage your vehicles"], ["wrench", "Track service progress"], ["shield", "Get timely reminders"]]}>
      <form onSubmit={submit}>
        <Head t="Sign In" s="Enter your details to access your Motora account." />
        <Field label="Email Address" icon="mail" type="email" placeholder="Enter your email address" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Password" icon="lock" type="password" placeholder="Enter your password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Err e={err} />
        <button className="btn blue wide"><Ic n="user" /> Sign In</button>
        <p className="alt"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="alt line">No account yet? <Link to="/register">Create an Account</Link></p>
        <Secure />
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
    <AuthPage title={["Create Your ", "Account"]} sub="Join Motora today and enjoy a seamless car maintenance experience." bullets={[["car", "Manage your vehicles"], ["wrench", "Track service progress"], ["shield", "Get timely reminders"]]}>
      {done ? <div><Head t="Check your email" s={done} /><Link to="/login" className="btn blue wide">Go to Sign In</Link></div> : (
        <form onSubmit={submit}>
          <Head t="Registration" s="Fill in the details below to create your Motora account." />
          <div className="two"><Field label="First Name" icon="user" placeholder="Enter your first name" value={f.first_name} onChange={set("first_name")} /><Field label="Last Name" icon="user" placeholder="Enter your last name" value={f.last_name} onChange={set("last_name")} /></div>
          <Field label="Email Address" icon="mail" type="email" placeholder="Enter your email address" value={f.email} onChange={set("email")} />
          <Field label="Phone Number" icon="phone" placeholder="Enter your phone number" value={f.phone} onChange={set("phone")} />
          <div className="two"><Field label="Password" icon="lock" type="password" minLength={10} placeholder="Create a password" value={f.password} onChange={set("password")} /><Field label="Confirm Password" icon="lock" type="password" placeholder="Confirm your password" value={f.confirm} onChange={set("confirm")} /></div>
          <Err e={err} />
          <button className="btn blue wide"><Ic n="add" /> Create Account</button>
          <p className="alt line">Already have an account? <Link to="/login">Sign In</Link></p>
          <Secure />
        </form>
      )}
    </AuthPage>
  );
}
