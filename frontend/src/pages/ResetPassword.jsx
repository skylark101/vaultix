import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const hasToken = !!token

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })
      setSuccess(true)
      // Auto-redirect to login after 3s
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm fade-in">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-vault-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <span className="text-vault-text font-semibold text-xl">Vaultix</span>
        </Link>

        <div className="bg-vault-surface border border-vault-border rounded-xl p-6 sm:p-7">

          {/* Invalid token — no token in URL */}
          {!hasToken && (
            <>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-red-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="text-vault-text font-semibold text-lg mb-1">Invalid link</h1>
              <p className="text-vault-subtle text-sm mb-5">
                This reset link is missing or invalid. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="block w-full text-center py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all"
              >
                Request new link
              </Link>
            </>
          )}

          {/* Success state */}
          {hasToken && success && (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-emerald-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-vault-text font-semibold text-lg mb-1">Password updated!</h2>
              <p className="text-vault-subtle text-sm mb-5">
                Your password has been changed. Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all"
              >
                Go to sign in
              </Link>
            </>
          )}

          {/* Reset form */}
          {hasToken && !success && (
            <>
              <div className="w-10 h-10 rounded-xl bg-vault-accent/10 border border-vault-accent/20 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-vault-accent" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>

              <h1 className="text-vault-text font-semibold text-lg mb-1">Set new password</h1>
              <p className="text-vault-subtle text-sm mb-6">
                Must be at least 6 characters.
              </p>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password" required minLength={6}
                    value={form.newPassword} onChange={e => set('newPassword', e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password" required minLength={6}
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        {hasToken && !success && (
          <p className="text-center text-vault-subtle text-sm mt-4">
            Back to{' '}
            <Link to="/login" className="text-vault-accent hover:text-vault-text transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}