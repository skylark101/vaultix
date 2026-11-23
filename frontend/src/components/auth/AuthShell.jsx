import { Link } from 'react-router-dom'
import { Card } from '../ui'

export function AuthLogo() {
  return (
    <Link
      to="/"
      className="flex items-center justify-center gap-2.5 mb-8 focus-ring rounded-lg"
    >
      <div className="w-8 h-8 rounded-lg bg-vault-accent flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>
      <span className="text-vault-text font-semibold text-xl">Vaultix</span>
    </Link>
  )
}

export function AuthShell({ children, footer }) {
  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm fade-in">
        <AuthLogo />
        <Card className="p-6 sm:p-7">{children}</Card>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  )
}

export function AuthFooterLink({ children }) {
  return (
    <p className="text-center text-vault-subtle text-sm">{children}</p>
  )
}