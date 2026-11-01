import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, auth, fmt } from "../api";
import { Card, Err, Head, useLoad } from "../ui";
import { AuthPage, Field } from "./Public";

export function VerifyEmail() {
  const [token] = useSearchParams(); const [msg, setMsg] = useState("Verifying your email...");
  useEffect(() => { api(`/auth/verify-email?token=${token.get("token")}`).then((r) => setMsg(r.message)).catch((e) => setMsg(e.message)); }, []);
  return <AuthPage title={["Email", "Verification"]} sub="One last step."><h2>{msg}</h2><Link to="/login" className="btn blue wide">Go to Sign In</Link></AuthPage>;
}

export function ForgotPassword() {
  const [email, setEmail] = useState(""), [done, setDone] = useState(false), [err, setErr] = useState("");
  const go = async (e) => { e.preventDefault(); try { await api("/auth/forgot-password", { method: "POST", body: { email } }); setDone(true); } catch (x) { setErr(x.message); } };
  return (
    <AuthPage title={["Forgot", "Password?"]} sub="We'll email you a link to reset it.">
      {done ? <><h2>Check your email</h2><p>If that address has an account, a reset link is on its way.</p></> :
        <form onSubmit={go}><h2>Reset password</h2><Field label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><Err e={err} /><button className="btn blue wide">Send reset link</button></form>}
    </AuthPage>
  );
}

export function ResetPassword() {
  const [q] = useSearchParams(), nav = useNavigate();
  const [pw, setPw] = useState(""), [err, setErr] = useState("");
  const go = async (e) => { e.preventDefault(); try { await api("/auth/reset-password", { method: "POST", body: { token: q.get("token"), new_password: pw } }); nav("/login"); } catch (x) { setErr(x.message); } };
  return (
    <AuthPage title={["Choose a", "New Password"]} sub="Use at least 10 characters.">
      <form onSubmit={go}><h2>New password</h2><Field label="New Password" type="password" minLength={10} value={pw} onChange={(e) => setPw(e.target.value)} /><Err e={err} /><button className="btn blue wide">Save password</button></form>
    </AuthPage>
  );
}

// Used for the customer "Profile" page and the admin "Settings" page.
export function Profile() {
  const { data: me, error, reload } = useLoad(() => api("/auth/me"));
  const [f, setF] = useState(null), [pw, setPw] = useState({ current_password: "", new_password: "" }), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  useEffect(() => { if (me) setF({ first_name: me.first_name, last_name: me.last_name, phone: me.phone }); }, [me]);
  if (!me || !f) return <Err e={error} />;
  const run = (fn, ok) => async (e) => { e.preventDefault(); setErr(""); setMsg(""); try { await fn(); setMsg(ok); reload(); } catch (x) { setErr(x.message); } };
  return (
    <>
      <Head t={auth.role === "WORKSHOP_ADMIN" ? "Settings" : "My Profile"} s="Manage your account information and preferences" />
      <Err e={err} />{msg && <p className="note">{msg}</p>}
      <div className="grid2">
        <Card title="Personal Information"><form className="form" onSubmit={run(() => api("/auth/me", { method: "PATCH", body: f }), "Profile updated.")}>
          {["first_name", "last_name", "phone"].map((k) => <label key={k} className="field">{k.replace("_", " ")}<input required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
          <small>{me.email} · member since {fmt(me.created_at)}</small><button className="btn dark">Save changes</button></form></Card>
        <Card title="Change Password"><form className="form" onSubmit={run(async () => { await api("/auth/change-password", { method: "POST", body: pw }); setPw({ current_password: "", new_password: "" }); }, "Password changed.")}>
          <input required type="password" placeholder="Current password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
          <input required type="password" minLength={10} placeholder="New password (10+ characters)" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          <button className="btn dark">Update password</button></form></Card>
      </div>
    </>
  );
}
