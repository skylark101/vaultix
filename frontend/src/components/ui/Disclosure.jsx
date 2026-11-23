import { cn } from '../../lib/cn'

export function Disclosure({
  title,
  description,
  open,
  onToggle,
  badge,
  children,
  className,
}) {
  const panelId = 'disclosure-panel'
  const headerId = 'disclosure-header'

  return (
    <div
      className={cn(
        'border border-vault-border rounded-lg overflow-hidden bg-vault-inset/30',
        className
      )}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left focus-ring"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-vault-text">{title}</span>
          {description && (
            <span className="block text-xs text-vault-subtle mt-0.5 font-normal">
              {description}
            </span>
          )}
        </span>
        {badge && !open && (
          <span className="text-xs text-vault-secondary shrink-0">{badge}</span>
        )}
        <svg
          className={cn(
            'shrink-0 text-vault-subtle transition-transform duration-150',
            open && 'rotate-180'
          )}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="px-4 pb-4 pt-1 space-y-4 border-t border-vault-border"
        >
          {children}
        </div>
      )}
    </div>
  )
}