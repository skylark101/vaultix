import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/useAuth'
import { fmtCurrency, fmtDate } from '../lib/format'
import {
  allocationSegments,
  interestRateOverview,
  investmentTenure,
  portfolioInsights,
} from '../lib/dashboardMetrics'
import { AllocationDonut } from '../components/dashboard/AllocationDonut'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '../components/ui'
import { cn } from '../lib/cn'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
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
      aria-hidden
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function MetricTile({ label, value, hint, mono }) {
  return (
    <div className="rounded-lg border border-vault-border bg-vault-inset/25 px-3 py-3 sm:px-4 sm:py-3.5">
      <p className="text-[10px] sm:text-xs text-vault-subtle font-medium uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          'text-base sm:text-lg font-semibold text-vault-text mt-1 truncate',
          mono && 'font-mono tabular-nums'
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="text-xs text-vault-subtle mt-0.5 leading-snug">{hint}</p>
      )}
    </div>
  )
}

const TENURE_BAR_CLASS = [
  'bg-vault-accent',
  'bg-vault-link',
  'bg-vault-secondary',
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/assets/dashboard')
      .then((r) => setStats(r.data))
      .catch(() => setError('Could not load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const assets = useMemo(() => stats?.assets ?? [], [stats?.assets])
  const byType = useMemo(() => stats?.byType ?? {}, [stats?.byType])
  const totalInvested = stats?.totalInvested ?? 0
  const assetCount = stats?.totalAssets ?? 0
  const isEmpty = assetCount === 0

  const segments = useMemo(
    () => allocationSegments(byType, totalInvested),
    [byType, totalInvested]
  )
  const insights = useMemo(
    () => portfolioInsights(assets, byType, totalInvested),
    [assets, byType, totalInvested]
  )
  const tenure = useMemo(() => investmentTenure(assets), [assets])
  const rates = useMemo(() => interestRateOverview(assets), [assets])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-vault-text">
            Good {getGreeting()}, {user?.name || 'there'}
          </h1>
          <p className="text-vault-subtle text-sm mt-1">
            Personal asset overview — totals reflect invested amounts, not market
            value.
          </p>
        </div>
        <Button to="/app/assets" size="md" className="shrink-0 w-full sm:w-auto">
          Manage assets
        </Button>
      </header>

      {error && (
        <Alert variant="error" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}

      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6">
          <p className="text-xs text-vault-subtle font-medium uppercase tracking-wider mb-2">
            Total invested
          </p>
          <p className="text-display-sm sm:text-display font-mono tabular-nums text-vault-text">
            {fmtCurrency(totalInvested)}
          </p>
          <p className="text-xs sm:text-sm text-vault-subtle mt-2 max-w-xl">
            Sum of recorded amounts including recurring cycles counted on each
            asset. This is not net worth or live market value.
          </p>

          {!isEmpty && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-5">
              <MetricTile
                label="Assets"
                value={assetCount}
                hint="Registered entries"
                mono
              />
              <MetricTile
                label="Categories"
                value={insights.categoryCount}
                hint="Distinct types"
                mono
              />
              <MetricTile
                label="Top category"
                value={insights.topCategory}
                hint={`${insights.topCategoryPct.toFixed(1)}% of invested`}
              />
              {insights.hasMonthlyRecurring ? (
                <MetricTile
                  label="Monthly recurring"
                  value={fmtCurrency(insights.monthlyRecurringSum)}
                  hint="Sum of monthly-frequency assets only"
                  mono
                />
              ) : (
                <MetricTile
                  label="Recurring assets"
                  value={insights.recurringCount}
                  hint={
                    insights.recurringCount
                      ? 'Configured on asset records'
                      : 'None configured'
                  }
                  mono
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={<LayersIcon />}
          title="No assets yet"
          description="Add your first asset to see allocation and insights."
          actionLabel="Add asset"
          actionTo="/app/assets"
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Allocation</CardTitle>
                <p className="text-xs text-vault-subtle mt-1">
                  Tap a category to filter assets.
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                {segments.length > 0 ? (
                  <AllocationDonut
                    segments={segments}
                    totalInvested={totalInvested}
                  />
                ) : (
                  <p className="text-sm text-vault-subtle">No allocation data.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Portfolio insights</CardTitle>
                <p className="text-xs text-vault-subtle mt-1">
                  Derived from your current asset records.
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-vault-subtle">Largest category</dt>
                    <dd className="text-vault-text text-right font-medium">
                      {insights.topCategory}{' '}
                      <span className="text-vault-subtle font-normal">
                        ({insights.topCategoryPct.toFixed(1)}%)
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-vault-subtle">Highest-value asset</dt>
                    <dd className="text-right min-w-0">
                      {insights.highestAsset ? (
                        <Link
                          to={`/app/assets?assetId=${insights.highestAsset.id}`}
                          className="text-vault-link hover:text-vault-text focus-ring rounded truncate block"
                        >
                          {insights.highestAsset.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                      {insights.highestAsset && (
                        <span className="block font-mono tabular-nums text-xs text-vault-secondary mt-0.5">
                          {fmtCurrency(insights.highestValue)}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-vault-subtle">Top 3 holdings share</dt>
                    <dd className="text-vault-text text-right">
                      <span className="font-mono tabular-nums">
                        {insights.top3HoldingsPct.toFixed(1)}%
                      </span>
                      <span className="block text-xs text-vault-subtle font-normal mt-0.5">
                        Of total invested
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-vault-subtle">Recurring assets</dt>
                    <dd className="text-vault-text font-mono tabular-nums">
                      {insights.recurringCount}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="min-w-0">
              <CardHeader className="pb-0">
                <CardTitle>Investment tenure</CardTitle>
                <p className="text-xs text-vault-subtle mt-1">
                  Age of recorded start dates — not investment returns.
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {tenure.totalWithDates === 0 ? (
                  <p className="text-sm text-vault-subtle">
                    No valid start dates on your assets. Add a start date when
                    editing an asset.
                  </p>
                ) : (
                  <>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-vault-subtle text-xs uppercase tracking-wider">
                          Average holding period
                        </dt>
                        <dd className="text-vault-text font-medium mt-1">
                          {tenure.averageLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-vault-subtle text-xs uppercase tracking-wider">
                          Oldest investment
                        </dt>
                        <dd className="mt-1 min-w-0">
                          {tenure.oldestAsset ? (
                            <>
                              <Link
                                to={`/app/assets?assetId=${tenure.oldestAsset.id}`}
                                className="text-vault-link hover:text-vault-text focus-ring rounded truncate block text-sm font-medium"
                              >
                                {tenure.oldestAsset.name}
                              </Link>
                              <span className="text-xs text-vault-subtle block mt-0.5">
                                Since {fmtDate(tenure.oldestStartDate)}
                              </span>
                            </>
                          ) : (
                            '—'
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div>
                      <p className="text-xs text-vault-subtle mb-2">
                        Assets by holding period ({tenure.totalWithDates} with
                        start dates
                        {tenure.missingStartDate > 0
                          ? `, ${tenure.missingStartDate} without`
                          : ''}
                        )
                      </p>
                      <div
                        className="flex h-2.5 rounded-full overflow-hidden bg-vault-muted gap-px"
                        role="img"
                        aria-label="Holding period distribution"
                      >
                        {tenure.buckets.map((b, i) =>
                          b.count > 0 ? (
                            <div
                              key={b.key}
                              className={cn(
                                'h-full min-w-[4px]',
                                TENURE_BAR_CLASS[i % TENURE_BAR_CLASS.length]
                              )}
                              style={{ flexGrow: b.count }}
                              title={`${b.label}: ${b.count}`}
                            />
                          ) : null
                        )}
                      </div>
                      <ul className="mt-3 space-y-2.5">
                        {tenure.buckets.map((b, i) => (
                          <li
                            key={b.key}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  'w-2 h-2 rounded-full shrink-0',
                                  TENURE_BAR_CLASS[i % TENURE_BAR_CLASS.length]
                                )}
                                aria-hidden
                              />
                              <span className="text-vault-subtle truncate">
                                {b.label}
                              </span>
                            </span>
                            <span className="font-mono tabular-nums text-vault-text shrink-0">
                              {b.count}{' '}
                              <span className="text-vault-subtle text-xs">
                                ({b.pct.toFixed(0)}%)
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-0">
                <CardTitle>Interest rate overview</CardTitle>
                <p className="text-xs text-vault-subtle mt-1">
                  Optional annual % you entered — not realized returns.
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-vault-subtle text-xs uppercase tracking-wider">
                      Recorded rates
                    </dt>
                    <dd className="text-vault-text font-mono tabular-nums font-medium mt-1">
                      {rates.recordedCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-vault-subtle text-xs uppercase tracking-wider">
                      No rate recorded
                    </dt>
                    <dd className="text-vault-text font-mono tabular-nums font-medium mt-1">
                      {rates.withoutRateCount}
                    </dd>
                  </div>
                </dl>

                {rates.highest && (
                  <div className="rounded-lg border border-vault-border bg-vault-inset/25 px-3 py-2.5">
                    <p className="text-xs text-vault-subtle uppercase tracking-wider">
                      Highest recorded rate
                    </p>
                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <Link
                        to={`/app/assets?assetId=${rates.highest.id}`}
                        className="text-sm font-medium text-vault-link hover:text-vault-text focus-ring rounded truncate"
                      >
                        {rates.highest.name}
                      </Link>
                      <span className="font-mono tabular-nums text-vault-text shrink-0">
                        {rates.highest.rate}%
                      </span>
                    </div>
                    <p className="text-[11px] text-vault-subtle mt-1">
                      {rates.highest.type} — rates are not comparable across all
                      asset types.
                    </p>
                  </div>
                )}

                {!rates.hasRates ? (
                  <p className="text-sm text-vault-subtle">
                    No interest rates saved. Enable &ldquo;Has interest rate&rdquo;
                    when editing an asset.
                  </p>
                ) : (
                  <div>
                    <p className="text-xs text-vault-subtle mb-2">
                      Recorded rates by category
                    </p>
                    <ul className="space-y-3">
                      {rates.byType.map((group) => (
                        <li key={group.type}>
                          <p className="text-xs font-medium text-vault-secondary mb-1">
                            {group.type}{' '}
                            <span className="text-vault-subtle font-normal">
                              ({group.count})
                            </span>
                          </p>
                          <ul className="divide-y divide-vault-border border border-vault-border rounded-lg overflow-hidden">
                            {group.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between gap-2 px-3 py-2 bg-vault-inset/20 text-sm"
                              >
                                <Link
                                  to={`/app/assets?assetId=${item.id}`}
                                  className="text-vault-text hover:text-vault-link truncate focus-ring rounded min-w-0"
                                >
                                  {item.name}
                                </Link>
                                <span className="font-mono tabular-nums text-vault-secondary shrink-0 text-xs">
                                  {item.rate}%
                                </span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}