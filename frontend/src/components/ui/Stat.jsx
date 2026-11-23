import { Card } from './Card'
import { cn } from '../../lib/cn'

export function Stat({ label, value, hint, mono = false, className }) {
  return (
    <Card className={cn('p-4 sm:p-5', className)}>
      <p className="text-xs text-vault-subtle font-medium uppercase tracking-wider mb-2">
        {label}
      </p>
      <p
        className={cn(
          'text-xl sm:text-2xl font-semibold text-vault-text break-all',
          mono && 'font-mono tabular-nums'
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="text-xs sm:text-sm text-vault-subtle mt-1">{hint}</p>
      )}
    </Card>
  )
}