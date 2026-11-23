# Vaultix — UI/UX Implementation Tracker (Phase 2)

**Specification:** [`docs/ui-ux-audit.md`](./ui-ux-audit.md)  
**Last updated:** 24 November 2025

---

## Stage status

| Stage | Description | Status |
|-------|-------------|--------|
| **1** | Design foundation (tokens + `components/ui`) | ✅ Complete |
| **2** | Dashboard | ✅ Complete |
| **3** | Assets | ✅ Complete |
| **4** | Asset modal | ✅ Complete |
| **5** | Landing | ✅ Complete |

---

## Stage 1 — Design foundation

### Tokens (`frontend/tailwind.config.js`)

- Extended `vault` palette: `inset`, `secondary`, `link`, `success`, `danger`, `warning`
- Categorical allocation colors: `vault.cat.1` … `vault.cat.8`
- Typography tokens: `text-display`, `text-display-sm`

### Global styles (`frontend/src/index.css`)

- `.focus-ring` utility for keyboard-visible focus

### Utilities

| File | Purpose |
|------|---------|
| `frontend/src/lib/cn.js` | Class name helper |
| `frontend/src/lib/format.js` | `fmtCurrency` (INR, matches prior `fmt`) |

### UI primitives (`frontend/src/components/ui/`)

| Component | Notes |
|-----------|--------|
| `Button` | Variants: primary, secondary, ghost, danger; sizes sm/md/lg; optional `to` for React Router links; `focus-ring`, 44px min height on md/lg |
| `Input` | Inset background, focus ring |
| `Label` | Uppercase caption style |
| `Card` | `CardHeader`, `CardTitle`, `CardContent` |
| `Alert` | error, success, info |
| `Badge` | Neutral type pill |
| `Skeleton` | Pulse blocks for loading |
| `Modal` | `ModalOverlay`, `ModalPanel` with accessible close (for Stages 3–4) |
| `Stat` | Secondary metric card |
| `EmptyState` | Icon, copy, CTA |
| `index.js` | Barrel exports |

**Adoption in Stage 1:** Primitives created; full app migration deferred to later stages (per incremental strategy).

**Stage 3 additions:** `IconButton` (accessible icon actions, 44px mobile / 36px desktop).

**Stage 4 additions:** `Disclosure`, `Textarea`.

---

## Stage 2 — Dashboard

### File modified

- `frontend/src/pages/Dashboard.jsx`

### Visual / UX improvements

1. **Dominant total** — Hero card with `text-display` / mono `Total invested` from API `totalInvested` (unchanged calculation source).
2. **Secondary hierarchy** — Two `Stat` cards: **Asset count** (numeric count, not currency) and **Largest category** with invested amount hint.
3. **Copy** — Removed emoji; clarified subtitle; no fabricated metrics.
4. **Allocation** — Distinct `vault-cat-*` bar colors; progressbar ARIA; percentages unchanged.
5. **Recent assets** — `Badge` for type, tabular nums, “View all” link to `/app/assets`.
6. **Loading** — Full-page `DashboardSkeleton` instead of “Loading...”.
7. **Empty portfolio** — `EmptyState` with **Add asset** → `/app/assets` when `totalAssets === 0`.
8. **Layout** — `max-w-5xl` for readable line length on large screens.

### Behavior preserved

- Same `GET /assets/dashboard` contract.
- Recent rows still show `amountInvested` (base field from API, same as before).
- No new API calls or calculation logic.

---

## Stage 3 — Assets

### Files modified / added

| File | Change |
|------|--------|
| `frontend/src/pages/Assets.jsx` | Full UX pass (see below) |
| `frontend/src/components/ui/IconButton.jsx` | **New** — labeled icon actions |
| `frontend/src/components/ui/index.js` | Export `IconButton` |
| `frontend/src/lib/useDebouncedValue.js` | **New** — 300ms debounce hook |

### Visual / UX improvements

1. **Actions** — `AssetRowActions` + `IconButton`; always visible on table and cards; `aria-label` + `title`; no hover-only opacity.
2. **Search** — `searchInput` + `useDebouncedValue(300ms)`; fetch keyed by `debouncedSearch` + `typeFilter`; generation ref prevents stale overwrites.
3. **Loading** — `AssetsListSkeleton`; “Updating…” while refreshing; initial vs refresh states separated (`hasLoadedOnce` ref).
4. **Table** — Right-aligned amount/rate; `tabular-nums`; lighter header row; row borders instead of full `divide-y` noise; Start/Maturity/Updated use `fmtDate`; shared `Badge`.
5. **Mobile cards** — Name → type → amount hierarchy; recurring on its own line under amount; dates aligned with table.
6. **Empty / filter** — Shared `EmptyState`; clear filters vs add asset CTAs.
7. **Feedback** — Dismissible `Alert` banner for save/delete success and load/delete errors (4.5s).
8. **Delete modal** — `ModalOverlay` + `Button` variants; loading on delete.
9. **Formatting** — `fmtCurrency` from `lib/format.js`; `calculateTotal` unchanged.

### Behavior preserved

- Same API params (`search`, `type`); filter clear restores full list when debounce catches up.
- `AssetModal`, `HistoryModal`, delete confirmation flow intact.
- No backend or calculation changes.

---

## Stage 4 — Asset modal

### Files modified / added

| File | Change |
|------|--------|
| `frontend/src/components/AssetModal.jsx` | Sectioned form, validation, `ModalPanel`, advanced disclosure |
| `frontend/src/components/ui/Disclosure.jsx` | **New** — accordion for advanced fields |
| `frontend/src/components/ui/Textarea.jsx` | **New** — matches `Input` styling |
| `frontend/src/components/ui/index.js` | Exports |

### Visual / UX improvements

1. **Sections** — Basic information → Additional financial details → Recurring investment → Advanced (collapsed).
2. **Advanced** — `Disclosure` default closed; “Has data” badge when URL/JSON present; values stay in React state when collapsed (submitted unchanged).
3. **Modal shell** — `ModalOverlay` + `ModalPanel`; sticky footer with `Button` cancel/submit.
4. **Inputs** — Shared `Input` / `Textarea`; full-width dates; `focus-ring`; optional/required markers.
5. **Recurring** — Helper text explaining cycle totals; start date required validation when recurring enabled.
6. **Validation** — Field-level errors; JSON error opens advanced + inline message; API errors via `Alert`.
7. **Submit** — `loading` guard + disabled buttons to prevent duplicate posts.

### Behavior preserved

- Same payload shape and API (`POST`/`PUT`); checkbox gates for rate/maturity; recurring logic unchanged.
- `AssetModalForm` keyed by `asset?.id ?? 'create'` — no `useEffect` form hydration (fixes `AssetModal` ESLint).

### Manual test checklist (recommended)

- [ ] Create minimal asset (name, type, amount only)
- [ ] Edit asset; toggle advanced without losing URL/JSON
- [ ] Recurring + custom interval + start date
- [ ] Invalid JSON with advanced collapsed → auto-expands
- [ ] Mobile sheet scroll + footer sticky

---

## Stage 5 — Landing

### Files modified

| File | Change |
|------|--------|
| `frontend/src/pages/Landing.jsx` | Full rewrite with Tailwind tokens + `components/ui` |

### Visual / UX improvements

1. **Design language** — Removed inline styles, gradients, mouse glow, noise, emoji cards, `fadeUp` animations, and fabricated `%` returns.
2. **Nav / footer** — `Button` + shield logo; links to `/`, `/login`, `/signup`, `/app/dashboard` when authenticated.
3. **Hero** — Restrained typography; primary CTA signup, secondary sign-in; logged-in paths to dashboard/assets.
4. **Product preview** — `DashboardPreview` mirrors real dashboard: total invested, asset count, largest category, allocation bars (`vault-cat-*`), recent list with `Badge`; labeled **Example dashboard** with illustration disclaimer.
5. **Features** — Four honest capability cards (total, allocation, registry, portfolio fields) — no maturity alerts or encryption marketing.
6. **Responsive** — `lg:grid-cols-2` hero; feature grid 1→2→4 columns; shared spacing with app pages.

### Navigation verified (routes unchanged in `App.jsx`)

| Link | Target |
|------|--------|
| Logo | `/` |
| Sign in | `/login` |
| Sign up / Get started | `/signup` |
| Dashboard (auth) | `/app/dashboard` |
| Go to assets (auth CTA) | `/app/assets` |
| Footer links | `/login`, `/signup` |

### Behavior preserved

- No backend or auth flow changes; `useAuth` for conditional CTAs only.

---

## Final polish (post–Stage 5)

### Auth (`Login`, `Signup`, `ForgotPassword`, `ResetPassword`)

- Shared `AuthShell` / `AuthLogo` / `AuthFooterLink`.
- `Input`, `PasswordInput`, `Button`, `Alert` primitives; password visibility on all password fields.
- Duplicate-submit guards on forms.

### History modal

- `ModalOverlay` + `ModalPanel`; SVG close; title includes asset name via `GET /assets/:id`.
- Timeline layout; `fmtCurrency` / `fmtDateTime`; skeleton loading; `key={assetId}` remount (no effect setState lint).

### Settings & sidebar

- Settings: `Card`, `Alert`, `PasswordInput`, `Button`; removed duplicate sign-out (sidebar only).
- Sidebar: nav `focus-ring`, 44px touch targets; fixed nav icon lint.

### Lint & cleanup

- Split `authContext.js` + `AuthProvider.jsx` + `useAuth.js` (fixes react-refresh / unused `useEffect`).
- Removed unused `frontend/src/App.css`.
- Consolidated `fmtDate` into `lib/format.js` (Assets uses shared helper).
- Added `PasswordInput` to `components/ui`.

### Files modified (final pass)

| Area | Files |
|------|--------|
| Auth pages | `Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` |
| Auth shared | `components/auth/AuthShell.jsx`, `components/ui/PasswordInput.jsx` |
| Context | `authContext.js`, `AuthProvider.jsx`, `useAuth.js`; `App.jsx` import |
| History | `HistoryModal.jsx` |
| Settings / shell | `Settings.jsx`, `Sidebar.jsx`, `ProtectedRoute.jsx`, `Dashboard.jsx`, `Landing.jsx` |
| Format | `lib/format.js`, `Assets.jsx` |
| Removed | `App.css`, `context/AuthContext.jsx` (replaced) |

---

## Regression checklist (manual — recommended)

| Area | Status |
|------|--------|
| Login / signup / forgot / reset routes | Unchanged; UI only |
| Dashboard API + totals | Unchanged |
| Asset CRUD, search, debounce, banners | Unchanged |
| Asset modal sections + advanced disclosure | Unchanged |
| History API + formatting | Unchanged (+ asset name fetch) |
| Settings password API | Unchanged |
| Logout (sidebar) | Unchanged |
| Landing CTAs | Unchanged |

---

## Build & lint (final)

| Check | Command | Result |
|-------|---------|--------|
| Build | `npm run build` (in `frontend/`) | ✅ Pass |
| Lint | `npm run lint` (in `frontend/`) | ✅ **0 errors** |

---

## Known limitations

- Landing preview uses static illustration amounts (disclaimed).
- Dashboard recent list has no per-asset deep link.
- History fetches asset name via extra `GET /assets/:id` when opening modal (existing endpoint).
- No automated E2E suite in repo.

---

## Phase 2 status

**All stages (1–5) and final polish: complete.**

---

## Dashboard intelligence upgrade

### Objective

Dashboard answers: how much invested, allocation, investment age, and recorded interest rates — **single API** (`GET /assets/dashboard`, including `assets[]`).

### Sections (current)

1. **Hero** — Total invested + tiles (assets, categories, top category %, monthly recurring or recurring count).
2. **Allocation** — SVG donut; legend links to `?type=`.
3. **Portfolio insights** — Largest category, highest-value asset, top 3 holdings share %, recurring count.
4. **Investment tenure** — Average holding period, oldest asset + start date, horizontal bucket distribution (&lt;1y, 1–3y, &gt;3y) by asset count.
5. **Interest rate overview** — Counts with/without rate, highest recorded rate (linked), breakdown by asset type (no portfolio-wide average).

### Removed (refinement)

- Allocation detail bars (duplicate of donut).
- Upcoming maturities panel (maturity fields remain on Assets).
- Recurring per-asset list (covered by hero + insights).

### Files

| File | Role |
|------|------|
| `frontend/src/pages/Dashboard.jsx` | Layout |
| `frontend/src/components/dashboard/AllocationDonut.jsx` | Donut chart |
| `frontend/src/lib/dashboardMetrics.js` | Insights, tenure, rates |
| `frontend/src/lib/calculateTotal.js` | Shared totals |
| `frontend/src/pages/Assets.jsx` | `?type=` / `?assetId=` deep links |

### Constraints

- No backend/schema changes; no fabricated returns.
- Interest rates shown as user-entered annual % — not returns; no cross-type average.

### Verification

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Pass |
| `npm run lint` | ✅ Pass |