import { cn } from '../../lib/cn'

export function Badge({ className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md bg-vault-muted text-vault-secondary text-xs font-medium',
        className
      )}
    >
      {children}
    </span>
  )
}