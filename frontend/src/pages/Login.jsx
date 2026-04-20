import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-vault-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <span className="text-vault-text font-semibold text-xl">Vaultix</span>
        </div>

        <div className="bg-vault-surface border border-vault-border rounded-xl p-6">
          <h1 className="text-vault-text font-semibold text-lg mb-1">Welcome back</h1>
          <p className="text-vault-subtle text-sm mb-6">Sign in to your account</p>

          {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Email</label>
              <input
                type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Password</label>
              <input
                type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-vault-subtle text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-vault-accent hover:text-vault-text transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  )
}