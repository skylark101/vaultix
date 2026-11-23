import { useState } from "react";
import api from "../api/client";
import { cn } from "../lib/cn";
import {
  Alert,
  Button,
  Disclosure,
  Input,
  Label,
  ModalOverlay,
  ModalPanel,
  Textarea,
} from "./ui";

const COMMON_TYPES = [
  "FD",
  "Insurance",
  "Cash",
  "Real Estate",
  "Stocks",
  "Mutual Fund",
  "Gold",
  "Crypto",
  "PPF",
  "NPS",
  "Other",
];

const selectClass =
  "w-full bg-vault-inset border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors focus-ring";

const dateClass =
  "w-full min-w-0 bg-vault-inset border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:border-vault-accent/60 transition-colors focus-ring [color-scheme:dark]";

function buildInitialForm(asset) {
  if (!asset) {
    return {
      name: "",
      type: "",
      amountInvested: "",
      startDate: "",
      maturityDate: "",
      interestRate: "",
      notes: "",
      documentUrl: "",
      customFields: "{}",
    };
  }
  return {
    name: asset.name || "",
    type: asset.type || "",
    amountInvested: asset.amountInvested ?? "",
    startDate: asset.startDate ? asset.startDate.slice(0, 10) : "",
    maturityDate: asset.maturityDate ? asset.maturityDate.slice(0, 10) : "",
    interestRate: asset.interestRate ?? "",
    notes: asset.notes || "",
    documentUrl: asset.documentUrl || "",
    customFields: JSON.stringify(asset.customFields || {}, null, 2),
  };
}

function buildInitialFlags(asset) {
  if (!asset) {
    return {
      hasMaturity: false,
      hasRate: false,
      isRecurring: false,
      recurringAmount: "",
      recurringType: "monthly",
      recurringInterval: "",
    };
  }
  return {
    hasMaturity: !!asset.maturityDate,
    hasRate: asset.interestRate != null,
    isRecurring: !!asset.isRecurring,
    recurringAmount: asset.recurringAmount ?? "",
    recurringType: asset.recurringType || "monthly",
    recurringInterval: asset.recurringInterval ?? "",
  };
}

function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div className="mb-1">
        <h3 className="text-sm font-medium text-vault-text">{title}</h3>
        {description && (
          <p className="text-xs text-vault-subtle mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, optional, hint, error, children, id }) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-vault-accent normal-case tracking-normal">
            {" "}
            *
          </span>
        )}
        {optional && (
          <span className="normal-case font-normal tracking-normal text-vault-subtle">
            {" "}
            (optional)
          </span>
        )}
      </Label>
      {hint && (
        <p className="text-xs text-vault-subtle mb-1.5 -mt-0.5">{hint}</p>
      )}
      {children}
      {error && (
        <p className="text-vault-danger text-xs mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function hasAdvancedData(form) {
  const doc = form.documentUrl?.trim();
  let custom = false;
  try {
    const parsed = JSON.parse(form.customFields || "{}");
    custom = Object.keys(parsed).length > 0;
  } catch {
    custom = (form.customFields || "").trim() !== "{}";
  }
  return !!(doc || custom);
}

function AssetModalForm({ asset, onClose, onSaved }) {
  const isEdit = !!asset;
  const [form, setForm] = useState(() => buildInitialForm(asset));
  const [flags, setFlags] = useState(() => buildInitialFlags(asset));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customFieldsError, setCustomFieldsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    hasMaturity,
    hasRate,
    isRecurring,
    recurringAmount,
    recurringType,
    recurringInterval,
  } = flags;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((fe) => {
      if (!fe[k]) return fe;
      const next = { ...fe };
      delete next[k];
      return next;
    });
  };

  const setFlag = (k, v) => setFlags((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter an asset name";
    if (!form.type.trim()) next.type = "Enter an asset type";
    if (
      form.amountInvested === "" ||
      Number.isNaN(parseFloat(form.amountInvested)) ||
      parseFloat(form.amountInvested) < 0
    ) {
      next.amountInvested = "Enter a valid amount";
    }
    if (isRecurring) {
      if (
        recurringAmount === "" ||
        Number.isNaN(parseFloat(recurringAmount)) ||
        parseFloat(recurringAmount) < 0
      ) {
        next.recurringAmount = "Enter the amount added each cycle";
      }
      if (recurringType === "custom") {
        const days = parseInt(recurringInterval, 10);
        if (!recurringInterval || Number.isNaN(days) || days < 1) {
          next.recurringInterval = "Enter interval in days (minimum 1)";
        }
      }
      if (!form.startDate) {
        next.startDate =
          "Start date is required for recurring investments";
      }
    }
    if (hasRate && form.interestRate !== "") {
      const rate = parseFloat(form.interestRate);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        next.interestRate = "Enter a rate between 0 and 100";
      }
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setCustomFieldsError("");

    if (!validate()) return;

    let parsedCF = {};
    try {
      parsedCF = JSON.parse(form.customFields || "{}");
    } catch {
      setCustomFieldsError("Invalid JSON in custom fields");
      setAdvancedOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amountInvested: parseFloat(form.amountInvested),
        maturityDate:
          hasMaturity && form.maturityDate ? form.maturityDate : null,
        interestRate:
          hasRate && form.interestRate !== ""
            ? parseFloat(form.interestRate)
            : null,
        customFields: parsedCF,
        isRecurring,
        recurringAmount: isRecurring ? parseFloat(recurringAmount) : null,
        recurringType: isRecurring ? recurringType : null,
        recurringInterval:
          isRecurring && recurringType === "custom"
            ? parseInt(recurringInterval, 10)
            : null,
      };
      if (isEdit) {
        await api.put(`/assets/${asset.id}`, payload);
      } else {
        await api.post("/assets", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const advancedBadge = hasAdvancedData(form) ? "Has data" : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {error && (
          <Alert variant="error">
            <p>{error}</p>
          </Alert>
        )}

        <FormSection
          title="Basic information"
          description="What you own and how much you put in."
        >
          <Field label="Asset name" required id="asset-name" error={fieldErrors.name}>
            <Input
              id="asset-name"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. SBI Fixed Deposit"
              aria-invalid={!!fieldErrors.name}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type" required id="asset-type" error={fieldErrors.type}>
              <Input
                id="asset-type"
                required
                list="asset-type-list"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                placeholder="FD, Gold, etc."
                aria-invalid={!!fieldErrors.type}
              />
              <datalist id="asset-type-list">
                {COMMON_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </Field>

            <Field
              label="Invested amount (₹)"
              required
              id="asset-amount"
              error={fieldErrors.amountInvested}
            >
              <Input
                id="asset-amount"
                required
                type="number"
                min="0"
                step="any"
                value={form.amountInvested}
                onChange={(e) => set("amountInvested", e.target.value)}
                placeholder="100000"
                className="font-mono tabular-nums"
                aria-invalid={!!fieldErrors.amountInvested}
              />
            </Field>
          </div>

          <Field
            label="Start date"
            optional
            id="asset-start"
            hint="Used for recurring investments and tracking timelines."
            error={fieldErrors.startDate}
          >
            <input
              id="asset-start"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={dateClass}
              aria-invalid={!!fieldErrors.startDate}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Additional financial details"
          description="Optional rate, maturity, and notes."
        >
          <div className="space-y-3 rounded-lg border border-vault-border bg-vault-inset/30 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]">
              <input
                type="checkbox"
                checked={hasRate}
                onChange={(e) => {
                  setFlag("hasRate", e.target.checked);
                  if (!e.target.checked) set("interestRate", "");
                }}
                className="w-4 h-4 rounded border-vault-border bg-vault-inset accent-vault-accent cursor-pointer focus-ring"
              />
              <span className="text-sm text-vault-text font-medium">
                Has interest rate
              </span>
            </label>
            {hasRate && (
              <Field label="Interest rate" id="asset-rate" error={fieldErrors.interestRate}>
                <div className="relative">
                  <Input
                    id="asset-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.interestRate}
                    onChange={(e) => set("interestRate", e.target.value)}
                    placeholder="7.50"
                    className="pr-10 font-mono tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vault-subtle font-medium pointer-events-none">
                    %
                  </span>
                </div>
              </Field>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-vault-border bg-vault-inset/30 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]">
              <input
                type="checkbox"
                checked={hasMaturity}
                onChange={(e) => {
                  setFlag("hasMaturity", e.target.checked);
                  if (!e.target.checked) set("maturityDate", "");
                }}
                className="w-4 h-4 rounded border-vault-border bg-vault-inset accent-vault-accent cursor-pointer focus-ring"
              />
              <span className="text-sm text-vault-text font-medium">
                Has maturity date
              </span>
            </label>
            {hasMaturity && (
              <Field label="Maturity date" id="asset-maturity">
                <input
                  id="asset-maturity"
                  type="date"
                  value={form.maturityDate}
                  onChange={(e) => set("maturityDate", e.target.value)}
                  className={dateClass}
                />
              </Field>
            )}
          </div>

          <Field label="Notes" optional id="asset-notes">
            <Textarea
              id="asset-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any relevant notes…"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Recurring investment"
          description="For SIPs, monthly contributions, or other repeating amounts."
        >
          <div className="space-y-3 rounded-lg border border-vault-border bg-vault-inset/30 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setFlag("isRecurring", e.target.checked)}
                className="w-4 h-4 accent-vault-accent cursor-pointer focus-ring"
              />
              <span className="text-sm text-vault-text font-medium">
                Recurring investment
              </span>
            </label>

            {isRecurring && (
              <>
                <p className="text-xs text-vault-subtle leading-relaxed">
                  The Assets list adds your initial amount plus one contribution
                  for each completed cycle from the start date (inclusive). Set
                  start date in Basic information.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Amount per cycle"
                    id="recurring-amount"
                    error={fieldErrors.recurringAmount}
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-subtle text-sm pointer-events-none">
                        ₹
                      </span>
                      <Input
                        id="recurring-amount"
                        type="number"
                        min="0"
                        step="any"
                        value={recurringAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || Number(val) >= 0) {
                            setFlag("recurringAmount", val);
                            setFieldErrors((fe) => {
                              if (!fe.recurringAmount) return fe;
                              const next = { ...fe };
                              delete next.recurringAmount;
                              return next;
                            });
                          }
                        }}
                        placeholder="5000"
                        className="pl-7 font-mono tabular-nums"
                      />
                    </div>
                  </Field>
                  <Field label="Frequency" id="recurring-type">
                    <select
                      id="recurring-type"
                      value={recurringType}
                      onChange={(e) => setFlag("recurringType", e.target.value)}
                      className={selectClass}
                    >
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semiannual">6 months</option>
                      <option value="yearly">Annual</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>
                </div>
                {recurringType === "custom" && (
                  <Field
                    label="Interval (days)"
                    id="recurring-interval"
                    error={fieldErrors.recurringInterval}
                  >
                    <Input
                      id="recurring-interval"
                      type="number"
                      min="1"
                      placeholder="e.g. 14"
                      value={recurringInterval}
                      onChange={(e) => setFlag("recurringInterval", e.target.value)}
                      className="font-mono tabular-nums"
                    />
                  </Field>
                )}
              </>
            )}
          </div>
        </FormSection>

        <Disclosure
          title="Advanced details"
          description="Document links and structured metadata. Collapsed fields are still saved."
          open={advancedOpen}
          onToggle={() => setAdvancedOpen((o) => !o)}
          badge={advancedBadge}
        >
          <Field
            label="Document URL"
            optional
            id="asset-doc"
            hint="Link to a statement, certificate, or stored file."
          >
            <Input
              id="asset-doc"
              type="url"
              value={form.documentUrl}
              onChange={(e) => set("documentUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field
            label="Custom fields"
            optional
            id="asset-custom"
            hint="JSON object for extra attributes (e.g. nominee, policy number)."
          >
            <Textarea
              id="asset-custom"
              rows={4}
              value={form.customFields}
              onChange={(e) => {
                set("customFields", e.target.value);
                setCustomFieldsError("");
              }}
              placeholder={'{\n  "nominee": "Priya Sharma"\n}'}
              className={cn(
                "font-mono text-xs leading-relaxed",
                customFieldsError && "border-vault-danger/60"
              )}
            />
            {customFieldsError && (
              <p className="text-vault-danger text-xs mt-1.5" role="alert">
                {customFieldsError}
              </p>
            )}
          </Field>
        </Disclosure>
      </div>

      <div className="sticky bottom-0 flex gap-3 px-5 py-4 border-t border-vault-border bg-vault-surface">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Add asset"}
        </Button>
      </div>
    </form>
  );
}

export default function AssetModal({ asset, onClose, onSaved }) {
  const title = asset ? "Edit asset" : "Add asset";

  return (
    <ModalOverlay onClose={onClose}>
      <ModalPanel title={title} onClose={onClose}>
        <AssetModalForm
          key={asset?.id ?? "create"}
          asset={asset}
          onClose={onClose}
          onSaved={onSaved}
        />
      </ModalPanel>
    </ModalOverlay>
  );
}