import { cn } from '../../lib/cn'
import { Button } from './Button'
import { Card } from './Card'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className,
}) {
  return (
    <Card
      className={cn('p-10 sm:p-12 text-center', className)}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-vault-muted flex items-center justify-center mx-auto mb-4 text-vault-subtle">
          {icon}
        </div>
      )}
      <p className="text-vault-text font-medium mb-1">{title}</p>
      {description && (
        <p className="text-vault-subtle text-sm max-w-sm mx-auto">{description}</p>
      )}
      {(actionTo || onAction) && actionLabel && (
        <div className="mt-6">
          {actionTo ? (
            <Button to={actionTo} size="md">
              {actionLabel}
            </Button>
          ) : (
            <Button type="button" onClick={onAction} size="md">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}