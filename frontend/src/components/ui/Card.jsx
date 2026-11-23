import { cn } from '../../lib/cn'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-vault-surface border border-vault-border rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-4 sm:px-5 pt-4 sm:pt-5', className)}>{children}</div>
  )
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={cn('text-sm font-medium text-vault-text', className)}>
      {children}
    </h2>
  )
}

export function CardContent({ className, children }) {
  return (
    <div className={cn('px-4 sm:px-5 pb-4 sm:pb-5', className)}>{children}</div>
  )
}