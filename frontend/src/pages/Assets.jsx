import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import AssetModal from '../components/AssetModal'

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-vault-muted text-vault-subtle text-xs font-medium">
      {type}
    </span>
  )
}

/* ── Mobile/tablet card ── */
function AssetCard({ asset, onEdit, onDelete }) {
  return (
    <div className="bg-vault-surface border border-vault-border rounded-xl p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-vault-text truncate">{asset.name}</p>
          {asset.documentUrl && (
            <a href={asset.documentUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-vault-accent hover:underline">
              View doc
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(asset)}
            className="p-1.5 rounded-md text-vault-subtle hover:text-vault-text hover:bg-vault-muted transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(asset.id)}
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
      </div>

      {/* Type + Amount */}
      <div className="flex items-center justify-between">
        <TypeBadge type={asset.type} />
        <span className="text-sm font-mono font-medium text-vault-text">{fmt(asset.amountInvested)}</span>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-vault-border">
        {asset.interestRate != null && (
          <div>
            <p className="text-xs text-vault-subtle mb-0.5">Rate</p>
            <p className="text-sm font-mono text-vault-text">{asset.interestRate}%</p>
          </div>
        )}
        {asset.startDate && (
          <div>
            <p className="text-xs text-vault-subtle mb-0.5">Start</p>
            <p className="text-sm text-vault-text">{fmtDate(asset.startDate)}</p>
          </div>
        )}
        {asset.maturityDate && (
          <div>
            <p className="text-xs text-vault-subtle mb-0.5">Maturity</p>
            <p className="text-sm text-vault-text">{fmtDate(asset.maturityDate)}</p>
          </div>
        )}
        {asset.notes && (
          <div className="col-span-2">
            <p className="text-xs text-vault-subtle mb-0.5">Notes</p>
            <p className="text-sm text-vault-text line-clamp-2">{asset.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ filtered }) {
  return (
    <div className="bg-vault-surface border border-vault-border rounded-xl p-10 sm:p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-vault-muted flex items-center justify-center mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          className="text-vault-subtle" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      </div>
      <p className="text-vault-text font-medium mb-1">No assets found</p>
      <p className="text-vault-subtle text-sm">
        {filtered ? 'Try adjusting your filters' : 'Add your first asset to get started'}
      </p>
    </div>
  )
}

/* ── Delete confirm modal ── */
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-sm fade-in">
        <h3 className="text-vault-text font-semibold mb-2">Delete asset?</h3>
        <p className="text-vault-subtle text-sm mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-vault-border text-sm text-vault-subtle hover:text-vault-text transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   Main page
══════════════════════════════════════ */
export default function Assets() {
  const [assets, setAssets] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState(null)
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

  const isFiltered = !!(search || typeFilter)

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-vault-text">Assets</h1>
          <p className="text-vault-subtle text-sm mt-0.5">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-vault-accent hover:bg-vault-accent-dim text-white text-sm font-medium rounded-lg transition-all flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-subtle" width="15" height="15"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-vault-surface border border-vault-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-vault-text placeholder-vault-subtle focus:border-vault-accent/60 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-vault-surface border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors"
          >
            <option value="">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {isFiltered && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('') }}
              className="px-3 py-2.5 text-vault-subtle hover:text-vault-text text-sm transition-colors border border-vault-border rounded-lg hover:bg-vault-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-vault-subtle text-sm">Loading...</p>
      ) : assets.length === 0 ? (
        <EmptyState filtered={isFiltered} />
      ) : (
        <>
          {/* Mobile/tablet: card list (hidden on lg+) */}
          <div className="lg:hidden space-y-3">
            {assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={setModal}
                onDelete={setDeleteId}
              />
            ))}
          </div>

          {/* Desktop: table (hidden below lg) */}
          <div className="hidden lg:block bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vault-border">
                    {['Name', 'Type', 'Amount', 'Rate', 'Start Date', 'Maturity', 'Notes', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-vault-subtle uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border">
                  {assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-vault-muted/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-vault-text font-medium">{asset.name}</p>
                        {asset.documentUrl && (
                          <a href={asset.documentUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-vault-accent hover:underline">View doc</a>
                        )}
                      </td>
                      <td className="px-5 py-3.5"><TypeBadge type={asset.type} /></td>
                      <td className="px-5 py-3.5 font-mono text-sm text-vault-text whitespace-nowrap">
                        {fmt(asset.amountInvested)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vault-subtle font-mono">
                        {asset.interestRate != null ? `${asset.interestRate}%` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vault-subtle whitespace-nowrap">
                        {fmtDate(asset.startDate) || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vault-subtle whitespace-nowrap">
                        {fmtDate(asset.maturityDate) || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vault-subtle max-w-[160px]">
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
          </div>
        </>
      )}

      {/* Asset create/edit modal */}
      {modal && (
        <AssetModal
          asset={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}