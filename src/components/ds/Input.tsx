import { InputHTMLAttributes, forwardRef } from 'react'
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`w-full bg-ink-800 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all ${className}`} {...props} />
))
