import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../api";
import { Err } from "../ui";

import { Ic } from "../icons";
export { Ic };

const Nav = ({ pill }) => (
  <header className="nav">
    <Link to="/"><img src="/logo.png" alt="Motora" className="logo-img" /></Link>
    <nav>{[["Home", "/"], ["About", "/#about"], ["Services", "/#services"], ["Why Motora", "/#why"], ["Support", "/#support"]].map(([t, h], i) => <a key={t} href={h} className={i === 0 ? (pill ? "pill-on" : "on") : ""}>{t}</a>)}</nav>
    <div><Link to="/login" className="btn outline">Sign In</Link><Link to="/register" className="btn blue">Create an Account</Link></div>
  </header>
);

const SERVICES = [["wrench", "Routine Maintenance", "Oil and filter changes, fluid top-ups and scheduled service checks to keep your car reliable."], ["shield", "Brake Service", "Pad and disc replacement, brake fluid and full safety inspection."], ["gear", "Engine Diagnostics", "Computer diagnostics to find the cause of noises, warning lights and poor performance."],
  ["bell", "Battery & Electrical", "Battery testing and replacement, alternator and starter checks."], ["car", "Tyres & Alignment", "Tyre fitting, balancing, rotation and wheel alignment."], ["clock", "Cooling & Air Conditioning", "Radiator, coolant and AC servicing so you stay cool and avoid overheating."]];
const STEPS = [["Create your account", "Sign up in a minute and verify your email."], ["Add your vehicle", "Save your car's plate number and VIN once."], ["Request a service", "Describe the problem and we review it quickly."], ["Approve and track", "Approve any extra work, then follow every stage live."], ["Pay and drive away", "Pay securely online and get reminders for your next service."]];
const WHY = [["clock", "Real-time tracking", "See each stage: requested, accepted, inspecting, in progress, completed."], ["check", "You approve extra work", "Nothing extra is done or billed until you say yes."], ["card", "Secure online payments", "Pay with your card through Paystack, or at the workshop."], ["image", "Photo updates", "Before and after photos of your car, right in your account."], ["bell", "Instant notifications", "In-app and email updates whenever something changes."], ["chart", "Full service history", "Every job, cost and payment for each of your vehicles in one place."]];
const FAQ = [["How do I book a service?", "Create an account, add your vehicle, then choose New Request and describe the problem. Our team reviews it and updates you."], ["Will I be charged for extra work without asking?", "No. Any additional service is sent to you for approval first, with its price. You can approve or reject it."], ["How can I pay?", "Online by card through Paystack, or by cash or transfer at the workshop. Every payment appears in your account."], ["Can I see photos of my car's service?", "Yes. Our team uploads before and after photos to your request, and you can view them any time."], ["Will I be reminded about my next service?", "Yes. When your service is done we set your next service date and keep it on your account."]];

const Section = ({ id, kicker, title, sub, children, alt }) => (
  <section id={id} className={`sec ${alt ? "alt" : ""}`}><div className="wrap"><div className="sec-head"><small>{kicker}</small><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{children}</div></section>
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
          <div className="cta"><Link to="/register" className="btn blue pillbtn"><Ic n="car" s={20} /> Get Started →</Link><Link to="/login" className="btn outline pillbtn"><Ic n="user" s={18} /> Sign In</Link></div>
          <div className="divider"><span>New to Motora?</span></div>
          <p className="links"><Link to="/register">Create an Account →</Link><i /> Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
        <div className="hero-curve" />
      </section>
      <section id="features" className="feat-card">
        {feats.map(([i, t, d]) => <div key={t}><img src={`/i-${i}.png`} alt="" /><div><h4>{t}</h4><p>{d}</p></div></div>)}
      </section>
      <section className="brands"><h4><span>Trusted by thousands of car owners</span></h4><img src="/brands.png" alt="Toyota, BMW, Mercedes-Benz, Hyundai, Honda, Ford" /></section>

      <Section id="about" kicker="ABOUT MOTORA" title="A workshop that keeps you in the loop" sub="Motora is a modern car-care workshop with a simple promise: honest work, clear prices and no surprises. Everything happens in your account, so you always know where your car is and what it costs.">
        <div className="stats">{[["5", "Stages tracked live"], ["100%", "Work approved by you"], ["24/7", "Access to your history"], ["0", "Hidden charges"]].map(([n, t]) => <div key={t}><b>{n}</b><span>{t}</span></div>)}</div>
      </Section>
      <Section id="services" alt kicker="WHAT WE DO" title="Our services" sub="From a quick oil change to a full diagnosis, we look after the whole car.">
        <div className="cards3">{SERVICES.map(([i, t, d]) => <div className="svc" key={t}><b><Ic n={i} s={18} /></b><h4>{t}</h4><p>{d}</p></div>)}</div>
      </Section>
      <Section kicker="HOW IT WORKS" title="From request to road in five steps">
        <ol className="steps5">{STEPS.map(([t, d], i) => <li key={t}><b>{i + 1}</b><h4>{t}</h4><p>{d}</p></li>)}</ol>
      </Section>
      <Section id="why" alt kicker="WHY MOTORA" title="Car care that feels effortless" sub="Everything you need to stay in control of your vehicle's maintenance.">
        <div className="cards3">{WHY.map(([i, t, d]) => <div className="svc" key={t}><b><Ic n={i} s={18} /></b><h4>{t}</h4><p>{d}</p></div>)}</div>
      </Section>
      <Section kicker="FAQ" title="Questions, answered">
        <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </Section>
      <Section id="support" alt kicker="SUPPORT" title="We're here to help" sub="Questions about a service, a payment or your account? Reach us any time.">
        <div className="cards3 contact">{[["bell", "Email", "support@motora.com"], ["phone", "Phone", "+234 800 000 0000"], ["clock", "Hours", "Mon - Sat, 8am - 6pm"]].map(([i, t, d]) => <div className="svc" key={t}><b><Ic n={i} s={18} /></b><h4>{t}</h4><p>{d}</p></div>)}</div>
      </Section>
      <section className="cta-band"><h2>Ready to take care of your car?</h2><p>Create your free account and book your first service today.</p><div><Link to="/register" className="btn light">Create an Account</Link> <Link to="/login" className="btn outline">Sign In</Link></div></section>
      <footer className="foot"><div><img src="/logo.png" alt="Motora" /><p>Drive with Confidence.</p></div><div><b>Company</b><a href="/#about">About</a><a href="/#services">Services</a><a href="/#why">Why Motora</a></div><div><b>Account</b><Link to="/login">Sign In</Link><Link to="/register">Create an Account</Link><Link to="/forgot-password">Forgot password</Link></div><div><b>Support</b><a href="/#support">Contact</a><a href="/#faq">FAQ</a></div><small>© {new Date().getFullYear()} Motora. All rights reserved.</small></footer>
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
