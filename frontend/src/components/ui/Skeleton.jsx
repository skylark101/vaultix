import { cn } from '../../lib/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-vault-muted/60',
        className
      )}
      aria-hidden
      {...props}
    />
  )
}