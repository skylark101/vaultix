import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
      <p className="text-xs text-vault-subtle font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold text-vault-text">{value}</p>
      {sub && <p className="text-sm text-vault-subtle mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/assets/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 text-vault-subtle text-sm">Loading...</div>
  )

  return (
    <div className="p-8 fade-in">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-vault-text">
          Good {getGreeting()}, {user?.name || 'there'} 👋
        </h1>
        <p className="text-vault-subtle text-sm mt-1">Here's your portfolio at a glance</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Invested" value={fmt(stats?.totalInvested || 0)} />
        <StatCard label="Total Assets" value={stats?.totalAssets || 0} sub="across all categories" />
        <StatCard
          label="Top Category"
          value={getTopType(stats?.byType)}
          sub={stats?.byType ? fmt(getTopAmount(stats.byType)) : '—'}
        />
      </div>

      {/* By Type Breakdown */}
      {stats?.byType && Object.keys(stats.byType).length > 0 && (
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-medium text-vault-text mb-4">Allocation by Type</h2>
          <div className="space-y-3">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => {
              const pct = stats.totalInvested > 0 ? (amount / stats.totalInvested) * 100 : 0
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-vault-text">{type}</span>
                    <span className="text-vault-subtle font-mono">{fmt(amount)} <span className="text-vault-muted">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-vault-muted rounded-full overflow-hidden">
                    <div className="h-full bg-vault-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Assets */}
      <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-vault-text mb-4">Recently Added</h2>
        {stats?.recentAssets?.length === 0 ? (
          <p className="text-vault-subtle text-sm">No assets yet. Add your first asset!</p>
        ) : (
          <div className="divide-y divide-vault-border">
            {stats?.recentAssets?.map(a => (
              <div key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-vault-text font-medium">{a.name}</p>
                  <span className="text-xs text-vault-subtle mt-0.5 inline-block">{a.type}</span>
                </div>
                <span className="text-sm font-mono text-vault-text">{fmt(a.amountInvested)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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