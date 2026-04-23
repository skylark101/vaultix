import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

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

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 pr-10 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-subtle hover:text-vault-text transition-colors"
          tabIndex={-1}
        >
          {show ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Change password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const setPw = (k, v) => {
    setPwForm(f => ({ ...f, [k]: v }))
    setPwError('')
    setPwSuccess(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)

    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwError('New password must be different from current password')
      return
    }

    setPwLoading(true)
    try {
      await api.put('/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      })
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">
      <h1 className="text-lg sm:text-xl font-semibold text-vault-text mb-5 sm:mb-6">Settings</h1>

      <div className="max-w-lg space-y-4">

        {/* Account info */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-vault-text mb-4">Account</h2>
          <div className="divide-y divide-vault-border">
            <Row label="Name" value={user?.name || '—'} />
            <Row label="Email" value={user?.email} mono />
            <Row
              label="Member since"
              value={user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
            />
          </div>
        </div>

        {/* Change password */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-vault-text mb-1">Change Password</h2>
          <p className="text-xs text-vault-subtle mb-5">Update your password. You'll stay logged in after saving.</p>

          {pwError && (
            <div className="flex items-start gap-2.5 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5 mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="text-red-400 flex-shrink-0 mt-0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-red-400 text-sm">{pwError}</p>
            </div>
          )}

          {pwSuccess && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="text-emerald-400 flex-shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-emerald-400 text-sm">Password updated successfully.</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={pwForm.currentPassword}
              onChange={v => setPw('currentPassword', v)}
              placeholder="Your current password"
            />
            <PasswordField
              label="New Password"
              value={pwForm.newPassword}
              onChange={v => setPw('newPassword', v)}
              placeholder="Min 6 characters"
            />
            <PasswordField
              label="Confirm New Password"
              value={pwForm.confirmPassword}
              onChange={v => setPw('confirmPassword', v)}
              placeholder="Repeat new password"
            />
            <div className="pt-1">
              <button
                type="submit" disabled={pwLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {pwLoading ? 'Saving...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        {/* About */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-medium text-vault-text mb-4">About</h2>
          <div className="divide-y divide-vault-border">
            <Row label="App" value="Vaultix" />
            <Row label="Version" value="1.0.0" mono />
          </div>
        </div>

        {/* Danger zone */}
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