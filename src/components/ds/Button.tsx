import { ButtonHTMLAttributes, MouseEvent, useState } from 'react'
import { Icon } from './Icon'

export type ButtonVariant = 'primary' | 'ghost' | 'success' | 'danger' | 'dangerSolid' | 'info' | 'warning'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Show a spinner and block clicks. If omitted, an async onClick is tracked automatically. */
  loading?: boolean
  loadingText?: string
  /** Name of an Icon shown before the label so the action is recognisable at a glance. */
  icon?: string
  /** Colour by purpose: success = approve, danger = deny/delete, info = view, warning = needs attention. */
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover hover:shadow-glow active:bg-brand-hover',
  ghost: 'border border-stone-500 text-stone-100 hover:border-stone-300 hover:bg-white/10 active:bg-white/20',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
  danger: 'border border-red-500/70 bg-red-500/10 text-red-300 hover:bg-red-600 hover:text-white active:bg-red-700',
  dangerSolid: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
  info: 'border border-sky-500/60 bg-sky-500/10 text-sky-300 hover:bg-sky-500 hover:text-white active:bg-sky-600',
  warning: 'border border-amber-500/70 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-stone-950 active:bg-amber-600',
}

export const Button = ({ className = '', children, loading, loadingText, icon, variant, onClick, disabled, ...props }: Props) => {
  const [autoBusy, setAutoBusy] = useState(false)
  const busy = loading ?? autoBusy
  const chosen: ButtonVariant = variant ?? (className.includes('bg-transparent') ? 'ghost' : 'primary')
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 rounded-xl disabled:opacity-60 disabled:pointer-events-none uppercase tracking-wide text-[13px] leading-none px-5 py-3.5 select-none active:scale-[0.97]'

  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    if (busy) return
    const result: unknown = onClick?.(e)
    if (loading === undefined && result && typeof (result as Promise<unknown>).then === 'function') {
      setAutoBusy(true)
      ;(result as Promise<unknown>).finally(() => setAutoBusy(false))
    }
  }

  return (
    <button
      className={`${base} ${variants[chosen]} ${busy ? 'opacity-70 cursor-wait' : ''} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy}
      onClick={handle}
      {...props}
    >
      {busy && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {!busy && icon && <Icon name={icon} className="h-4 w-4 shrink-0" />}
      {busy && loadingText ? loadingText : children}
    </button>
  )
}
