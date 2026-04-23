import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm fade-in">

        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-vault-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <span className="text-vault-text font-semibold text-xl">Vaultix</span>
        </Link>

        <div className="bg-vault-surface border border-vault-border rounded-xl p-6 sm:p-7">

          {!submitted ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-vault-accent/10 border border-vault-accent/20 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-vault-accent" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <h1 className="text-vault-text font-semibold text-lg mb-1">Forgot password?</h1>
              <p className="text-vault-subtle text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-emerald-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="text-vault-text font-semibold text-lg mb-1">Check your email</h2>
              <p className="text-vault-subtle text-sm mb-5 leading-relaxed">
                If <span className="text-vault-text font-medium">{email}</span> has a Vaultix
                account, you'll receive a reset link shortly. Check your spam folder if
                it doesn't arrive.
              </p>

              <p className="text-xs text-vault-subtle">
                Didn't get it?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-vault-accent hover:underline"
                >
                  Try again
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-vault-subtle text-sm mt-4">
          Remember it?{' '}
          <Link to="/login" className="text-vault-accent hover:text-vault-text transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}