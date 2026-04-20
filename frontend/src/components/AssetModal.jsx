import { useState, useEffect } from 'react'
import api from '../api/client'

const COMMON_TYPES = ['FD', 'Insurance', 'Real Estate', 'Stocks', 'Mutual Fund', 'Gold', 'Crypto', 'PPF', 'NPS', 'Other']

export default function AssetModal({ asset, onClose, onSaved }) {
  const isEdit = !!asset
  const [form, setForm] = useState({
    name: '', type: '', amountInvested: '', startDate: '', notes: '', documentUrl: '', customFields: '{}'
  })
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
        notes: asset.notes || '',
        documentUrl: asset.documentUrl || '',
        customFields: JSON.stringify(asset.customFields || {}, null, 2),
      })
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
      const payload = { ...form, amountInvested: parseFloat(form.amountInvested), customFields: parsedCF }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-vault-surface border border-vault-border rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <h2 className="text-vault-text font-semibold">{isEdit ? 'Edit Asset' : 'Add Asset'}</h2>
          <button onClick={onClose} className="text-vault-subtle hover:text-vault-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Asset Name *</label>
              <input
                required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. SBI Fixed Deposit"
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>

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
              <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Amount Invested (₹) *</label>
              <input
                required type="number" min="0" step="any" value={form.amountInvested} onChange={e => set('amountInvested', e.target.value)}
                placeholder="100000"
                className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
              />
            </div>

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

          <div>
            <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">Notes</label>
            <textarea
              rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Any relevant notes..."
              className="w-full bg-vault-muted border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-vault-subtle mb-1.5 font-medium uppercase tracking-wider">
              Custom Fields <span className="normal-case">(JSON)</span>
            </label>
            <textarea
              rows={4} value={form.customFields} onChange={e => set('customFields', e.target.value)}
              placeholder={'{\n  "maturityDate": "2026-01-01",\n  "interestRate": "7.5%"\n}'}
              className={`w-full bg-vault-muted border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle font-mono focus:border-vault-accent/60 transition-colors resize-none ${customFieldsError ? 'border-red-400/60' : 'border-vault-border'}`}
            />
            {customFieldsError && <p className="text-red-400 text-xs mt-1">{customFieldsError}</p>}
          </div>

          <div className="flex gap-3 pt-1">
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