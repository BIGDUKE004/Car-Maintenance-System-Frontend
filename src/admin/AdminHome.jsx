import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Banknote, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { readableError } from '../api/axios';
import { PageTitle } from '../pages/Dashboard';
import { forgetRequest, getRecent } from '../lib/recent';
import { dateTime, isUuid, pillClass, label } from '../lib/format';

export default function AdminHome() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [recent, setRecent] = useState(getRecent());
  const [review, setReview] = useState(null);

  useEffect(() => {
    adminApi.transactions('NEEDS_REVIEW')
      .then(({ data }) => setReview(Array.isArray(data) ? data.length : 0))
      .catch((e) => { setReview(null); toast.error(readableError(e)); });
  }, []);

  const open = (e) => {
    e.preventDefault();
    const value = id.trim();
    if (!isUuid(value)) return toast.error('That doesn’t look like a request ID. Paste the full ID (it looks like 3f2b…-…).');
    navigate(`/admin/requests/${value}`);
  };

  return (
    <>
      <PageTitle eyebrow="WORKSHOP CONSOLE" title="Requests." description="Open a customer's maintenance request to accept it, inspect, add services, record payments and track progress." />

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading"><div><span className="panel-kicker">FIND A REQUEST</span><h2>Open by request ID</h2></div></div>
          <form className="lookup-form" onSubmit={open}>
            <label className="field-label">Maintenance request ID
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Paste a request ID" spellCheck="false" />
            </label>
            <button className="button button-blue"><Search size={15} /> Open request</button>
          </form>
          <p className="form-hint">The workshop API can look a request up by ID but has no endpoint that lists every request yet. Requests you open are remembered below on this device.</p>
        </section>

        <Link to="/admin/payments" className="balance-card admin-review-card">
          <span className="balance-kicker"><Banknote size={15} /> PAYMENT REVIEW</span>
          <span className="balance-label">Online payments needing review</span>
          <strong className="balance-amount">{review ?? '—'}</strong>
          <div className="balance-divider" />
          <div className="balance-line"><span>Open the review queue</span><ArrowRight size={16} /></div>
        </Link>
      </div>

      <section className="panel">
        <div className="panel-heading"><div><span className="panel-kicker">ON THIS DEVICE</span><h2>Recently opened</h2></div></div>
        {recent.length ? (
          <div className="activity-list">
            {recent.map((r) => (
              <div className="recent-row" key={r.id}>
                <Link className="activity-row" to={`/admin/requests/${r.id}`}>
                  <span className="activity-info"><strong>{r.title || 'Maintenance request'}</strong><small>{r.id} · opened {dateTime(r.at)}</small></span>
                  {r.status && <span className={pillClass(r.status)}>{label(r.status)}</span>}
                </Link>
                <button className="icon-button" aria-label="Remove from list" onClick={() => { forgetRequest(r.id); setRecent(getRecent()); }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact"><strong>Nothing opened yet.</strong><p>Paste a request ID above. Customers' request IDs appear in their dashboard and in additional-service emails.</p></div>
        )}
      </section>
    </>
  );
}
