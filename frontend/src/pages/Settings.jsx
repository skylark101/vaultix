import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-8 fade-in max-w-2xl">
      <h1 className="text-xl font-semibold text-vault-text mb-6">Settings</h1>

      {/* Account Info */}
      <div className="bg-vault-surface border border-vault-border rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-vault-text mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-vault-border">
            <span className="text-sm text-vault-subtle">Name</span>
            <span className="text-sm text-vault-text">{user?.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-vault-border">
            <span className="text-sm text-vault-subtle">Email</span>
            <span className="text-sm text-vault-text font-mono">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-vault-subtle">Member since</span>
            <span className="text-sm text-vault-text">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-vault-surface border border-vault-border rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-vault-text mb-4">About</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-vault-border">
            <span className="text-sm text-vault-subtle">App</span>
            <span className="text-sm text-vault-text">Vaultix</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-vault-subtle">Version</span>
            <span className="text-sm text-vault-text font-mono">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-vault-surface border border-red-400/20 rounded-xl p-5">
        <h2 className="text-sm font-medium text-red-400 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-vault-text font-medium">Sign out</p>
            <p className="text-xs text-vault-subtle mt-0.5">You'll need to sign in again to access Vaultix</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-red-400/30 text-red-400 text-sm hover:bg-red-400/10 transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}