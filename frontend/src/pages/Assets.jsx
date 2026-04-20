import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import AssetModal from '../components/AssetModal'

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-vault-muted text-vault-subtle text-xs font-medium">
      {type}
    </span>
  )
}

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | asset object
  const [deleteId, setDeleteId] = useState(null)

  const fetchAssets = useCallback(async () => {
    const params = {}
    if (search) params.search = search
    if (typeFilter) params.type = typeFilter
    const { data } = await api.get('/assets', { params })
    setAssets(data)
  }, [search, typeFilter])

  useEffect(() => {
    setLoading(true)
    fetchAssets().finally(() => setLoading(false))
  }, [fetchAssets])

  useEffect(() => {
    api.get('/assets/types').then(r => setTypes(r.data))
  }, [assets])

  const handleDelete = async (id) => {
    await api.delete(`/assets/${id}`)
    setDeleteId(null)
    fetchAssets()
  }

  const handleSaved = () => {
    setModal(null)
    fetchAssets()
    api.get('/assets/types').then(r => setTypes(r.data))
  }

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-vault-text">Assets</h1>
          <p className="text-vault-subtle text-sm mt-0.5">{assets.length} asset{assets.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-subtle" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-vault-surface border border-vault-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
          />
        </div>
        <select
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-vault-surface border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors"
        >
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || typeFilter) && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('') }}
            className="px-3 py-2.5 text-vault-subtle hover:text-vault-text text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-vault-subtle text-sm">Loading...</p>
      ) : assets.length === 0 ? (
        <div className="bg-vault-surface border border-vault-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-vault-muted flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-vault-subtle" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <p className="text-vault-text font-medium mb-1">No assets found</p>
          <p className="text-vault-subtle text-sm">
            {search || typeFilter ? 'Try adjusting your filters' : 'Add your first asset to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vault-border">
                {['Name', 'Type', 'Amount Invested', 'Start Date', 'Notes', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-vault-subtle uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-vault-muted/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-vault-text font-medium">{asset.name}</p>
                    {asset.documentUrl && (
                      <a href={asset.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-vault-accent hover:underline">View doc</a>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><TypeBadge type={asset.type} /></td>
                  <td className="px-5 py-3.5 font-mono text-sm text-vault-text">{fmt(asset.amountInvested)}</td>
                  <td className="px-5 py-3.5 text-sm text-vault-subtle">
                    {asset.startDate ? new Date(asset.startDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-vault-subtle max-w-[180px]">
                    <span className="truncate block">{asset.notes || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModal(asset)}
                        className="p-1.5 rounded-md text-vault-subtle hover:text-vault-text hover:bg-vault-muted transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteId(asset.id)}
                        className="p-1.5 rounded-md text-vault-subtle hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <AssetModal
          asset={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-sm mx-4 fade-in">
            <h3 className="text-vault-text font-semibold mb-2">Delete asset?</h3>
            <p className="text-vault-subtle text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-vault-border text-sm text-vault-subtle hover:text-vault-text transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}