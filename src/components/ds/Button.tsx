import { ButtonHTMLAttributes } from 'react'
export const Button = ({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const isGhost = className.includes('bg-transparent')
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs px-6 py-3"
  const primary = "bg-brand text-white hover:bg-brand-hover hover:shadow-glow active:scale-[0.98]"
  const ghost = "border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white active:scale-[0.98]"
  return <button className={`${base} ${isGhost ? ghost : primary} ${className}`} {...props}>{children}</button>
}
