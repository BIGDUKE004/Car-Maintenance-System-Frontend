import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, LogOut, Menu, Wrench } from 'lucide-react';
import { signedOut } from '../app/store';

// One sidebar + topbar used by both the customer portal and the admin console.
export default function Shell({ nav, crumb, account, AccountIcon, tip }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const logout = () => { dispatch(signedOut()); navigate('/'); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand sidebar-brand"><span className="brand-mark"><Wrench size={18} /></span><span>motora<span className="brand-dot">.</span></span></Link>
        <div className="sidebar-section-label">{nav.label}</div>
        {nav.items.map(({ to, end, icon: Icon, text }) => (
          <NavLink key={to} end={end} to={to} onClick={close}><Icon size={18} /> {text}</NavLink>
        ))}
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Wrench size={17} /></div><strong>{tip.title}</strong><p>{tip.body}</p></div>
          <button className="sidebar-logout" onClick={logout}><LogOut size={17} /> Sign out</button>
          <Link className="back-home" to="/"><ArrowLeft size={14} /> Back to website</Link>
        </div>
      </aside>
      {open && <button aria-label="Close navigation" className="mobile-scrim" onClick={close} />}
      <div className="app-main">
        <header className="app-topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(!open)}><Menu size={20} /></button>
          <div className="crumb"><span>{crumb.area}</span><span className="crumb-slash">/</span><strong>{crumb.page}</strong></div>
          <div className="account-chip"><span className="account-avatar"><AccountIcon size={19} /></span><span>{account}</span></div>
        </header>
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}
