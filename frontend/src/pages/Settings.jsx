import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">
      <h1 className="text-lg sm:text-xl font-semibold text-vault-text mb-5 sm:mb-6">Settings</h1>

      <div className="max-w-lg space-y-4">
        {/* Account */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-vault-text mb-4">Account</h2>
          <div className="space-y-1 divide-y divide-vault-border">
            <Row label="Name" value={user?.name || '—'} />
            <Row label="Email" value={user?.email} mono />
            <Row
              label="Member since"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            />
          </div>
        </div>

        {/* About */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-vault-text mb-4">About</h2>
          <div className="space-y-1 divide-y divide-vault-border">
            <Row label="App" value="Vaultix" />
            <Row label="Version" value="1.0.0" mono />
          </div>
        </div>

        {/* Danger */}
        <div className="bg-vault-surface border border-red-400/20 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-red-400 mb-4">Danger Zone</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-vault-text font-medium">Sign out</p>
              <p className="text-xs text-vault-subtle mt-0.5">
                You'll need to sign in again to access Vaultix
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-red-400/30 text-red-400 text-sm hover:bg-red-400/10 transition-all flex-shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <span className="text-sm text-vault-subtle flex-shrink-0">{label}</span>
      <span className={`text-sm text-vault-text text-right truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}