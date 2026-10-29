import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { homeFor } from '../lib/session';

export default function SiteLayout() {
  const { token, role } = useSelector((s) => s.auth);
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link to="/" className="brand"><span className="brand-mark"><Wrench size={18} /></span><span>motora<span className="brand-dot">.</span></span></Link>
        <nav className="site-nav"><a href="/#how-it-works">How it works</a><a href="/#care">Your car, considered</a></nav>
        <div className="top-actions">
          {token ? (
            <Link className="button button-dark button-small" to={homeFor(role)}>Open dashboard <ArrowUpRight size={15} /></Link>
          ) : (
            <><Link className="text-link" to="/login">Sign in</Link><Link className="button button-dark button-small" to="/register">Get started <ArrowUpRight size={15} /></Link></>
          )}
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <Link to="/" className="brand"><span className="brand-mark"><Wrench size={17} /></span><span>motora<span className="brand-dot">.</span></span></Link>
        <span>Thoughtful care for every mile.</span><span>Car maintenance, made clearer.</span>
      </footer>
    </div>
  );
}
