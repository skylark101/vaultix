# Vaultix — UI/UX Audit (Phase 1)

**Date:** 24 November 2025  
**Scope:** Frontend-only visual and UX assessment; no code changes.  
**Repository:** `vaultix` (React + Vite frontend, Express + Prisma backend)

---

## 1. Application overview

**Vaultix** is a personal asset tracker: users authenticate, add investment-style assets (FD, gold, mutual funds, etc.), view aggregate stats on a dashboard, search/filter a registry, and manage account settings. Data is user-scoped; amounts default to **INR** formatting.

| Area | What exists today |
|------|-------------------|
| **Auth** | Login, signup, forgot/reset password (`/login`, `/signup`, `/forgot-password`, `/reset-password`) |
| **Marketing** | Public landing at `/` |
| **App shell** | Sidebar layout under `/app/*` (Dashboard, Assets, Settings) |
| **Core data** | `Asset` model: name, type, amount, dates, rate, notes, document URL, JSON custom fields, recurring SIP-style fields |
| **Not in product** | Liabilities, income/expense ledger, net worth, maturity **alerts**, charts library, light theme |

The README positions Vaultix as a “financial command center,” but the implemented UI is narrowly focused on **asset inventory and invested totals** — not full personal finance (no liabilities or cash flow).

---

## 2. Architecture and UI stack

### 2.1 Frontend architecture

| Layer | Implementation |
|-------|------------------|
| Framework | React 19 + Vite 8 (`frontend/package.json`) |
| Routing | `react-router-dom` v6 — `frontend/src/App.jsx` |
| Styling | Tailwind CSS 3.4 + minimal global CSS (`frontend/src/index.css`) |
| HTTP | Axios via `frontend/src/api/client.js` |
| State | Local component state; auth in `AuthContext` (localStorage JWT + user) |
| UI libraries | **None** (no Radix, Headless UI, shadcn, chart libs, icon packs) |

**Route map**

| Path | Component | Layout |
|------|-----------|--------|
| `/` | `Landing.jsx` | Standalone |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth pages | Standalone, centered card |
| `/app` → redirect | `Navigate` → `/app/dashboard` | — |
| `/app/dashboard` | `Dashboard.jsx` | `Layout` + `Sidebar` |
| `/app/assets` | `Assets.jsx` | Same |
| `/app/settings` | `Settings.jsx` | Same |

**Component inventory (reusable vs page-local)**

| Shared | Page-local / duplicated |
|--------|-------------------------|
| `Layout.jsx`, `Sidebar.jsx`, `ProtectedRoute.jsx` | `StatCard` (`Dashboard.jsx`) |
| `AssetModal.jsx`, `HistoryModal.jsx` | `AssetCard`, `EmptyState`, `DeleteModal` (`Assets.jsx`) |
| — | `Row`, `PasswordField` (`Settings.jsx`) |
| — | Inline SVG icons duplicated across Sidebar, Assets, modals, auth |

There is **no component layer** for Button, Input, Label, Card, Modal shell, Badge, or Table — patterns are copy-pasted with Tailwind class strings.

### 2.2 Design tokens (today)

Defined in `frontend/tailwind.config.js` as `vault.*`:

| Token | Value | Usage |
|-------|-------|--------|
| `vault-bg` | `#0a0a0f` | Page background |
| `vault-surface` | `#111118` | Cards, sidebar, modals |
| `vault-border` | `#1e1e2e` | Borders, dividers |
| `vault-muted` | `#2a2a3e` | Input fills, progress track, hover |
| `vault-accent` | `#6366f1` | Primary actions, active nav, bars |
| `vault-accent-dim` | `#4f46e5` | Primary hover |
| `vault-text` | `#e2e2f0` | Primary text |
| `vault-subtle` | `#6b6b8a` | Secondary text, labels |

**Typography:** Google Fonts — DM Sans (UI), JetBrains Mono (amounts) in `index.html`.  
**Motion:** `.fade-in` (200ms translateY) in `index.css`; Landing has separate `fadeUp` keyframes.  
**Dead code:** `frontend/src/App.css` is Vite boilerplate and is **not imported** (`main.jsx` only imports `index.css`).

### 2.3 Backend ↔ UI data contract

Dashboard (`GET /assets/dashboard`) returns `totalInvested`, `totalAssets`, `recentAssets`, `byType` (`backend/src/services/assetService.js`).  
`totalInvested` uses the same recurring total logic as the Assets page (`calculateTotal`), but that function is **duplicated** in `Assets.jsx` and the backend — a consistency risk for displayed totals.

---

## 3. Overall UX assessment

### 3.1 Strengths

1. **Coherent dark shell** — App routes share `vault-*` tokens, bordered cards, and readable contrast.
2. **Responsive Assets page** — Card list below `lg`, wide table at desktop; filters stack on mobile.
3. **Sensible IA** — Three app destinations (Dashboard, Assets, Settings) are easy to learn.
4. **Financial readability** — `font-mono` + `Intl.NumberFormat('en-IN')` for currency.
5. **Progressive disclosure in forms** — Maturity, interest rate, and recurring blocks are checkbox-gated (`AssetModal.jsx`).
6. **Auth flows** — Forgot/reset password include success and error states with slightly richer treatment than login.

### 3.2 Structural UX gaps

| Gap | Impact |
|-----|--------|
| **No hero financial summary** | Users must infer “how much am I worth?” from a mid-size stat card; landing preview promises a large portfolio number the real dashboard does not provide. |
| **Marketing vs product mismatch** | Landing mentions “maturity alerts”; product only stores `maturityDate` — no list, badge, or notification UI. |
| **Liabilities / net worth absent** | Not in schema or UI; label “Total Invested” is accurate but not equivalent to net worth. |
| **Custom Fields (JSON)** | Power-user surface in the main asset form increases cognitive load and error risk for typical users. |
| **Duplicate sign-out** | Sidebar and Settings “Danger zone” — redundant, not harmful. |
| **Search triggers full refetch** | Every keystroke in Assets refetches (`useCallback` + `useEffect` on `search`) — latency perception on slow networks. |

### 3.3 Overall visual grade (subjective)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Consistency (app interior) | B | Tailwind tokens used well inside `/app` |
| Consistency (landing vs app) | C- | Landing is inline-style, gradient-heavy; app is flat Tailwind |
| Premium / polish | B- | Solid base; weak loading, empty states uneven, no design system |
| Data focus | B | Table/cards are functional; dashboard hierarchy is flat |
| Accessibility | C | Missing focus rings, hover-only row actions, native controls unstylized |

---

## 4. Visual design audit

### 4.1 Color and semantics

- **Primary brand:** Indigo (`#6366f1`) — reads modern but generic (common Tailwind default).
- **Semantic financial colors** are **not tokenized**: `red-400`, `emerald-400/500` appear ad hoc in Settings, Landing mock data, and delete actions. No shared `success`, `danger`, or `positive/negative` finance semantics in `tailwind.config.js`.
- **Allocation bars** (`Dashboard.jsx`) use a single accent color for all types — readable but not scannable by category.
- **Landing** introduces extra hex values (`#0d0d14`, `#1a1a28`, `#a5b4fc`, `#818cf8`) not in the Tailwind theme — drift risk.

### 4.2 Typography

| Element | Current | Issue |
|---------|---------|-------|
| Page titles | `text-lg sm:text-xl font-semibold` | No clear display scale; dashboard header feels same weight as section titles |
| Section titles | `text-sm font-medium` | Good restraint |
| Labels | `text-xs uppercase tracking-wider` | Consistent on forms; slightly loud for dense settings |
| Money | `font-mono` | Good; not applied on all dashboard stat values (e.g. Top Category is plain text) |

Emoji in dashboard greeting (`👋` in `Dashboard.jsx`) adds casual tone — may clash with “premium, professional” direction.

### 4.3 Spacing, radius, elevation

- **Padding rhythm:** `p-4 sm:p-6 lg:p-8` on main pages — consistent.
- **Radius:** `rounded-xl` cards, `rounded-lg` inputs/buttons — consistent in app.
- **Shadows:** Essentially **none** in app (border-only surfaces). Landing mock uses heavy shadow (`0 40px 80px`) — another landing/app split.
- **Glassmorphism:** `backdrop-blur-sm` on modal overlays only — acceptable, not excessive.

### 4.4 Iconography

- Inline stroke SVGs, mixed `strokeWidth` (1.8 vs 2 vs 2.5).
- `HistoryModal.jsx` close control uses text `✕` while other modals use SVG — inconsistent.

### 4.5 Information density

- **Desktop Assets table:** 9 columns including Notes and full datetime on Start — horizontally crowded; notes truncated at `max-w-[160px]`.
- **Asset modal:** Long scroll on mobile; recurring + maturity + rate + notes + JSON — high density for a single task.

### 4.6 Light / dark mode

**Dark only.** `color-scheme: dark` on date inputs in `AssetModal.jsx`. No theme toggle or `prefers-color-scheme` handling.

---

## 5. Page-by-page audit

### 5.1 Landing — `frontend/src/pages/Landing.jsx`

| | |
|--|--|
| **Purpose** | Acquire users; showcase imagined product |
| **Structure** | Nav → Hero (gradient headline, CTA) → Mock dashboard → 3 feature cards → CTA → Footer |

**Works well**

- Responsive grid for features; motion is restrained to fade-up.
- Mock portfolio sells the “single number + list” mental model.

**Visually weak**

- Heavy inline styles bypass Tailwind — maintenance and token drift.
- Gradient text, radial glow following mouse, noise overlay — more “startup landing” than “premium finance tool.”
- Emoji asset icons and faux `% change` chips mimic brokerage apps (contradicts “avoid unnecessary charts / e-commerce cards”).

**UX problems**

- Preview shows **+12.4% overall** and per-asset changes — **not available** in the real app → expectation mismatch.
- Copy promises **maturity alerts** — not implemented.

**Recommendations**

1. Rebuild landing with shared tokens/components; tone down gradients and glow. **P1**
2. Align mock UI with real Dashboard metrics (total invested, allocation bars, recent list). **P0**
3. Replace emoji rows with typographic list matching `Assets`/`Dashboard`. **P1**
4. Update feature copy to match shipped capabilities or ship alerts first. **P0**

---

### 5.2 Login — `frontend/src/pages/Login.jsx`

| | |
|--|--|
| **Purpose** | Authenticate |
| **Structure** | Centered logo → card (title, form, error) → signup link |

**Works well:** Matches app card/input patterns; forgot-password link visible.

**Visually weak:** Error is text-only block — Settings uses icon + border pattern (richer).

**UX problems:** No password visibility toggle (Settings has one). No explicit loading skeleton on card.

**Recommendations**

1. Extract shared `AuthLayout` + `FormField` components. **P2**
2. Unify error/success alert component with Settings. **P1**
3. Add `focus-visible:ring` on inputs. **P1**

---

### 5.3 Signup — `frontend/src/pages/Signup.jsx`

Same patterns as Login. Name field is optional in UI but no indication of optional vs required beyond HTML `required` on email/password.

**Recommendations:** Password strength hint; align with Login improvements. **P2**

---

### 5.4 Forgot password — `frontend/src/pages/ForgotPassword.jsx`

**Works well:** Icon header states, success branch with “try again.”

**UX:** Stronger than Login — good reference for alert styling elsewhere.

**Recommendations:** Reuse success state pattern on Login errors. **P2**

---

### 5.5 Reset password — `frontend/src/pages/ResetPassword.jsx`

**Works well:** Invalid token, success, and form branches are clear.

**UX:** Auto-redirect after 3s — good; no countdown indicator.

**Recommendations:** Optional progress text; shared password fields with show/hide. **P2**

---

### 5.6 Dashboard — `frontend/src/pages/Dashboard.jsx`

| | |
|--|--|
| **Purpose** | At-a-glance portfolio |
| **Structure** | Greeting → 3 `StatCard`s → Allocation list with progress bars → Recent assets list |

**Works well**

- Allocation breakdown is appropriate (no chart library needed).
- Recent assets deep-link opportunity (currently **not** clickable to Assets).

**Visually weak**

- No dominant **primary metric** (landing shows large ₹24,81,500; dashboard shows same weight for count vs money).
- Stat cards visually equal — hierarchy doesn’t emphasize total invested.
- All progress bars same indigo — categories blur together.

**UX problems**

- Loading: plain “Loading...” (`Dashboard.jsx` L46–49).
- Empty portfolio: allocation hidden; recent says “Add your first asset” but **no CTA button**.
- “Total Assets” is **count**, not value — label can confuse users expecting dollar value.
- No surfacing of upcoming maturities despite data existing on assets.

**Recommendations**

1. Hero row: single large **Total invested** (with optional recurring-adjusted subtitle). **P0**
2. Secondary stats in a tighter row (count, top category). **P1**
3. Skeleton loaders for cards and lists. **P1**
4. Empty state with primary button → `/app/assets` + open add modal query. **P1**
5. Optional: “Maturing in 90 days” short list (data-driven). **P1**
6. Make recent rows link to asset edit or Assets filter. **P2**
7. Differentiate allocation bar colors via muted categorical palette (not rainbow). **P2**

---

### 5.7 Assets — `frontend/src/pages/Assets.jsx`

| | |
|--|--|
| **Purpose** | CRUD + search/filter registry |
| **Structure** | Header + Add → filters → cards/table → modals |

**Works well**

- `EmptyState`, `DeleteModal`, dual layouts.
- Type badge, document link, history entry point.

**Visually weak**

- `TypeBadge` is gray pill only — types aren’t visually distinct.
- Table header: all caps compact — good, but column set is wide.

**UX problems**

1. **Mobile `AssetCard` layout** (L194–204): amount row mixes badge, amount, and recurring line in one `justify-between` flex — recurring text can wrap awkwardly.
2. **Desktop actions** `opacity-0 group-hover` (L539) — invisible on touch; poor keyboard discoverability.
3. **Start Date** column uses `fmtDateTime` in table but `fmtDate` on mobile card — inconsistent.
4. **No sorting** on columns despite table affordance.
5. **No pagination** — fine for small portfolios; will degrade with scale.
6. **Delete** has confirm modal; **no toast** on successful save/delete (modal just closes).
7. Search debouncing absent — UX jank on each character.

**Recommendations**

1. Always-visible action buttons or kebab menu on mobile/desktop. **P0**
2. Debounce search 300ms; show subtle loading on list. **P1**
3. Fix mobile card footer layout (stack amount + recurring). **P1**
4. Normalize date display (date-only vs datetime by column semantics). **P1**
5. Sticky first column or reduce columns (hide Notes behind expand). **P2**
6. Post-save feedback (inline banner or toast). **P2**

---

### 5.8 Asset modal — `frontend/src/components/AssetModal.jsx`

**Works well:** Mobile bottom sheet (`items-end`), sticky header, gated sections.

**Visually weak:** Date inputs `w-[80%]` — arbitrary width leaves dead space in grid.

**UX problems**

- Form length; JSON custom fields front-and-center intimidates non-technical users.
- No field-level validation messages (only top-level error).
- Datalist for type is good; no explanation of recurring calculation rules.

**Recommendations**

1. Collapse “Advanced” (document URL, custom JSON) behind disclosure. **P0**
2. Full-width date inputs; align grid. **P1**
3. Short helper text under recurring (“Total on Assets includes X cycles”). **P2**

---

### 5.9 History modal — `frontend/src/components/HistoryModal.jsx`

**Works well:** Simple timeline with left border.

**Visually weak:** Plain `✕`; minimal action labels (`format()` doesn’t cover all field types).

**UX:** No asset name in title; hard to know which asset history belongs to when opened from table.

**Recommendations**

1. Match modal header/close pattern from `AssetModal`. **P1**
2. Show asset name in title (pass prop or fetch). **P2**
3. Richer event copy for all `AssetHistory` fields. **P2**

---

### 5.10 Settings — `frontend/src/pages/Settings.jsx`

**Works well:** Sectioned cards, password change with show/hide, success/error alerts with icons.

**Visually weak:** `max-w-lg` leaves empty space on wide screens — acceptable for settings.

**UX:** Sign out in sidebar + danger zone — pick one primary pattern.

**Recommendations**

1. Promote alert component to shared UI. **P1**
2. Consider profile edit (name) if API supports — currently read-only rows. **P2**

---

### 5.11 Layout / Sidebar — `Layout.jsx`, `Sidebar.jsx`

**Works well:** Mobile drawer + overlay; active `NavLink` styling; user block with email truncate.

**UX problems**

- No breadcrumbs or page title in main chrome on desktop (only in page body).
- Sidebar fixed `w-56` — no collapsed icon-only mode for small laptops.
- Active route only three items — room for future “Liabilities” without nav clutter if planned.

**Recommendations**

1. Optional compact sidebar at `xl`. **P2**
2. Top bar on desktop with page title + quick “Add asset” (global). **P2**

---

## 6. Design inconsistencies (checklist)

| # | Inconsistency | Evidence |
|---|---------------|----------|
| 1 | Landing uses inline CSS + extra colors vs Tailwind `vault-*` | `Landing.jsx` vs `Dashboard.jsx` |
| 2 | Two animation systems | `fade-in` vs `fadeUp` |
| 3 | Error alert variants | Login plain vs Settings bordered+icon |
| 4 | Modal close affordances | SVG vs `✕` |
| 5 | Input backgrounds | Search uses `bg-vault-surface`; forms use `bg-vault-muted` |
| 6 | Date formatting | Table datetime vs card date-only |
| 7 | Marketing features ≠ product | Alerts, % returns on landing |
| 8 | `calculateTotal` / `fmt` duplicated | `Assets.jsx`, `Dashboard.jsx`, backend |
| 9 | Orphan `App.css` | Not imported |
| 10 | Checkbox styling mixed | native `accent-vault-accent` vs custom rounded classes |

---

## 7. Recommended design direction

Align the product with **“quiet wealth dashboard”**:

- **Minimal, not empty:** One strong number, short supporting stats, lists over charts.
- **Premium, not flashy:** Flat surfaces, 1px borders, single accent; remove landing mouse-glow and gradient headlines or isolate them to marketing only.
- **Data-first:** Mono figures, right-aligned amounts, tabular numerals where possible (`font-feature-settings: 'tnum'`).
- **Honest scope:** Say “total invested across assets,” not “portfolio return,” until returns are computed.
- **Subtle interaction:** Hover states on rows (already present); replace hover-only actions with visible or menu-based patterns.

**Avoid (per product goals):** Emoji product cards, fake performance chips, glass cards, heavy shadows, pie charts for &lt;6 categories.

---

## 8. Proposed design system (spec only — not implemented)

### 8.1 Color

```text
Brand
  primary-500: #6366f1  (keep or shift to slightly desaturated #5b5fc7 for distinction)
  primary-600: #4f46e5

Surfaces (dark)
  bg-base:     #0a0a0f  (vault-bg)
  bg-raised:   #111118  (vault-surface)
  bg-inset:    #16161f  (new — input wells slightly above muted)
  border:      #1e1e2e
  border-strong: #2a2a3e

Text
  primary:     #e8e8f0
  secondary:   #8b8ba8  (slightly lighter than vault-subtle for AA on small text)
  tertiary:    #5c5c78

Financial semantics
  positive:    #34d399  (emerald — gains, optional)
  negative:    #f87171  (losses, liabilities when added)
  warning:     #fbbf24  (maturing soon)
  accent-data: #818cf8  (links, doc URLs — optional)

Allocation (categorical, muted — max 8)
  cat-1..8: desaturated indigo/teal/amber/slate variants at ~40% opacity fills
```

### 8.2 Typography scale

| Token | Size / weight | Use |
|-------|----------------|-----|
| `display` | 2rem–2.5rem / 600 | Dashboard total |
| `title-lg` | 1.25rem / 600 | Page H1 |
| `title-sm` | 0.875rem / 500 | Card section headers |
| `body` | 0.875rem / 400 | Default |
| `caption` | 0.75rem / 500 | Labels, table headers |
| `mono-md` | 0.875rem / 500 mono | Currency |
| `mono-sm` | 0.75rem / 400 mono | Percentages, deltas |

### 8.3 Spacing scale (Tailwind-aligned)

Base unit 4px. Prefer `4, 5, 6, 8, 10, 12` for padding; `3, 4` for gaps. Page: `p-6 lg:p-8`. Card: `p-5`. Form field gap: `space-y-4`.

### 8.4 Radius and border

| Element | Radius | Border |
|---------|--------|--------|
| Card | `12px` (`rounded-xl`) | 1px `border` |
| Modal | `12px` (16px top on mobile sheet) | 1px |
| Button / input | `8px` (`rounded-lg`) | 1px |
| Badge | `6px` (`rounded-md`) | none |

No drop shadows except optional `shadow-sm` on modals for depth.

### 8.5 Components (to introduce)

| Component | Variants |
|-----------|----------|
| Button | primary, secondary (border), ghost, danger |
| Input / Select / Textarea | default, error |
| Card | default, inset |
| Alert | error, success, info |
| Modal | dialog, sheet (mobile) |
| Badge | neutral, type-* (optional map by asset type) |
| Skeleton | text, block, row |
| EmptyState | icon, title, description, action |
| Stat | label, value, hint |
| Table | compact desktop; row actions always visible |

### 8.6 Charts

**Defer chart library.** Use horizontal bars (current allocation UI) and tables. Revisit only for time-series if historical snapshots are stored later.

### 8.7 Breakpoints

Use Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.  
**Assets:** keep card/table split at `lg`.  
**Landing features:** 3 → 2 → 1 columns (already present).

### 8.8 Focus and a11y

- `focus-visible:ring-2 ring-vault-accent/50 ring-offset-2 ring-offset-vault-bg` on interactive elements.
- Minimum touch target 44px for icon buttons on mobile.
- `aria-label` on icon-only edit/delete/history.

---

## 9. Prioritized improvement roadmap

### P0 — Trust and clarity (ship first)

| Item | Pages / files |
|------|----------------|
| Align landing promise with real dashboard metrics | `Landing.jsx`, `Dashboard.jsx` |
| Dashboard primary total + fix “Total Assets” labeling | `Dashboard.jsx` |
| Always-visible row actions (accessibility) | `Assets.jsx` |
| Collapse advanced asset fields (JSON, etc.) | `AssetModal.jsx` |
| Remove or rewrite “maturity alerts” copy until built | `Landing.jsx` |

### P1 — Polish and consistency

| Item | Pages / files |
|------|----------------|
| Shared UI primitives (Button, Input, Alert, ModalShell) | `frontend/src/components/ui/*` |
| Unify landing onto Tailwind tokens | `Landing.jsx`, `tailwind.config.js` |
| Skeleton loading states | `Dashboard.jsx`, `Assets.jsx` |
| Dashboard empty CTA → Add asset | `Dashboard.jsx` |
| Debounced search + list loading indicator | `Assets.jsx` |
| Fix mobile asset card amount/recurring layout | `Assets.jsx` |
| Tokenize success/danger colors | `tailwind.config.js` |
| Focus-visible rings | global / inputs |
| Upcoming maturities widget (read-only) | `Dashboard.jsx` + API filter |

### P2 — Enhancement

| Item | Notes |
|------|-------|
| Auth layout extraction | Login, Signup, Forgot, Reset |
| Icon set consolidation | Lucide or single internal sprite |
| Table column trim / expandable detail | `Assets.jsx` |
| Recent assets navigation | `Dashboard.jsx` |
| Compact sidebar | `Sidebar.jsx` |
| Type-specific badge colors | optional map |
| Light theme | only if requested — large effort |

---

## 10. Technical risks (implementation phase)

| Risk | Detail | Mitigation |
|------|--------|------------|
| **Style refactor scope** | Landing rewrite + shared components touch every page | Introduce `ui/` primitives first; migrate page-by-page |
| **Total calculation drift** | Duplicated `calculateTotal` frontend/backend | Single shared package or API field `computedTotal` on assets |
| **Tailwind class explosion** | Without `@apply` or components, strings duplicate | CVA or small wrapper components |
| **JSON custom fields** | Hiding in “Advanced” may break power users | Keep API; move UI behind disclosure |
| **Table responsiveness** | Many columns | Column priority pattern or detail drawer |
| **No design screenshot tests** | Visual regressions manual | Optional Playwright snapshots later |
| **Feature creep** | Liabilities/net worth need schema + nav | Phase separately from visual polish |
| **Font loading** | Google Fonts external dependency | `font-display: swap` already via Google; consider self-host |

---

## 11. Suggested implementation sequence

1. **Foundation (no visual leap yet)**  
   Extend `tailwind.config.js` with semantic colors + typography tokens. Add `components/ui` (Button, Input, Label, Alert, Card, Modal).

2. **Dashboard + trust**  
   Hero metric, labels, skeletons, empty CTA, optional maturities list. Align copy with data model.

3. **Assets UX fixes**  
   Actions visibility, debounced search, mobile card layout, date consistency, save feedback.

4. **Asset modal simplification**  
   Advanced section, full-width dates, helper copy for recurring.

5. **Landing realignment**  
   Rebuild with shared components; remove faux performance UI; match dashboard preview.

6. **Auth polish**  
   Shared `AuthLayout`, unified alerts, password visibility on login.

7. **History + Settings**  
   Modal consistency, titled history, optional minor layout tweaks.

8. **Later: product expansion**  
   Liabilities, net worth, alerts — only after UI foundation and honest positioning.

---

## 12. Appendix: File reference map

| Concern | Primary files |
|---------|----------------|
| Routes | `frontend/src/App.jsx` |
| Theme | `frontend/tailwind.config.js`, `frontend/src/index.css` |
| Shell | `frontend/src/components/Layout.jsx`, `Sidebar.jsx` |
| Dashboard | `frontend/src/pages/Dashboard.jsx` |
| Assets | `frontend/src/pages/Assets.jsx`, `AssetModal.jsx`, `HistoryModal.jsx` |
| Settings | `frontend/src/pages/Settings.jsx` |
| Marketing | `frontend/src/pages/Landing.jsx` |
| Auth | `frontend/src/pages/Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` |
| Data model | `backend/prisma/schema.prisma` |
| Dashboard API | `backend/src/services/assetService.js` (`getDashboardStats`) |

---

*End of Phase 1 audit. No application source, styles, or dependencies were modified as part of this document.*