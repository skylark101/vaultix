import { useEffect, useState, useCallback } from "react";
import api from "../api/client";
import AssetModal from "../components/AssetModal";
import HistoryModal from "../components/HistoryModal";

/* ───────── Utils ───────── */

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function calculateTotal(asset) {
  if (!asset.isRecurring || !asset.recurringAmount || !asset.startDate) {
    return asset.amountInvested;
  }

  const start = new Date(asset.startDate);
  const now = new Date();
  if (start > now) return asset.amountInvested;

  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  let cycles = 0;

  switch (asset.recurringType) {
    case "daily":
      cycles = diffDays;
      break;
    case "monthly":
      cycles =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      break;
    case "quarterly":
      cycles = Math.floor(
        ((now.getFullYear() - start.getFullYear()) * 12 +
          (now.getMonth() - start.getMonth())) / 3
      );
      break;
    case "semiannual":
      cycles = Math.floor(
        ((now.getFullYear() - start.getFullYear()) * 12 +
          (now.getMonth() - start.getMonth())) / 6
      );
      break;
    case "yearly":
      cycles = now.getFullYear() - start.getFullYear();
      break;
    case "custom":
      if (asset.recurringInterval) {
        cycles = Math.floor(diffDays / asset.recurringInterval);
      }
      break;
  }

  return asset.amountInvested + cycles * asset.recurringAmount;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypeBadge({ type }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-vault-muted text-vault-subtle text-xs font-medium">
      {type}
    </span>
  );
}

/* ───────── Icons ───────── */

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ───────── Mobile Card ───────── */

function AssetCard({ asset, onEdit, onHistory, onDelete }) {
  return (
    <div className="bg-vault-surface border border-vault-border rounded-xl p-4 space-y-3">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-sm font-medium text-vault-text truncate">
            {asset.name}
          </p>
          {asset.documentUrl && (
            <a href={asset.documentUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-vault-accent hover:underline">
              View doc
            </a>
          )}
        </div>

        <div className="flex gap-1">
          <button onClick={() => onEdit(asset)} className="icon-btn" title="Edit">
            <IconEdit />
          </button>
          <button onClick={() => onHistory(asset.id)} className="icon-btn" title="History">
            <IconHistory />
          </button>
          <button onClick={() => onDelete(asset.id)} className="icon-btn text-red-400" title="Delete">
            <IconDelete />
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center">
        <TypeBadge type={asset.type} />

        <div className="text-right">
          <p className="text-sm font-mono text-vault-text">
            {fmt(calculateTotal(asset))}
          </p>
          {asset.isRecurring && (
            <p className="text-xs text-vault-subtle">
              +₹{asset.recurringAmount} / {asset.recurringType}
            </p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-sm border-t border-vault-border pt-2">
        {asset.startDate && (
          <div>
            <p className="text-xs text-vault-subtle">Start</p>
            <p className="text-vault-text">{fmtDate(asset.startDate)}</p>
          </div>
        )}
        {asset.maturityDate && (
          <div>
            <p className="text-xs text-vault-subtle">Maturity</p>
            <p className="text-vault-text">{fmtDate(asset.maturityDate)}</p>
          </div>
        )}
        {asset.interestRate != null && (
          <div>
            <p className="text-xs text-vault-subtle">Rate</p>
            <p className="text-vault-text">{asset.interestRate}%</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-vault-border text-xs text-vault-subtle space-y-1">
        <p>Added • {fmtDateTime(asset.createdAt)}</p>
        {asset.updatedAt !== asset.createdAt && (
          <p>Updated • {fmtDateTime(asset.updatedAt)}</p>
        )}
      </div>
    </div>
  );
}

/* ───────── Main ───────── */

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [types, setTypes] = useState([]);
  const [modal, setModal] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAssets = useCallback(async () => {
    const { data } = await api.get("/assets");
    setAssets(data);
  }, []);

  useEffect(() => {
    fetchAssets();
    api.get("/assets/types").then((r) => setTypes(r.data));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="flex justify-between mb-6">
        <h1 className="text-xl text-vault-text font-semibold">Assets</h1>
        <button
          onClick={() => setModal("create")}
          className="bg-vault-accent px-4 py-2 rounded-lg text-white text-sm"
        >
          Add Asset
        </button>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        {assets.map((a) => (
          <AssetCard
            key={a.id}
            asset={a}
            onEdit={setModal}
            onDelete={setDeleteId}
            onHistory={setHistoryId}
          />
        ))}
      </div>

      {/* Modals */}
      {modal && (
        <AssetModal
          asset={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchAssets}
        />
      )}

      {historyId && (
        <HistoryModal
          assetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
    </div>
  );
}