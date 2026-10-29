import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { readableError } from '../api/axios';
import { byteLength } from '../lib/format';

const forgotSchema = z.object({ email: z.string().email('Enter a valid email address.') });

// POST /auth/forgot-password always answers with the same message, whether or
// not the email exists, so this page does too. It never confirms an account.
export function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema) });

  const submit = async ({ email }) => {
    setBusy(true);
    try { await authApi.forgotPassword(email); setSentTo(email); }
    catch (error) { toast.error(readableError(error)); }
    finally { setBusy(false); }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-symbol">{sentTo ? <MailCheck size={25} /> : <KeyRound size={25} />}</div>
        <div className="eyebrow">PASSWORD RESET</div>
        {sentTo ? (
          <>
            <h1>Check your inbox.</h1>
            <p className="auth-intro">If an account exists for <strong>{sentTo}</strong>, we've sent a link to choose a new password. It expires in 10 minutes.</p>
            <button className="button button-outline button-full" onClick={() => setSentTo('')}>Use a different email</button>
          </>
        ) : (
          <>
            <h1>Forgot your password?</h1>
            <p className="auth-intro">Enter the email you registered with and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit(submit)} noValidate>
              <label className="field-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
              <button className="button button-blue button-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'} <ArrowRight size={16} /></button>
            </form>
          </>
        )}
        <Link className="back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
      </div>
    </section>
  );
}

const resetSchema = z.object({
  token: z.string().trim().min(1, 'Paste the token from your email.'),
  new_password: z.string().min(10, 'Use at least 10 characters.').max(72, 'Password must be at most 72 characters.')
    .refine((v) => byteLength(v) <= 72, 'Password is too long (maximum 72 bytes).'),
  confirm: z.string(),
}).refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' });

// The email link is `${FRONTEND_BASE_URL}/reset-password?token=...`
export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const urlToken = params.get('token') || '';
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: urlToken },
  });

  const submit = async ({ token, new_password }) => {
    setBusy(true);
    try {
      const { data } = await authApi.resetPassword(token.trim(), new_password);
      toast.success(data.message || 'Password reset. You can now sign in.');
      navigate('/login', { replace: true });
    } catch (error) { toast.error(readableError(error)); }
    finally { setBusy(false); }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-symbol"><KeyRound size={25} /></div>
        <div className="eyebrow">PASSWORD RESET</div>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">Your reset link is valid for 10 minutes and can only be used once.</p>
        <form onSubmit={handleSubmit(submit)} noValidate>
          {!urlToken && (
            <label className="field-label">Reset token<input placeholder="Paste the token from your email link" {...register('token')} />{errors.token && <small className="field-error">{errors.token.message}</small>}</label>
          )}
          <label className="field-label">New password
            <div className="password-field">
              <input type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 10 characters" {...register('new_password')} />
              <button type="button" className="password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {errors.new_password && <small className="field-error">{errors.new_password.message}</small>}
          </label>
          <label className="field-label">Confirm new password<input type={visible ? 'text' : 'password'} autoComplete="new-password" {...register('confirm')} />{errors.confirm && <small className="field-error">{errors.confirm.message}</small>}</label>
          <button className="button button-blue button-full" disabled={busy}>{busy ? 'Saving…' : 'Reset password'} <ArrowRight size={16} /></button>
        </form>
        <Link className="back-link" to="/forgot-password"><ArrowLeft size={15} /> Request a new link</Link>
      </div>
    </section>
  );
}
