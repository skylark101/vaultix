import { cn } from '../../lib/cn'

export function IconButton({
  label,
  onClick,
  children,
  danger = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        'min-w-[44px] min-h-[44px] lg:min-w-9 lg:min-h-9 rounded-lg',
        'text-vault-subtle hover:text-vault-text hover:bg-vault-muted/50 transition-colors focus-ring',
        danger && 'hover:text-vault-danger hover:bg-vault-danger/10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}