import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/client";
import AssetModal from "../components/AssetModal";
import HistoryModal from "../components/HistoryModal";
import { fmtCurrency, fmtDate } from "../lib/format";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  ModalOverlay,
  Skeleton,
} from "../components/ui";
import { cn } from "../lib/cn";

function calculateTotal(asset) {
  if (!asset.isRecurring || !asset.recurringAmount || !asset.startDate) {
    return asset.amountInvested;
  }

  function toLocalDate(input) {
    const d = input instanceof Date ? input : new Date(input);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const start = toLocalDate(asset.startDate);
  const now = toLocalDate(new Date());

  if (now < start) return asset.amountInvested;

  let cycles = 0;

  switch (asset.recurringType) {
    case "daily": {
      cycles = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
      break;
    }
    case "monthly": {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      if (now.getDate() < start.getDate()) months -= 1;
      cycles = Math.max(0, months) + 1;
      break;
    }
    case "quarterly": {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      if (now.getDate() < start.getDate()) months -= 1;
      cycles = Math.floor(Math.max(0, months) / 3) + 1;
      break;
    }
    case "semiannual": {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      if (now.getDate() < start.getDate()) months -= 1;
      cycles = Math.floor(Math.max(0, months) / 6) + 1;
      break;
    }
    case "yearly": {
      let years = now.getFullYear() - start.getFullYear();
      if (
        now.getMonth() < start.getMonth() ||
        (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
      )
        years -= 1;
      cycles = Math.max(0, years) + 1;
      break;
    }
    case "custom": {
      if (asset.recurringInterval) {
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        cycles = Math.floor(diffDays / asset.recurringInterval) + 1;
      }
      break;
    }
    default:
      break;
  }

  return asset.amountInvested + cycles * asset.recurringAmount;
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function AssetRowActions({ asset, onEdit, onHistory, onDelete }) {
  return (
    <div
      className="flex items-center justify-end gap-0.5"
      role="group"
      aria-label={`Actions for ${asset.name}`}
    >
      <IconButton label="Edit asset" onClick={() => onEdit(asset)}>
        <EditIcon />
      </IconButton>
      <IconButton label="View history" onClick={() => onHistory(asset.id)}>
        <HistoryIcon />
      </IconButton>
      <IconButton
        label="Delete asset"
        danger
        onClick={() => onDelete(asset.id)}
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
}

function AssetCard({ asset, onEdit, onHistory, onDelete }) {
  const total = calculateTotal(asset);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-vault-text truncate">
            {asset.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge>{asset.type}</Badge>
            {asset.documentUrl && (
              <a
                href={asset.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-vault-link hover:text-vault-text focus-ring rounded"
              >
                View doc
              </a>
            )}
          </div>
        </div>
        <AssetRowActions
          asset={asset}
          onEdit={onEdit}
          onHistory={onHistory}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-vault-border">
        <div className="flex flex-col items-end text-right gap-0.5">
          <span className="text-base font-mono font-medium tabular-nums text-vault-text">
            {fmtCurrency(total)}
          </span>
          {asset.isRecurring && (
            <p className="text-xs text-vault-subtle whitespace-nowrap">
              +{fmtCurrency(asset.recurringAmount)} / {asset.recurringType}
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-vault-border text-sm">
        {asset.interestRate != null && (
          <>
            <dt className="text-xs text-vault-subtle">Rate</dt>
            <dd className="font-mono tabular-nums text-vault-text text-right">
              {asset.interestRate}%
            </dd>
          </>
        )}
        {asset.startDate && (
          <>
            <dt className="text-xs text-vault-subtle">Start</dt>
            <dd className="text-vault-text text-right">
              {fmtDate(asset.startDate)}
            </dd>
          </>
        )}
        {asset.maturityDate && (
          <>
            <dt className="text-xs text-vault-subtle">Maturity</dt>
            <dd className="text-vault-text text-right">
              {fmtDate(asset.maturityDate)}
            </dd>
          </>
        )}
      </dl>

      {asset.notes && (
        <p className="mt-3 pt-3 border-t border-vault-border text-sm text-vault-secondary line-clamp-2">
          {asset.notes}
        </p>
      )}

      <p className="mt-3 text-xs text-vault-subtle">
        Updated {fmtDate(asset.updatedAt || asset.createdAt)}
      </p>
    </Card>
  );
}

function AssetsListSkeleton({ cards = 4 }) {
  return (
    <div className="space-y-3">
      <div className="hidden lg:block">
        <Card className="overflow-hidden p-0">
          <Skeleton className="h-11 w-full rounded-none" />
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-none border-t border-vault-border"
            />
          ))}
        </Card>
      </div>
      <div className="lg:hidden space-y-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function LayersIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div
        className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-sm mx-4 fade-in"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="delete-asset-title"
        aria-describedby="delete-asset-desc"
      >
        <h3
          id="delete-asset-title"
          className="text-vault-text font-semibold mb-2"
        >
          Delete asset?
        </h3>
        <p id="delete-asset-desc" className="text-vault-subtle text-sm mb-5">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

const TABLE_HEADERS = [
  { label: "Name", align: "left" },
  { label: "Type", align: "left" },
  { label: "Amount", align: "right" },
  { label: "Rate", align: "right" },
  { label: "Start", align: "left" },
  { label: "Maturity", align: "left" },
  { label: "Updated", align: "left" },
  { label: "Notes", align: "left" },
  { label: "Actions", align: "right" },
];

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [types, setTypes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [typeFilter, setTypeFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [banner, setBanner] = useState(null);
  const fetchGeneration = useRef(0);
  const hasLoadedOnce = useRef(false);
  const bannerTimer = useRef(null);

  const showBanner = useCallback((variant, message) => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setBanner({ variant, message });
    bannerTimer.current = setTimeout(() => setBanner(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  useEffect(() => {
    const generation = ++fetchGeneration.current;
    if (hasLoadedOnce.current) setRefreshing(true);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (typeFilter) params.type = typeFilter;

    api
      .get("/assets", { params })
      .then(({ data }) => {
        if (generation === fetchGeneration.current) setAssets(data);
      })
      .catch(() => {
        if (generation === fetchGeneration.current) {
          showBanner("error", "Could not load assets. Please try again.");
        }
      })
      .finally(() => {
        if (generation === fetchGeneration.current) {
          setInitialLoading(false);
          setRefreshing(false);
          hasLoadedOnce.current = true;
        }
      });
  }, [debouncedSearch, typeFilter, showBanner]);

  useEffect(() => {
    api.get("/assets/types").then((r) => setTypes(r.data));
  }, [assets]);

  const reloadAssets = useCallback(() => {
    const generation = ++fetchGeneration.current;
    setRefreshing(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (typeFilter) params.type = typeFilter;
    return api
      .get("/assets", { params })
      .then(({ data }) => {
        if (generation === fetchGeneration.current) setAssets(data);
      })
      .finally(() => {
        if (generation === fetchGeneration.current) setRefreshing(false);
      });
  }, [debouncedSearch, typeFilter]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/assets/${id}`);
      setDeleteId(null);
      showBanner("success", "Asset deleted.");
      await reloadAssets();
      api.get("/assets/types").then((r) => setTypes(r.data));
    } catch (err) {
      showBanner(
        "error",
        err.response?.data?.error || "Could not delete asset."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = () => {
    const isCreate = modal === "create";
    setModal(null);
    showBanner(
      "success",
      isCreate ? "Asset added successfully." : "Asset updated successfully."
    );
    reloadAssets();
    api.get("/assets/types").then((r) => setTypes(r.data));
  };

  const clearFilters = () => {
    setSearchInput("");
    setTypeFilter("");
  };

  const isFiltered = !!(searchInput.trim() || typeFilter);
  const listReady = !initialLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in max-w-6xl">
      {banner && (
        <Alert variant={banner.variant} className="mb-4">
          <p className="flex-1">{banner.message}</p>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-vault-text">
            Assets
          </h1>
          <p className="text-vault-subtle text-sm mt-0.5">
            {listReady ? (
              <>
                {assets.length} asset{assets.length !== 1 ? "s" : ""}
                {isFiltered ? " matching filters" : ""}
                {refreshing && (
                  <span className="text-vault-secondary ml-2">Updating…</span>
                )}
              </>
            ) : (
              "Loading your registry…"
            )}
          </p>
        </div>
        <Button
          size="md"
          className="flex-shrink-0"
          onClick={() => setModal("create")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">Add asset</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-subtle pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
            className="pl-9 bg-vault-surface"
            aria-label="Search assets by name"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by asset type"
            className={cn(
              "flex-1 sm:flex-none sm:min-w-[10rem] bg-vault-surface border border-vault-border rounded-lg",
              "px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors focus-ring"
            )}
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {isFiltered && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {!listReady ? (
        <AssetsListSkeleton />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<LayersIcon />}
          title="No assets found"
          description={
            isFiltered
              ? "Nothing matches your search or type filter. Try different terms or clear filters."
              : "Add your first asset to start tracking what you own."
          }
          actionLabel={isFiltered ? "Clear filters" : "Add asset"}
          onAction={
            isFiltered ? clearFilters : () => setModal("create")
          }
        />
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={setModal}
                onDelete={setDeleteId}
                onHistory={setHistoryId}
              />
            ))}
          </div>

          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-vault-border bg-vault-inset/40">
                    {TABLE_HEADERS.map(({ label, align }) => (
                      <th
                        key={label}
                        scope="col"
                        className={cn(
                          "px-4 py-3 text-xs font-medium text-vault-subtle uppercase tracking-wider whitespace-nowrap",
                          align === "right" ? "text-right" : "text-left"
                        )}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset, rowIndex) => (
                    <tr
                      key={asset.id}
                      className={cn(
                        "hover:bg-vault-muted/20 transition-colors",
                        rowIndex > 0 && "border-t border-vault-border"
                      )}
                    >
                      <td className="px-4 py-3 align-middle max-w-[200px]">
                        <p className="font-medium text-vault-text truncate">
                          {asset.name}
                        </p>
                        {asset.documentUrl && (
                          <a
                            href={asset.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-vault-link hover:text-vault-text focus-ring rounded"
                          >
                            View doc
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge>{asset.type}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <p className="font-mono tabular-nums text-vault-text whitespace-nowrap">
                          {fmtCurrency(calculateTotal(asset))}
                        </p>
                        {asset.isRecurring && (
                          <p className="text-xs text-vault-subtle whitespace-nowrap mt-0.5">
                            +{fmtCurrency(asset.recurringAmount)} /{" "}
                            {asset.recurringType}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-right font-mono tabular-nums text-vault-secondary">
                        {asset.interestRate != null
                          ? `${asset.interestRate}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-vault-secondary whitespace-nowrap">
                        {fmtDate(asset.startDate) || "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-vault-secondary whitespace-nowrap">
                        {fmtDate(asset.maturityDate) || "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-vault-secondary whitespace-nowrap">
                        {fmtDate(asset.updatedAt) || "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-vault-secondary max-w-[10rem]">
                        <span className="block truncate">
                          {asset.notes || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <AssetRowActions
                          asset={asset}
                          onEdit={setModal}
                          onHistory={setHistoryId}
                          onDelete={setDeleteId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {modal && (
        <AssetModal
          asset={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {historyId && (
        <HistoryModal
          key={historyId}
          assetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}

      {deleteId && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => !deleteLoading && setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}