import { cn } from '../../lib/cn'

export function ModalOverlay({ onClose, children, className }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4',
        className
      )}
      onClick={onClose}
      role="presentation"
    >
      {children}
    </div>
  )
}

export function ModalPanel({
  onClose,
  title,
  children,
  className,
  sheetOnMobile = true,
}) {
  return (
  <div
    className={cn(
      'bg-vault-surface border border-vault-border w-full max-h-[92vh] overflow-y-auto fade-in',
      sheetOnMobile
        ? 'sm:max-w-lg sm:mx-4 sm:rounded-xl rounded-t-2xl'
        : 'sm:max-w-lg sm:mx-4 rounded-xl',
      className
    )}
    onClick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    {title != null && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-vault-border sticky top-0 bg-vault-surface z-10">
        <h2 id="modal-title" className="text-vault-text font-semibold text-base">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-vault-subtle hover:text-vault-text transition-colors focus-ring rounded-lg"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    )}
    {children}
  </div>
  )
}