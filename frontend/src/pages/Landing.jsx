import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { fmtCurrency } from '../lib/format'
import { Badge, Button, Card, CardContent, CardHeader } from '../components/ui'

/** Static illustration only — not live or performance data. */
const PREVIEW = {
  totalInvested: 1_240_000,
  assetCount: 4,
  topCategory: 'Fixed Deposit',
  topAmount: 500_000,
  allocation: [
    { type: 'Fixed Deposit', amount: 500_000, pct: 40.3 },
    { type: 'Mutual Fund', amount: 420_000, pct: 33.9 },
    { type: 'Gold', amount: 210_000, pct: 16.9 },
    { type: 'Cash', amount: 110_000, pct: 8.9 },
  ],
  recent: [
    { name: 'SBI Fixed Deposit', type: 'FD', amount: 500_000 },
    { name: 'Index Fund SIP', type: 'Mutual Fund', amount: 120_000 },
    { name: 'Digital Gold', type: 'Gold', amount: 210_000 },
  ],
}

const ALLOCATION_BAR = [
  'bg-vault-cat-1',
  'bg-vault-cat-2',
  'bg-vault-cat-3',
  'bg-vault-cat-4',
]

const features = [
  {
    title: 'Total invested',
    desc: 'One clear number on your dashboard — the sum across your assets, including recurring contributions you configure.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Allocation by type',
    desc: 'See how your money is distributed across FDs, funds, gold, and any custom types you define.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    title: 'Asset registry',
    desc: 'Search and filter your list, edit details, attach document links, and review change history.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    title: 'Built for your portfolio',
    desc: 'Track maturity dates, interest rates, notes, and optional recurring investments — without brokerage clutter.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
]

function LogoMark({ className = 'w-7 h-7' }) {
  return (
    <div
      className={`${className} rounded-md bg-vault-accent flex items-center justify-center shrink-0`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    </div>
  )
}

function DashboardPreview() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 border-b border-vault-border bg-vault-inset/30">
        <p className="text-xs text-vault-subtle uppercase tracking-wider font-medium">
          Example dashboard
        </p>
        <p className="text-xs text-vault-subtle mt-1">
          Illustration only — your totals come from the assets you add.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <p className="text-xs text-vault-subtle font-medium uppercase tracking-wider mb-2">
            Total invested
          </p>
          <p className="text-display-sm font-mono tabular-nums text-vault-text">
            {fmtCurrency(PREVIEW.totalInvested)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-vault-border bg-vault-inset/20 p-3">
            <p className="text-xs text-vault-subtle uppercase tracking-wider mb-1">
              Asset count
            </p>
            <p className="text-lg font-semibold font-mono tabular-nums text-vault-text">
              {PREVIEW.assetCount}
            </p>
          </div>
          <div className="rounded-lg border border-vault-border bg-vault-inset/20 p-3 min-w-0">
            <p className="text-xs text-vault-subtle uppercase tracking-wider mb-1">
              Largest category
            </p>
            <p className="text-sm font-medium text-vault-text truncate">
              {PREVIEW.topCategory}
            </p>
            <p className="text-xs font-mono tabular-nums text-vault-secondary mt-0.5">
              {fmtCurrency(PREVIEW.topAmount)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-vault-text mb-3">Allocation by type</p>
          <div className="space-y-2.5">
            {PREVIEW.allocation.map((row, i) => (
              <div key={row.type}>
                <div className="flex justify-between text-sm mb-1 gap-2">
                  <span className="text-vault-text truncate">{row.type}</span>
                  <span className="text-vault-secondary font-mono text-xs tabular-nums shrink-0">
                    {fmtCurrency(row.amount)}{' '}
                    <span className="text-vault-subtle">({row.pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-vault-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ALLOCATION_BAR[i % ALLOCATION_BAR.length]}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex flex-col">
      <header className="border-b border-vault-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded-lg">
            <LogoMark />
            <span className="font-semibold tracking-wide">Vaultix</span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Button to="/app/dashboard" size="sm">
                Dashboard
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button to="/signup" size="sm">
                  Get started
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="text-center lg:text-left">
              <p className="text-xs font-medium text-vault-secondary uppercase tracking-wider mb-4">
                Personal asset tracker
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-tight tracking-tight text-vault-text">
                Know what you own.
                <span className="block text-vault-secondary mt-1 sm:mt-2">
                  One quiet place for your assets.
                </span>
              </h1>
              <p className="mt-5 text-sm sm:text-base text-vault-subtle leading-relaxed max-w-md mx-auto lg:mx-0">
                Vaultix helps you record investments, fixed deposits, gold, and
                other holdings — with a clear total, simple allocation view, and
                a searchable registry. No market noise, no fake performance stats.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user ? (
                  <Button to="/app/dashboard" size="lg">
                    Open dashboard
                  </Button>
                ) : (
                  <>
                    <Button to="/signup" size="lg">
                      Create free account
                    </Button>
                    <Button to="/login" variant="secondary" size="lg">
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full max-w-lg mx-auto lg:max-w-none lg:ml-auto">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section className="border-t border-vault-border bg-vault-surface/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-lg sm:text-xl font-semibold text-vault-text mb-2 text-center">
              What you can do in Vaultix
            </h2>
            <p className="text-sm text-vault-subtle text-center max-w-lg mx-auto mb-10">
              The same views you get after signing in — designed for clarity, not
              trading.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => (
                <Card key={f.title} className="p-5">
                  <div className="w-9 h-9 rounded-lg border border-vault-border bg-vault-inset/50 flex items-center justify-center text-vault-link mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-medium text-vault-text mb-2">{f.title}</h3>
                  <p className="text-xs text-vault-subtle leading-relaxed">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Card className="p-8 sm:p-10 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-vault-text">
              Start with your first asset
            </h2>
            <p className="text-sm text-vault-subtle mt-2 mb-6">
              Free to use. Your data stays in your account.
            </p>
            {user ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button to="/app/assets" size="md">
                  Go to assets
                </Button>
                <Button to="/app/dashboard" variant="secondary" size="md">
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button to="/signup" size="md">
                Create your account
              </Button>
            )}
          </Card>
        </section>
      </main>

      <footer className="border-t border-vault-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-vault-subtle">
          <span>© {new Date().getFullYear()} Vaultix</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-vault-text transition-colors focus-ring rounded px-1">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-vault-text transition-colors focus-ring rounded px-1">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}