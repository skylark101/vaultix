import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import { calculateTotal } from "../lib/calculateTotal";
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

/** Column widths for `table-fixed` — favors Name/Notes; keeps actions compact. */
const TABLE_COL_CLASS = [
  "w-[17%]", // Name
  "w-[9%]", // Type
  "w-[11%]", // Amount
  "w-[5%]", // Rate
  "w-[9%]", // Start
  "w-[9%]", // Maturity
  "w-[9%]", // Updated
  "w-[22%]", // Notes
  "w-[6.5rem]", // Actions
];

export default function Assets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openedFromUrl = useRef(false);
  const [assets, setAssets] = useState([]);
  const [types, setTypes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [typeFilter, setTypeFilter] = useState(
    () => searchParams.get("type") || ""
  );
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

  useEffect(() => {
    const type = searchParams.get("type");
    if (type != null && type !== typeFilter) {
      // Deep link from dashboard category filter
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL ?type= to filter
      setTypeFilter(type);
    }
  }, [searchParams, typeFilter]);

  useEffect(() => {
    if (initialLoading || openedFromUrl.current) return;
    const assetId = searchParams.get("assetId");
    if (!assetId) return;
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    openedFromUrl.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete("assetId");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open edit modal from dashboard link
    setModal(asset);
  }, [initialLoading, assets, searchParams, setSearchParams]);

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
    const next = new URLSearchParams(searchParams);
    next.delete("type");
    setSearchParams(next, { replace: true });
  };

  const isFiltered = !!(searchInput.trim() || typeFilter);
  const listReady = !initialLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in w-full min-w-0">
      {banner && (
        <Alert variant={banner.variant} className="mb-4">
          <p className="flex-1">{banner.message}</p>
        </Alert>
      )}

      <header className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-vault-text">
            Assets
            {listReady && (
              <span className="text-vault-subtle font-normal text-base sm:text-lg">
                {" "}
                · {assets.length}
                {isFiltered ? " shown" : ""}
              </span>
            )}
          </h1>
          <p className="text-vault-subtle text-sm mt-0.5">
            {listReady ? (
              <>
                {isFiltered
                  ? "Matching your search and type filter"
                  : "Your registered investments"}
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
          className="shrink-0"
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
      </header>

      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div className="relative flex-1 min-w-0">
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
            className="pl-9 bg-vault-surface w-full"
            aria-label="Search assets by name"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by asset type"
            className={cn(
              "w-full sm:w-44 bg-vault-surface border border-vault-border rounded-lg",
              "px-3 py-2.5 text-sm text-vault-text min-h-[42px]",
              "focus:border-vault-accent/60 transition-colors focus-ring"
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

          <Card className="hidden lg:block overflow-hidden min-w-0">
            <table className="w-full min-w-0 table-fixed text-sm">
              <colgroup>
                {TABLE_COL_CLASS.map((className, i) => (
                  <col key={TABLE_HEADERS[i].label} className={className} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-vault-border bg-vault-inset/40">
                  {TABLE_HEADERS.map(({ label, align }) => (
                    <th
                      key={label}
                      scope="col"
                      className={cn(
                        "px-3 xl:px-4 py-3 text-xs font-medium text-vault-subtle uppercase tracking-wider",
                        align === "right" ? "text-right" : "text-left",
                        label !== "Name" &&
                          label !== "Notes" &&
                          label !== "Type" &&
                          "whitespace-nowrap"
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
                    <td className="px-3 xl:px-4 py-3 align-middle min-w-0">
                      <p
                        className="font-medium text-vault-text truncate"
                        title={asset.name}
                      >
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
                    <td className="px-3 xl:px-4 py-3 align-middle min-w-0">
                      <Badge className="max-w-full truncate">{asset.type}</Badge>
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-right">
                      <p className="font-mono tabular-nums text-vault-text whitespace-nowrap">
                        {fmtCurrency(calculateTotal(asset))}
                      </p>
                      {asset.isRecurring && (
                        <p className="text-xs text-vault-subtle truncate mt-0.5">
                          +{fmtCurrency(asset.recurringAmount)} /{" "}
                          {asset.recurringType}
                        </p>
                      )}
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-right font-mono tabular-nums text-vault-secondary whitespace-nowrap">
                      {asset.interestRate != null
                        ? `${asset.interestRate}%`
                        : "—"}
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-vault-secondary text-xs xl:text-sm whitespace-nowrap">
                      {fmtDate(asset.startDate) || "—"}
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-vault-secondary text-xs xl:text-sm whitespace-nowrap">
                      {fmtDate(asset.maturityDate) || "—"}
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-vault-secondary text-xs xl:text-sm whitespace-nowrap">
                      {fmtDate(asset.updatedAt) || "—"}
                    </td>
                    <td className="px-3 xl:px-4 py-3 align-middle text-vault-secondary min-w-0">
                      {asset.notes ? (
                        <span
                          className="block truncate"
                          title={asset.notes}
                        >
                          {asset.notes}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-2 xl:px-3 py-3 align-middle">
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