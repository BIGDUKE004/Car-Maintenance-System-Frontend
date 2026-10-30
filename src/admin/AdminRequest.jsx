import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, CalendarClock, Camera, CirclePlus, RefreshCw, ShieldQuestion, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { customerApi, maintenanceApi } from '../api/customerApi';
import { readableError } from '../api/axios';
import Modal from '../components/Modal';
import { dateOnly, dateTime, label, money, pillClass } from '../lib/format';

const FLOW = ['PENDING', 'ACCEPTED', 'INSPECTING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'COMPLETED'];
const CLOSED = ['COMPLETED', 'CANCELED'];
const IMAGE_CATEGORIES = ['BEFORE', 'DAMAGE_PART', 'REMOVED_PART', 'REPLACEMENT_PART', 'AFTER'];

// Mirrors MaintenanceRequestService.update_status on the backend, which is the
// real authority: anything not listed here would be rejected with "Invalid
// maintenance status transition".
const NEXT = {
  PENDING: [{ text: 'Accept request', run: (id) => adminApi.acceptRequest(id), primary: true }],
  ACCEPTED: [{ text: 'Start inspection', run: (id) => adminApi.inspectRequest(id), primary: true }],
  INSPECTING: [
    { text: 'Start work', to: 'IN_PROGRESS', primary: true },
    { text: 'Wait for customer approval', to: 'AWAITING_APPROVAL' },
  ],
  AWAITING_APPROVAL: [{ text: 'Start work', to: 'IN_PROGRESS', primary: true, checkPending: true }],
  IN_PROGRESS: [{ text: 'Mark completed', to: 'COMPLETED', primary: true }],
};

export default function AdminRequest() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [services, setServices] = useState([]);
  const [entry, setEntry] = useState(null); // this request inside the car's maintenance history
  const [otherRequests, setOtherRequests] = useState([]);
  const [totals, setTotals] = useState({ total: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [modal, setModal] = useState(null); // 'service' | { payFor: service }
  const [images, setImages] = useState([]); // uploaded during this visit (no list endpoint exists)

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Admins pass the ownership checks on these shared endpoints.
      const [req, svc, total, balance] = await Promise.all([
        adminApi.getRequest(id), customerApi.servicesForRequest(id), maintenanceApi.totalCost(id), maintenanceApi.balance(id),
      ]);
      setRequest(req.data);
      setServices(Array.isArray(svc.data) ? svc.data : []);
      setTotals({ total: total.data.total_cost, balance: balance.data.balance });
      try {
        const { data: history } = await customerApi.maintenanceHistory(req.data.car_id);
        const rows = Array.isArray(history) ? history : [];
        const mine = rows.find((r) => r.request_id === id) || null;
        setEntry(mine);
        setOtherRequests(rows.filter((r) => r.request_id !== id));
      } catch { setEntry(null); setOtherRequests([]); }
    } catch (e) { setError(readableError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); setImages([]); }, [id]);

  // Per-service payment figures come from the car history (the services endpoint has none).
  const paymentByService = useMemo(() => {
    const map = {};
    (entry?.services || []).forEach((s) => { map[s.service_id] = s.payment; });
    return map;
  }, [entry]);

  const act = async (key, fn, success) => {
    setBusy(key);
    try { await fn(); toast.success(success); await load(); return true; }
    catch (e) { toast.error(readableError(e)); return false; }
    finally { setBusy(''); }
  };

  const pendingAdditional = services.filter((s) => s.is_additional && s.approval === 'PENDING').length;

  const transition = (step) => {
    if (step.checkPending && pendingAdditional > 0 &&
      !window.confirm(`${pendingAdditional} additional service(s) are still waiting for the customer's approval. Start work anyway?`)) return;
    act(step.text, () => (step.run ? step.run(id) : adminApi.updateStatus(id, step.to)), `${step.text}: done.`);
  };

  const cancel = () => {
    if (!window.confirm('Cancel this maintenance request? This cannot be undone.')) return;
    act('cancel', () => maintenanceApi.cancel(id), 'Request cancelled.');
  };

  if (loading && !request) return <div className="detail-loading"><div className="skeleton-card" /><div className="skeleton-card" /></div>;
  if (error || !request) return (
    <>
      <Link className="back-link" to="/admin"><ArrowLeft size={15} /> Back to requests</Link>
      <div className="error-panel"><strong>Request unavailable.</strong><span>{error || 'Not found.'}</span><button className="button button-outline button-small" onClick={load}>Try again</button></div>
    </>
  );

  const status = request.status;
  const closed = CLOSED.includes(status);
  const car = request.car;

  return (
    <>
      <Link className="back-link" to="/admin"><ArrowLeft size={15} /> All requests</Link>
      <div className="page-title-row detail-title">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> {car ? `${car.year} ${car.make} ${car.model} · ${car.plate_number}` : 'MAINTENANCE REQUEST'}</div>
          <h1>{label(status)}</h1>
          <p>{request.description}</p>
        </div>
        <button className="button button-outline" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </div>

      <section className="panel">
        <div className="panel-heading"><div><span className="panel-kicker">PROGRESS</span><h2>Workflow</h2></div><span className={pillClass(status)}>{label(status)}</span></div>
        {status === 'CANCELED' ? <p className="muted-copy">This request was cancelled.</p> : (
          <ol className="workflow">
            {FLOW.map((step, i) => {
              const at = FLOW.indexOf(status);
              const state = i < at ? 'done' : i === at ? 'current' : 'todo';
              return <li key={step} className={`workflow-step workflow-${state}`}><span className="workflow-dot">{state === 'done' ? '✓' : i + 1}</span><span>{label(step)}</span></li>;
            })}
          </ol>
        )}
        {!closed && (
          <div className="action-bar">
            {(NEXT[status] || []).map((step) => (
              <button key={step.text} className={`button ${step.primary ? 'button-blue' : 'button-outline'}`} disabled={!!busy} onClick={() => transition(step)}>
                {busy === step.text ? 'Working…' : step.text} {step.primary && <ArrowRight size={15} />}
              </button>
            ))}
            <button className="button button-outline danger-button" disabled={!!busy} onClick={cancel}>Cancel request</button>
          </div>
        )}
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading"><div><span className="panel-kicker">REQUEST OVERVIEW</span><h2>Details</h2></div></div>
          <div className="detail-facts">
            <div><span>Customer</span><strong>{request.customer.name}</strong><small className="cell-sub">{request.customer.phone} · {request.customer.email}</small></div>
            <div><span>Handled by</span><strong>{request.accepted_by ? request.accepted_by.name : 'Not accepted yet'}</strong>{request.accepted_at && <small className="cell-sub">{dateTime(request.accepted_at)}</small>}</div>
            <div><span>Request ID</span><strong className="id-value">{request.id}</strong></div>
            <div><span>Requested for</span><strong>{dateTime(request.request_date)}</strong></div>
            <div><span>Submitted</span><strong>{dateTime(request.created_at)}</strong></div>
            <div><span>Completed</span><strong>{dateOnly(request.completed_at)}</strong></div>
          </div>
          <NextServiceDate request={request} busy={busy} onSave={(date) => act('next', () => adminApi.setNextServiceDate(id, date), 'Next service date saved.')} />
        </section>
        <section className="balance-card">
          <span className="balance-kicker"><Banknote size={15} /> PAYMENT SUMMARY</span>
          <span className="balance-label">Outstanding balance</span>
          <strong className="balance-amount">{money(totals.balance)}</strong>
          <div className="balance-divider" />
          <div className="balance-line"><span>Total (approved) cost</span><strong>{money(totals.total)}</strong></div>
        </section>
      </div>

      <section className="panel services-panel">
        <div className="panel-heading">
          <div><span className="panel-kicker">ITEMIZED WORK</span><h2>Services</h2></div>
          {!closed && <button className="button button-blue button-small" onClick={() => setModal('service')}><CirclePlus size={15} /> Add service</button>}
        </div>
        {services.length ? (
          <div className="service-list">
            {services.map((s) => {
              const pay = paymentByService[s.id];
              const paid = Number(pay?.amount_paid || 0);
              const remaining = Math.max(0, Number(s.cost) - paid);
              const payable = (!s.is_additional || s.approval === 'APPROVED') && remaining > 0 && status !== 'CANCELED';
              return (
                <article className="service-row" key={s.id}>
                  <div className="service-row-icon"><Wrench size={19} /></div>
                  <div className="service-info">
                    <strong>{s.name}</strong><p>{s.description}</p>
                    <div className="pill-row">
                      {s.is_additional && <span className={pillClass(s.approval)}>Additional · {s.approval}</span>}
                      {(!s.is_additional || s.approval === 'APPROVED') && <span className={pillClass(pay?.status || 'UNPAID')}>{label(pay?.status || 'UNPAID')}</span>}
                    </div>
                  </div>
                  <div className="service-pricing"><span>Cost</span><strong>{money(s.cost)}</strong><small>Outstanding {money(remaining)}</small></div>
                  <div className="service-actions">
                    {payable && <button className="button button-outline button-small" onClick={() => setModal({ payFor: { ...s, remaining } })}>Record payment</button>}
                    {s.is_additional && s.approval === 'PENDING' && <small className="muted-copy">Awaiting customer</small>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="empty-state compact"><div className="empty-icon"><Wrench size={22} /></div><strong>No services yet.</strong><p>Add the work you’ll carry out so the customer can see costs and pay.</p></div>}
      </section>

      <div className="detail-grid">
        <VerifyVehicle carId={request.car_id} />
        <PhotoPanel requestId={id} images={images} setImages={setImages} disabled={status === 'CANCELED'} />
      </div>

      {otherRequests.length > 0 && (
        <section className="panel">
          <div className="panel-heading"><div><span className="panel-kicker">SAME VEHICLE</span><h2>Other requests for this car</h2></div></div>
          <div className="activity-list">
            {otherRequests.map((r) => (
              <Link className="activity-row" key={r.request_id} to={`/admin/requests/${r.request_id}`}>
                <span className="activity-info"><strong>{(r.services || []).map((s) => s.service_name).join(', ') || 'No services yet'}</strong><small>{dateOnly(r.request_date)}</small></span>
                <span className={pillClass(r.request_status)}>{label(r.request_status)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {modal === 'service' && <ServiceModal request={request} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.payFor && <PaymentModal request={request} service={modal.payFor} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
    </>
  );
}

function NextServiceDate({ request, onSave, busy }) {
  const [value, setValue] = useState(request.next_service_date || '');
  useEffect(() => setValue(request.next_service_date || ''), [request.next_service_date]);
  return (
    <div className="inline-form">
      <label className="field-label"><span><CalendarClock size={13} /> Next service date</span><input type="date" value={value} onChange={(e) => setValue(e.target.value)} /></label>
      <button className="button button-outline button-small" disabled={!value || busy === 'next'} onClick={() => onSave(value)}>Save date</button>
    </div>
  );
}

function VerifyVehicle({ carId }) {
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setResult(null);
    try { const { data } = await adminApi.verifyVehicle(carId, plate.trim(), vin.trim()); setResult(!!data.verified); }
    catch (err) { toast.error(readableError(err)); }
    finally { setBusy(false); }
  };
  return (
    <section className="panel">
      <div className="panel-heading"><div><span className="panel-kicker">AT THE WORKSHOP</span><h2>Verify the vehicle</h2></div></div>
      <p className="muted-copy">Type the plate number and VIN from the car in front of you to confirm it matches this request.</p>
      <form onSubmit={submit}>
        <label className="field-label">Plate number<input required value={plate} onChange={(e) => setPlate(e.target.value)} /></label>
        <label className="field-label">VIN<input required value={vin} onChange={(e) => setVin(e.target.value)} /></label>
        <button className="button button-outline button-small" disabled={busy}><ShieldQuestion size={15} /> {busy ? 'Checking…' : 'Verify'}</button>
      </form>
      {result !== null && <div className={`verify-result ${result ? 'verify-ok' : 'verify-bad'}`}><BadgeCheck size={16} /> {result ? 'Match: this is the registered vehicle.' : 'No match: plate or VIN differ from the registered car.'}</div>}
    </section>
  );
}

function PhotoPanel({ requestId, images, setImages, disabled }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('BEFORE');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await adminApi.addImage({ maintenance_request_id: requestId, image_url: url.trim(), category });
      setImages([data, ...images]); setUrl(''); toast.success('Photo recorded.');
    } catch (err) { toast.error(readableError(err)); }
    finally { setBusy(false); }
  };
  return (
    <section className="panel">
      <div className="panel-heading"><div><span className="panel-kicker">DOCUMENTATION</span><h2>Photos</h2></div></div>
      <form onSubmit={submit}>
        <label className="field-label">Image URL<input type="url" required placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} disabled={disabled} /></label>
        <label className="field-label">Category<select value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabled}>{IMAGE_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></label>
        <p className="form-hint">The API stores a link to an already-hosted image; it does not accept file uploads or list photos back, so only this visit’s photos appear below.</p>
        <button className="button button-outline button-small" disabled={busy || disabled}><Camera size={15} /> {busy ? 'Saving…' : 'Add photo'}</button>
      </form>
      {images.length > 0 && <div className="photo-grid">{images.map((img) => <figure key={img.id}><img src={img.image_url} alt={label(img.category)} loading="lazy" /><figcaption>{label(img.category)}</figcaption></figure>)}</div>}
    </section>
  );
}

function ServiceModal({ request, onClose, onDone }) {
  const canBeAdditional = ['INSPECTING', 'AWAITING_APPROVAL'].includes(request.status);
  const [f, setF] = useState({ name: '', description: '', cost: '', is_additional: false });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await adminApi.addService({ maintenance_request_id: request.id, name: f.name.trim(), description: f.description.trim(), cost: Number(f.cost), is_additional: f.is_additional });
      if (f.is_additional && data.email_sent === false) toast.warning('Service added, but the customer email failed. Use “Retry failed emails” in Workshop tools.');
      else toast.success(data.message || 'Service added.');
      onDone();
    } catch (err) { toast.error(readableError(err)); setBusy(false); }
  };
  return (
    <Modal kicker="NEW SERVICE" title="Add a service" subtitle="Standard services are billable straight away. Additional work needs the customer’s approval first." onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field-label">Name<input required minLength="2" maxLength="20" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Brake pads" /></label>
        <label className="field-label">Description<textarea required minLength="5" maxLength="100" rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label className="field-label">Cost (₦)<input required type="number" min="0.01" step="0.01" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></label>
        <label className="check-label"><input type="checkbox" disabled={!canBeAdditional} checked={f.is_additional} onChange={(e) => setF({ ...f, is_additional: e.target.checked })} /> Additional work found during inspection (emails the customer for approval)</label>
        {!canBeAdditional && <p className="form-hint">Additional services can only be added while the request is Inspecting or Awaiting approval.</p>}
        <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-blue" disabled={busy}>{busy ? 'Adding…' : 'Add service'}</button></div>
      </form>
    </Modal>
  );
}

function PaymentModal({ request, service, onClose, onDone }) {
  const [amount, setAmount] = useState(String(service.remaining));
  const [method, setMethod] = useState('CASH');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await adminApi.recordPayment({ maintenance_request_id: request.id, maintenance_service_id: service.id, amount: Number(amount), method });
      toast.success('Payment recorded.'); onDone();
    } catch (err) { toast.error(readableError(err)); setBusy(false); }
  };
  return (
    <Modal kicker="RECORD PAYMENT" title={service.name} subtitle={`Outstanding ${money(service.remaining)}. Only record money you have actually received.`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field-label">Amount (₦)<input required type="number" min="0.01" max={service.remaining} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label className="field-label">Method<select value={method} onChange={(e) => setMethod(e.target.value)}><option value="CASH">Cash</option><option value="CARD">Card / POS</option><option value="TRANSFER">Bank transfer</option></select></label>
        <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-blue" disabled={busy}>{busy ? 'Recording…' : 'Record payment'}</button></div>
      </form>
    </Modal>
  );
}
