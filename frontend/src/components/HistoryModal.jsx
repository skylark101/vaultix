import { useEffect, useState } from 'react'
import api from '../api/client'

function format(h) {
  if (h.action === 'CREATED') return h.newValue

  if (h.field === 'amount') {
    return `₹${h.oldValue} → ₹${h.newValue}`
  }

  if (h.field === 'interestRate') {
    return `${h.oldValue}% → ${h.newValue}%`
  }

  if (h.field === 'recurring') {
    return h.newValue === 'true'
      ? 'Recurring enabled'
      : 'Recurring disabled'
  }

  if (h.field === 'recurringAmount') {
    return `Recurring amount → ₹${h.newValue}`
  }

  if (h.field === 'recurringType') {
    return `Frequency → ${h.newValue}`
  }

  if (h.action === 'DELETED') return 'Asset deleted'

  return `${h.field} updated`
}

export default function HistoryModal({ assetId, onClose }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/assets/${assetId}/history`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [assetId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-vault-surface border border-vault-border rounded-xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto fade-in">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-vault-text font-semibold">History</h2>
          <button onClick={onClose} className="text-vault-subtle hover:text-vault-text">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-vault-subtle">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-vault-subtle">No history found</p>
        ) : (
          <div className="space-y-4">
            {data.map((h) => (
              <div key={h.id} className="border-l border-vault-border pl-3">
                <p className="text-sm text-vault-text">{format(h)}</p>
                <p className="text-xs text-vault-subtle">
                  {new Date(h.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}