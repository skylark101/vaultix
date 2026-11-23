import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import api from '../api/client'
import { fmtDate } from '../lib/format'
import { Alert, Button, Card, CardTitle, PasswordInput } from '../components/ui'

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <span className="text-sm text-vault-subtle flex-shrink-0">{label}</span>
      <span
        className={`text-sm text-vault-text text-right truncate ${
          mono ? 'font-mono tabular-nums' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const setPw = (k, v) => {
    setPwForm((f) => ({ ...f, [k]: v }))
    setPwError('')
    setPwSuccess(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwLoading) return
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in max-w-lg">
      <h1 className="text-lg sm:text-xl font-semibold text-vault-text mb-5 sm:mb-6">
        Settings
      </h1>

      <div className="space-y-4">
        <Card className="p-4 sm:p-5">
          <CardTitle className="mb-4 block">Account</CardTitle>
          <div className="divide-y divide-vault-border">
            <Row label="Name" value={user?.name || '—'} />
            <Row label="Email" value={user?.email} mono />
            <Row
              label="Member since"
              value={
                user?.createdAt
                  ? fmtDate(user.createdAt)
                  : '—'
              }
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardTitle className="mb-1 block">Change password</CardTitle>
          <p className="text-xs text-vault-subtle mb-5">
            Update your password. You&apos;ll stay logged in after saving.
          </p>

          {pwError && (
            <Alert variant="error" className="mb-4">
              <p>{pwError}</p>
            </Alert>
          )}

          {pwSuccess && (
            <Alert variant="success" className="mb-4">
              <p>Password updated successfully.</p>
            </Alert>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput
              id="settings-current-pw"
              label="Current password"
              required
              autoComplete="current-password"
              value={pwForm.currentPassword}
              onChange={(v) => setPw('currentPassword', v)}
              placeholder="Your current password"
            />
            <PasswordInput
              id="settings-new-pw"
              label="New password"
              required
              minLength={6}
              autoComplete="new-password"
              value={pwForm.newPassword}
              onChange={(v) => setPw('newPassword', v)}
              placeholder="Min 6 characters"
            />
            <PasswordInput
              id="settings-confirm-pw"
              label="Confirm new password"
              required
              minLength={6}
              autoComplete="new-password"
              value={pwForm.confirmPassword}
              onChange={(v) => setPw('confirmPassword', v)}
              placeholder="Repeat new password"
            />
            <Button type="submit" disabled={pwLoading} className="w-full sm:w-auto">
              {pwLoading ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardTitle className="mb-4 block">About</CardTitle>
          <div className="divide-y divide-vault-border">
            <Row label="App" value="Vaultix" />
            <Row label="Version" value="1.0.0" mono />
          </div>
        </Card>
      </div>
    </div>
  )
}