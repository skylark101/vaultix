import { cn } from '../../lib/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full bg-vault-inset border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text',
        'placeholder:text-vault-subtle focus:border-vault-accent/60 transition-colors focus-ring',
        className
      )}
      {...props}
    />
  )
}