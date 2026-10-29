import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { readableError } from '../api/axios';
import { PageTitle } from '../pages/Dashboard';
import { dateTime, label, money, pillClass } from '../lib/format';

const TABS = ['NEEDS_REVIEW', 'PENDING', 'SUCCESS', 'RESOLVED', 'FAILED'];
const HELP = {
  NEEDS_REVIEW: 'Money reached Paystack but could not be recorded (for example the service was already paid in cash, or the amount didn’t match). Refund or fix it, then mark it resolved.',
  PENDING: 'Started but not completed by the customer yet.',
  SUCCESS: 'Verified with Paystack and recorded against the service.',
  RESOLVED: 'Reviewed and handled by the workshop.',
  FAILED: 'Paystack could not start the transaction.',
};

export default function AdminPayments() {
  const [status, setStatus] = useState('NEEDS_REVIEW');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const { data } = await adminApi.transactions(status); setRows(Array.isArray(data) ? data : []); }
    catch (e) { setError(readableError(e)); setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);

  const resolve = async (row) => {
    if (!window.confirm(`Mark ${row.reference} as resolved?\n\nOnly do this after you have refunded the customer in Paystack or otherwise fixed it.`)) return;
    setBusy(row.reference);
    try { await adminApi.resolveTransaction(row.reference); toast.success('Transaction marked as resolved.'); await load(); }
    catch (e) { toast.error(readableError(e)); }
    finally { setBusy(''); }
  };

  return (
    <>
      <PageTitle eyebrow="ONLINE PAYMENTS" title="Payment review." description="Paystack transactions by status. Cash, card and transfer payments you confirm yourself are recorded from the request page."
        action={<button className="button button-outline" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>} />
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={t === status} className={t === status ? 'tab tab-active' : 'tab'} onClick={() => setStatus(t)}>{label(t)}</button>)}
      </div>
      <p className="tab-help">{HELP[status]}</p>
      {error && <div className="error-panel"><strong>Couldn’t load transactions.</strong><span>{error}</span><button className="button button-outline button-small" onClick={load}>Try again</button></div>}
      <section className="panel">
        {loading ? <div className="skeleton-list"><div /><div /></div> : rows.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Created</th><th>Paid</th><th>Request</th><th /></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.reference}</td>
                  <td><strong>{money(r.amount)}</strong></td>
                  <td><span className={pillClass(r.status)}>{label(r.status)}</span></td>
                  <td>{dateTime(r.created_at)}</td>
                  <td>{dateTime(r.paid_at)}</td>
                  <td><Link className="small-link" to={`/admin/requests/${r.maintenance_request_id}`}>Open</Link></td>
                  <td>{r.status === 'NEEDS_REVIEW' && <button className="button button-outline button-small" disabled={busy === r.reference} onClick={() => resolve(r)}><CheckCheck size={14} /> {busy === r.reference ? 'Saving…' : 'Mark resolved'}</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty-state compact"><strong>Nothing here.</strong><p>No {label(status).toLowerCase()} transactions.</p></div>}
      </section>
    </>
  );
}
