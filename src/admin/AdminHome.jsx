import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Banknote, Check, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { readableError } from '../api/axios';
import { PageTitle } from '../pages/Dashboard';
import { decodeToken } from '../lib/session';
import { dateTime, label, pillClass } from '../lib/format';

const REFRESH_MS = 20000;
const ACTIVE = ['ACCEPTED', 'INSPECTING', 'AWAITING_APPROVAL', 'IN_PROGRESS'];
const customerOf = (r) => r?.customer && typeof r.customer === 'object' ? r.customer : {};
const carOf = (r) => r?.car && typeof r.car === 'object' ? r.car : {};
const TABS = [
  { key: 'PENDING', text: 'New', match: (r) => r.status === 'PENDING' },
  { key: 'ACTIVE', text: 'In progress', match: (r) => ACTIVE.includes(r.status) },
  { key: 'COMPLETED', text: 'Completed', match: (r) => r.status === 'COMPLETED' },
  { key: 'CANCELED', text: 'Canceled', match: (r) => r.status === 'CANCELED' },
  { key: 'ALL', text: 'All', match: () => true },
];

export default function AdminHome() {
  const token = useSelector((s) => s.auth.token);
  const myId = decodeToken(token)?.sub;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tab, setTab] = useState('PENDING');
  const [query, setQuery] = useState('');
  const [accepting, setAccepting] = useState('');
  const [review, setReview] = useState(null);
  const knownIds = useRef(null); // ids seen on the previous refresh, to announce new requests

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data } = await adminApi.listRequests();
      const list = Array.isArray(data) ? data : [];
      if (knownIds.current) {
        list.filter((r) => !knownIds.current.has(r.id) && r.status === 'PENDING')
          .forEach((r) => {
            const customer = customerOf(r);
            const car = carOf(r);
            toast.info(`New request from ${customer.name || 'a customer'} · ${[car.make, car.model].filter(Boolean).join(' ') || 'vehicle details unavailable'}`);
          });
      }
      knownIds.current = new Set(list.map((r) => r.id));
      setRows(list); setError(''); setUpdatedAt(new Date());
    } catch (e) {
      const notDeployed = [404, 405].includes(e.response?.status);
      if (!quiet || !rows.length) setError(notDeployed ? 'The server doesn’t have the admin request list yet. Deploy the backend update (see docs/BACKEND_NOTES.md), then refresh.' : readableError(e));
    } finally { setLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Every admin's dashboard re-reads the shared list: on a timer, when the tab regains focus.
  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  useEffect(() => {
    adminApi.transactions('NEEDS_REVIEW').then(({ data }) => setReview(Array.isArray(data) ? data.length : 0)).catch(() => setReview(null));
  }, []);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, rows.filter(t.match).length])), [rows]);

  const visible = useMemo(() => {
    const tabDef = TABS.find((t) => t.key === tab);
    const q = query.trim().toLowerCase();
    return rows.filter(tabDef.match).filter((r) => {
      const customer = customerOf(r);
      const car = carOf(r);
      return !q || [customer.name, customer.phone, car.plate_number, car.make, car.model, r.description].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [rows, tab, query]);

  const accept = async (row) => {
    setAccepting(row.id);
    try { await adminApi.acceptRequest(row.id); toast.success(`Accepted ${customerOf(row).name || 'customer'}’s request.`); }
    catch (e) { toast.error(readableError(e)); }   // e.g. "already accepted by <admin>"
    finally { setAccepting(''); load(true); }
  };

  const handledBy = (r) => {
    if (!r.accepted_by) return r.status === 'PENDING' ? <span className="unclaimed">Unclaimed</span> : <span className="muted-copy">—</span>;
    const acceptedBy = r.accepted_by && typeof r.accepted_by === 'object' ? r.accepted_by : {};
    const mine = acceptedBy.id === myId;
    return <span className="handler"><strong>{mine ? 'You' : acceptedBy.name || 'Another admin'}</strong><small>{dateTime(r.accepted_at)}</small></span>;
  };

  return (
    <>
      <PageTitle eyebrow="WORKSHOP CONSOLE" title="Maintenance requests." description="Every customer's request appears here for all admins. Accept one to claim it; everyone sees who is handling it."
        action={<button className="button button-outline" onClick={() => load()} disabled={loading}><RefreshCw size={15} /> Refresh</button>} />

      <div className="admin-stats">
        {TABS.slice(0, 4).map((t) => (
          <button key={t.key} className={`admin-stat ${tab === t.key ? 'admin-stat-active' : ''}`} onClick={() => setTab(t.key)}>
            <span>{t.text.toUpperCase()}</span><strong>{loading && !rows.length ? '–' : counts[t.key]}</strong>
          </button>
        ))}
        <Link to="/admin/payments" className="admin-stat admin-stat-link"><span><Banknote size={12} /> PAYMENTS TO REVIEW</span><strong>{review ?? '–'}</strong></Link>
      </div>

      {error && <div className="error-panel"><strong>Couldn’t load requests.</strong><span>{error}</span><button className="button button-outline button-small" onClick={() => load()}>Try again</button></div>}

      <section className="panel">
        <div className="dash-toolbar">
          <div className="tabs" role="tablist">
            {TABS.map((t) => <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'tab tab-active' : 'tab'} onClick={() => setTab(t.key)}>{t.text} <span className="tab-count">{counts[t.key]}</span></button>)}
          </div>
          <label className="search-box"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, plate or issue" /></label>
        </div>

        {loading && !rows.length ? <div className="skeleton-list"><div /><div /><div /></div> : visible.length ? (
          <div className="table-scroll">
            <table className="data-table request-table-admin">
              <thead><tr><th>Vehicle</th><th>Customer</th><th>Issue</th><th>Requested</th><th>Status</th><th>Handled by</th><th /></tr></thead>
              <tbody>{visible.map((r) => (
                <tr key={r.id} className={r.status === 'PENDING' ? 'row-new' : ''}>
                  <td><strong>{[carOf(r).year, carOf(r).make, carOf(r).model].filter(Boolean).join(' ') || 'Vehicle details unavailable'}</strong><small className="cell-sub">{carOf(r).plate_number || 'Plate unavailable'}</small></td>
                  <td><strong>{customerOf(r).name || 'Customer details unavailable'}</strong><small className="cell-sub">{customerOf(r).phone || 'Phone unavailable'}</small></td>
                  <td className="cell-issue">{r.description || 'No description provided'}</td>
                  <td>{dateTime(r.request_date)}</td>
                  <td><span className={pillClass(r.status)}>{label(r.status)}</span></td>
                  <td>{handledBy(r)}</td>
                  <td className="cell-actions">
                    {r.status === 'PENDING' && <button className="button button-blue button-small" disabled={accepting === r.id} onClick={() => accept(r)}><Check size={14} /> {accepting === r.id ? 'Accepting…' : 'Accept'}</button>}
                    <Link className="button button-outline button-small" to={`/admin/requests/${r.id}`}>Open <ArrowRight size={14} /></Link>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state compact"><strong>{rows.length ? 'No requests match.' : 'No requests yet.'}</strong><p>{rows.length ? 'Try another tab or clear the search.' : 'When a customer submits a maintenance request it will appear here for every admin.'}</p></div>
        )}
        {updatedAt && <p className="form-hint refresh-note">Live: refreshes every {REFRESH_MS / 1000}s · last updated {updatedAt.toLocaleTimeString()}</p>}
      </section>
    </>
  );
}
