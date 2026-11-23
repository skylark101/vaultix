import { cn } from '../../lib/cn'

export function Label({ className, children, htmlFor, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}