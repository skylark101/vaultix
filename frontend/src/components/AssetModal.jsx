import { useState, useEffect } from 'react'
import api from '../api/client'

const COMMON_TYPES = ['FD', 'Insurance', 'Real Estate', 'Stocks', 'Mutual Fund', 'Gold', 'Crypto', 'PPF', 'NPS', 'Other']

export default function AssetModal({ asset, onClose, onSaved }) {
  const isEdit = !!asset
  const [form, setForm] = useState({
    name: '', type: '', amountInvested: '', startDate: '',
    maturityDate: '', interestRate: '',
    notes: '', documentUrl: '', customFields: '{}'
  })
  const [hasMaturity, setHasMaturity] = useState(false)
  const [hasRate, setHasRate] = useState(false)
  const [customFieldsError, setCustomFieldsError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name || '',
        type: asset.type || '',
        amountInvested: asset.amountInvested ?? '',
        startDate: asset.startDate ? asset.startDate.slice(0, 10) : '',
        maturityDate: asset.maturityDate ? asset.maturityDate.slice(0, 10) : '',
        interestRate: asset.interestRate ?? '',
        notes: asset.notes || '',
        documentUrl: asset.documentUrl || '',
        customFields: JSON.stringify(asset.customFields || {}, null, 2),
      })
      setHasMaturity(!!asset.maturityDate)
      setHasRate(asset.interestRate != null)
    }
  }, [asset])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    let parsedCF = {}
    try {
      parsedCF = JSON.parse(form.customFields || '{}')
    } catch {
      setCustomFieldsError('Invalid JSON in custom fields')
      return
    }
    setCustomFieldsError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        amountInvested: parseFloat(form.amountInvested),
        maturityDate: hasMaturity && form.maturityDate ? form.maturityDate : null,
        interestRate: hasRate && form.interestRate !== '' ? parseFloat(form.interestRate) : null,
        customFields: parsedCF,
      }
      if (isEdit) {
        await api.put(`/assets/${asset.id}`, payload)
      } else {
        await api.post('/assets', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-vault-surface border border-vault-border w-full sm:max-w-lg sm:mx-4 sm:rounded-xl rounded-t-2xl max-h-[92vh] overflow-y-auto fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-vault-border sticky top-0 bg-vault-surface z-10">
          <h2 className="text-vault-text font-semibold">{isEdit ? 'Edit Asset' : 'Add Asset'}</h2>
          <button onClick={onClose} className="text-vault-subtle hover:text-vault-text transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
              Asset Name *
            </label>
            <input
              required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. SBI Fixed Deposit"
              className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
            />
          </div>

          {/* Type + Amount — 2 col on sm+, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Type *</label>
              <input
                required list="type-list" value={form.type} onChange={e => set('type', e.target.value)}
                placeholder="FD, Gold, etc."
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
              <datalist id="type-list">
                {COMMON_TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Amount (₹) *</label>
              <input
                required type="number" min="0" step="any"
                value={form.amountInvested} onChange={e => set('amountInvested', e.target.value)}
                placeholder="100000"
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>
          </div>

          {/* Start Date + Doc URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Start Date</label>
              <input
                type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Document URL</label>
              <input
                type="url" value={form.documentUrl} onChange={e => set('documentUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>
          </div>

          {/* Maturity date — checkbox gated */}
          <div className="bg-vault-muted/40 border border-vault-border rounded-lg p-3.5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox" checked={hasMaturity}
                onChange={e => { setHasMaturity(e.target.checked); if (!e.target.checked) set('maturityDate', '') }}
                className="w-4 h-4 rounded border-vault-border bg-vault-muted accent-vault-accent cursor-pointer"
              />
              <span className="text-sm text-vault-text font-medium">Has Maturity Date</span>
            </label>
            {hasMaturity && (
              <input
                type="date" value={form.maturityDate} onChange={e => set('maturityDate', e.target.value)}
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors [color-scheme:dark]"
              />
            )}
          </div>

          {/* Interest rate — checkbox gated */}
          <div className="bg-vault-muted/40 border border-vault-border rounded-lg p-3.5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox" checked={hasRate}
                onChange={e => { setHasRate(e.target.checked); if (!e.target.checked) set('interestRate', '') }}
                className="w-4 h-4 rounded border-vault-border bg-vault-muted accent-vault-accent cursor-pointer"
              />
              <span className="text-sm text-vault-text font-medium">Has Interest Rate</span>
            </label>
            {hasRate && (
              <div className="relative">
                <input
                  type="number" min="0" max="100" step="0.01"
                  value={form.interestRate} onChange={e => set('interestRate', e.target.value)}
                  placeholder="7.50"
                  className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 pr-10 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vault-subtle font-medium">%</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Notes</label>
            <textarea
              rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Any relevant notes..."
              className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors resize-none"
            />
          </div>

          {/* Custom Fields */}
          <div>
            <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
              Custom Fields <span className="normal-case">(JSON)</span>
            </label>
            <textarea
              rows={3} value={form.customFields} onChange={e => set('customFields', e.target.value)}
              placeholder={'{\n  "nominee": "Priya Sharma"\n}'}
              className={`w-full bg-vault-muted border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle font-mono focus:border-vault-accent/60 transition-colors resize-none ${
                customFieldsError ? 'border-red-400/60' : 'border-vault-border'
              }`}
            />
            {customFieldsError && <p className="text-red-400 text-xs mt-1">{customFieldsError}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-vault-border text-sm text-vault-subtle hover:text-vault-text hover:bg-vault-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}