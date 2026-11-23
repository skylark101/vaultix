import { useEffect, useState } from 'react'
import api from '../api/client'
import { fmtCurrency, fmtDateTime } from '../lib/format'
import { ModalOverlay, ModalPanel, Skeleton } from './ui'

function formatHistoryEntry(h) {
  if (h.action === 'CREATED') return h.newValue || 'Asset created'

  if (h.field === 'amount') {
    const oldN = Number(h.oldValue)
    const newN = Number(h.newValue)
    const oldStr = Number.isFinite(oldN) ? fmtCurrency(oldN) : `₹${h.oldValue}`
    const newStr = Number.isFinite(newN) ? fmtCurrency(newN) : `₹${h.newValue}`
    return `Amount ${oldStr} → ${newStr}`
  }

  if (h.field === 'interestRate') {
    return `Interest rate ${h.oldValue ?? '—'}% → ${h.newValue}%`
  }

  if (h.field === 'recurring') {
    return h.newValue === 'true' ? 'Recurring enabled' : 'Recurring disabled'
  }

  if (h.field === 'recurringAmount') {
    const n = Number(h.newValue)
    const amt = Number.isFinite(n) ? fmtCurrency(n) : `₹${h.newValue}`
    return `Recurring amount → ${amt}`
  }

  if (h.field === 'recurringType') {
    return `Frequency → ${h.newValue}`
  }

  if (h.action === 'DELETED') return 'Asset deleted'

  if (h.field) {
    const label = h.field.replace(/([A-Z])/g, ' $1').trim()
    if (h.oldValue != null && h.newValue != null) {
      return `${label}: ${h.oldValue} → ${h.newValue}`
    }
    return `${label} updated`
  }

  return 'Record updated'
}

function HistoryModalBody({ assetId, onClose }) {
  const [assetName, setAssetName] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.get(`/assets/${assetId}`),
      api.get(`/assets/${assetId}/history`),
    ])
      .then(([assetRes, histRes]) => {
        if (cancelled) return
        setAssetName(assetRes.data?.name || 'Asset')
        setHistory(histRes.data)
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError('Could not load history.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assetId])

  const title = assetName ? `History · ${assetName}` : 'History'

  return (
    <ModalPanel title={title} onClose={onClose} className="sm:max-w-md">
      <div className="px-5 pb-5 pt-1 max-h-[min(70vh,28rem)] overflow-y-auto">
        {loading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 pl-3 border-l border-vault-border">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-sm text-vault-danger py-4" role="alert">
            {fetchError}
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-vault-subtle py-4">No history yet for this asset.</p>
        ) : (
          <ol className="relative border-l border-vault-border ml-1 space-y-0">
            {history.map((h, index) => (
              <li key={h.id} className="pl-4 pb-5 last:pb-0">
                <span
                  className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-vault-muted border border-vault-border"
                  aria-hidden
                />
                <p className="text-sm text-vault-text leading-snug">
                  {formatHistoryEntry(h)}
                </p>
                <time
                  className="text-xs text-vault-subtle mt-1 block tabular-nums"
                  dateTime={h.createdAt}
                >
                  {fmtDateTime(h.createdAt)}
                </time>
                {index < history.length - 1 && (
                  <span className="sr-only">; </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </ModalPanel>
  )
}

export default function HistoryModal({ assetId, onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <HistoryModalBody key={assetId} assetId={assetId} onClose={onClose} />
    </ModalOverlay>
  )
}