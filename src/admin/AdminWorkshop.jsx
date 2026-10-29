import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../api/adminApi';
import { readableError } from '../api/axios';
import { PageTitle } from '../pages/Dashboard';
import { byteLength } from '../lib/format';

const schema = z.object({
  first_name: z.string().trim().min(2, 'At least 2 characters.').max(15, 'At most 15 characters.'),
  last_name: z.string().trim().min(2, 'At least 2 characters.').max(15, 'At most 15 characters.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().trim().min(11, 'At least 11 characters.').max(14, 'At most 14 characters.'),
  password: z.string().min(10, 'Use at least 10 characters.').max(72).refine((v) => byteLength(v) <= 72, 'Maximum 72 bytes.'),
});

export default function AdminWorkshop() {
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const addAdmin = async (values) => {
    setSaving(true);
    try {
      await adminApi.addAdmin(values); // response intentionally ignored (see docs/BACKEND_NOTES.md)
      toast.success(`${values.first_name} can now sign in as a workshop admin.`);
      reset();
    } catch (e) { toast.error(readableError(e)); }
    finally { setSaving(false); }
  };

  const retry = async () => {
    setRetrying(true);
    try { const { data } = await adminApi.retryFailedEmails(); setRetryResult(data); toast.success('Retry finished.'); }
    catch (e) { toast.error(readableError(e)); }
    finally { setRetrying(false); }
  };

  const field = (name, text, props = {}) => (
    <label className="field-label">{text}<input {...props} {...register(name)} />{errors[name] && <small className="field-error">{errors[name].message}</small>}</label>
  );

  return (
    <>
      <PageTitle eyebrow="WORKSHOP TOOLS" title="Workshop tools." description="Manage who can run the workshop and make sure customers received their notifications." />
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading"><div><span className="panel-kicker">TEAM</span><h2>Add a workshop admin</h2></div></div>
          <form onSubmit={handleSubmit(addAdmin)} noValidate>
            <div className="form-row">{field('first_name', 'First name', { autoComplete: 'off' })}{field('last_name', 'Last name', { autoComplete: 'off' })}</div>
            {field('email', 'Email address', { type: 'email', autoComplete: 'off' })}
            {field('phone', 'Phone number', { type: 'tel', autoComplete: 'off' })}
            {field('password', 'Temporary password', { type: 'password', autoComplete: 'new-password', placeholder: 'At least 10 characters' })}
            <p className="form-hint">The new admin is created already verified and can sign in immediately. Share the password securely and ask them to change it with “Forgot password”.</p>
            <button className="button button-blue" disabled={saving}><UserPlus size={15} /> {saving ? 'Creating…' : 'Create admin'}</button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><span className="panel-kicker">NOTIFICATIONS</span><h2>Failed emails</h2></div></div>
          <p className="muted-copy">When an additional-service email can’t be delivered, the service is still saved and the email is queued as failed. Retry sends them again.</p>
          <button className="button button-outline" onClick={retry} disabled={retrying}><Mail size={15} /> {retrying ? 'Retrying…' : 'Retry failed emails'}</button>
          {retryResult && <div className="reference-box"><span>LAST RETRY</span><strong>{retryResult.sent} sent · {retryResult.still_failed} still failing</strong></div>}
        </section>
      </div>
    </>
  );
}
