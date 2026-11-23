import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-vault-accent hover:bg-vault-accent-dim text-white border border-transparent',
  secondary:
    'bg-transparent border border-vault-border text-vault-subtle hover:text-vault-text hover:bg-vault-muted/40',
  ghost: 'bg-transparent border border-transparent text-vault-subtle hover:text-vault-text hover:bg-vault-muted/50',
  danger: 'bg-vault-danger/90 hover:bg-vault-danger text-white border border-transparent',
}

const sizes = {
  sm: 'text-sm px-3 py-2 min-h-[36px]',
  md: 'text-sm px-4 py-2.5 min-h-[44px]',
  lg: 'text-sm px-5 py-2.5 min-h-[44px]',
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none focus-ring'

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  to,
  children,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}