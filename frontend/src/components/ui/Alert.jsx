import { cn } from '../../lib/cn'

const styles = {
  error: 'bg-vault-danger/10 border-vault-danger/25 text-vault-danger',
  success: 'bg-vault-success/10 border-vault-success/25 text-vault-success',
  info: 'bg-vault-accent/10 border-vault-accent/25 text-vault-link',
}

export function Alert({ variant = 'error', className, children }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 border rounded-lg px-3 py-2.5 text-sm',
        styles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}