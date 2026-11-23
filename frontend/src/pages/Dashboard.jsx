import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/useAuth'
import { fmtCurrency } from '../lib/format'
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  Stat,
} from '../components/ui'

const ALLOCATION_BAR = [
  'bg-vault-cat-1',
  'bg-vault-cat-2',
  'bg-vault-cat-3',
  'bg-vault-cat-4',
  'bg-vault-cat-5',
  'bg-vault-cat-6',
  'bg-vault-cat-7',
  'bg-vault-cat-8',
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getTopType(byType) {
  if (!byType || Object.keys(byType).length === 0) return '—'
  return Object.entries(byType).sort((a, b) => b[1] - a[1])[0][0]
}

function getTopAmount(byType) {
  if (!byType || Object.keys(byType).length === 0) return 0
  return Object.entries(byType).sort((a, b) => b[1] - a[1])[0][1]
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Card className="p-5 sm:p-6">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-10 w-48 sm:w-64" />
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Card className="p-5 space-y-4">
        <Skeleton className="h-4 w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </Card>
      <Card className="p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  )
}

function LayersIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/assets/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  const totalInvested = stats?.totalInvested ?? 0
  const assetCount = stats?.totalAssets ?? 0
  const isEmpty = assetCount === 0
  const byType = stats?.byType ?? {}
  const hasAllocation = Object.keys(byType).length > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in max-w-5xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-vault-text">
          Good {getGreeting()}, {user?.name || 'there'}
        </h1>
        <p className="text-vault-subtle text-sm mt-1">
          Total invested across your assets
        </p>
      </header>

      {/* Primary metric */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6">
          <p className="text-xs text-vault-subtle font-medium uppercase tracking-wider mb-2">
            Total invested
          </p>
          <p className="text-display-sm sm:text-display font-mono tabular-nums text-vault-text">
            {fmtCurrency(totalInvested)}
          </p>
          <p className="text-sm text-vault-subtle mt-2">
            Includes recurring amounts calculated from your asset settings
          </p>
        </CardContent>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={<LayersIcon />}
          title="No assets yet"
          description="Add your first asset to see allocation and recent activity here."
          actionLabel="Add asset"
          actionTo="/app/assets"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Stat
              label="Asset count"
              value={assetCount}
              hint="Entries in your portfolio"
              mono
            />
            <Stat
              label="Largest category"
              value={getTopType(byType)}
              hint={
                hasAllocation
                  ? `${fmtCurrency(getTopAmount(byType))} invested`
                  : '—'
              }
            />
          </div>

          {hasAllocation && (
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-0">
                <CardTitle>Allocation by type</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {Object.entries(byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, amount], index) => {
                    const pct =
                      totalInvested > 0 ? (amount / totalInvested) * 100 : 0
                    const barColor =
                      ALLOCATION_BAR[index % ALLOCATION_BAR.length]
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1.5 gap-2">
                          <span className="text-vault-text truncate">{type}</span>
                          <span className="text-vault-secondary font-mono text-xs sm:text-sm whitespace-nowrap flex-shrink-0 tabular-nums">
                            {fmtCurrency(amount)}{' '}
                            <span className="text-vault-subtle">
                              ({pct.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div
                          className="h-1.5 bg-vault-muted rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={Math.round(pct)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${type} allocation`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-0">
              <CardTitle>Recently added</CardTitle>
              <Link
                to="/app/assets"
                className="text-xs text-vault-link hover:text-vault-text transition-colors focus-ring rounded px-1 py-0.5"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {stats?.recentAssets?.length === 0 ? (
                <p className="text-vault-subtle text-sm">No recent assets.</p>
              ) : (
                <ul className="divide-y divide-vault-border">
                  {stats?.recentAssets?.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between py-3 gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-vault-text font-medium truncate">
                          {a.name}
                        </p>
                        <Badge className="mt-1.5">{a.type}</Badge>
                      </div>
                      <span className="text-sm font-mono tabular-nums text-vault-text flex-shrink-0">
                        {fmtCurrency(a.amountInvested)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}