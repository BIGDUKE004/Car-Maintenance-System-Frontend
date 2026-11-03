import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ds/Button'
import { Input } from '@/components/ds/Input'

export function ForgotPassword() {
 const [email,setEmail]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState('')
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');try{const r=await api.forgotPassword(email);setMessage(r.message)}catch(x:any){setError(x.message)}}
 return <div className="flex min-h-screen items-center justify-center bg-stone-950 p-6"><div className="w-full max-w-md rounded-xl border border-white/10 bg-stone-900 p-8"><Link to="/" className="font-serif text-3xl text-white">Motora<span className="text-brand">.</span></Link><h1 className="mt-8 text-3xl font-serif text-white">Reset your password</h1><p className="mt-2 text-sm text-stone-400">Enter the email address associated with your account.</p>{message&&<p role="status" className="mt-5 rounded-lg bg-white/5 p-4 text-sm text-stone-200">{message}</p>}{error&&<p className="mt-5 text-sm text-red-300">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-4"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email address"/><Button type="submit" className="w-full">Send reset link</Button></form><Link to="/login" className="mt-6 inline-block text-sm text-brand">Back to login</Link></div></div>
}

export function ResetPassword() {
 const [params]=useSearchParams();const token=params.get('token')||'';const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState('')
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');try{const r=await api.resetPassword(token,password);setMessage(r.message)}catch(x:any){setError(x.message)}}
 return <div className="flex min-h-screen items-center justify-center bg-stone-950 p-6"><div className="w-full max-w-md rounded-xl border border-white/10 bg-stone-900 p-8"><h1 className="text-3xl font-serif text-white">Choose a new password</h1>{!token&&<p className="mt-4 text-red-300">This reset link is missing its token.</p>}{message&&<p role="status" className="mt-4 text-sm text-green-300">{message} <Link to="/login" className="text-brand">Sign in</Link></p>}{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-4"><Input type="password" minLength={10} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="New password (at least 10 characters)"/><Button type="submit" disabled={!token||!!message} className="w-full">Update password</Button></form></div></div>
}

export function VerifyEmail() {
 const [params]=useSearchParams();const token=params.get('token')||'';const [message,setMessage]=useState('Verifying email…');const [error,setError]=useState('')
 useEffect(()=>{if(token)api.verifyEmail(token).then(r=>setMessage(r.message)).catch(e=>{setError(e.message);setMessage('Email verification failed.')});else setMessage('This verification link is missing its token.')},[token])
 return <div className="flex min-h-screen items-center justify-center bg-stone-950 p-6"><div className="w-full max-w-md rounded-xl border border-white/10 bg-stone-900 p-8"><h1 className="text-3xl font-serif text-white">Email verification</h1><p className="mt-4 text-stone-300">{message}</p>{error&&<p className="mt-2 text-sm text-red-300">{error}</p>}<Link to="/login" className="mt-6 inline-block text-brand">Continue to login</Link></div></div>
}
