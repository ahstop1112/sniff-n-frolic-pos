# POS Completion Plan — Sales Flow (A6–A10)

## Context
- POS supports **two countries, fixed per branch**: Hong Kong (no sales tax, HKD) and Canada/BC (GST 5% + PST 7%, CAD). Vancouver/Burnaby in the `branch` table are real stores; HK branch(es) to be added.
- Whether both countries run in-store POS checkout is undecided — design for it, don't block it.
- Tax and currency are **branch attributes**, never hardcoded in app logic.
- Cart (A3) already works. Checkout currently ends without payment recording.
- All work follows CLAUDE.md rules: feature branch per task, never commit to main, stop before any API change, no full-file reformatting, no deploys.

---

## Task 1 — Merge & deploy what's already done (Perry, not agent)
Verify the existing `feature/product-hub-*` branches (use `git diff main -w` to skip format noise), merge to main, deploy to Railway manually. Everything below builds on top of this.

---

## Task 1.5 — Branch Localization Foundation (NEW, must precede Task 2)
**Goal**: Branch carries country/currency/tax config; product pricing supports two currencies.

Scope:
- `branch` gains: `country_code` (HK/CA), `currency` (HKD/CAD), and tax configuration. Tax rules as data, not code — e.g. a `tax_rates` structure per branch (BC: GST 5% + PST 7%; HK: none). Rates must be effective-dated or at least easily editable (tax rates change).
- **Pricing decision (Perry decides after agent presents options)**: products currently have a single `regular_price` in cents. Two candidate designs:
  a) per-currency price columns/table (e.g. `product_prices(product_id, currency, regular_price, sale_price)`), or
  b) branch-level price override table falling back to a base price.
  The agent must present both with migration sketches and how `sniff-n-frolic-store` (which reads the same DB and currently assumes CAD) is affected — **stop for Perry's decision before implementing**.
- Sales panel and manage screen display prices in the active branch's currency.

Expected: schema migrations — full stop-and-review applies. This task is the riskiest for `sniff-n-frolic-store` compatibility; verify the store still renders prices correctly before merge.

---

## Task 2 — Payment & Change (A6 + A7)
**Goal**: Checkout ends with a recorded payment, not just an order.

Scope:
- Payment method selection at checkout: `cash`, `card`, `e-transfer` (extensible enum)
- Cash flow: tendered amount input → change auto-calculated and displayed
- **Tax calculation at checkout from the branch's tax config**: BC branches show GST/PST lines; HK branches show no tax. Rounding on integer cents, per-order (document the rounding rule chosen).
- Order record stores a **snapshot**: currency, per-line prices, tax breakdown (name + rate + amount per tax), payment method, amount tendered, change given. Never recompute tax from current rates for historical orders.
- Split payment NOT in scope this round (one method per order)

Offline-readiness requirements (do these now — cheap now, expensive to retrofit):
- Order ID is a **client-generated UUID** created by the POS at checkout time; the API treats order creation as **idempotent** on that UUID (same UUID twice = same order, no duplicate stock deduction). This also fixes double-submit bugs in normal online use.
- If the checkout API call fails, the cart must remain intact with a clear retry option — never clear the cart or block the UI on a failed request.

Expected: API change required (orders table/endpoint gains payment fields) — agent must stop and present the schema/endpoint change before implementing. A migration is likely; Perry reviews the SQL file before it lands anywhere near main.

## Task 3 — Receipt (A8)
**Goal**: Every completed sale can produce a receipt.

Scope:
- Receipt view: store name/branch, datetime, line items (name/variant, qty, unit price), **tax lines per branch config** (BC: GST/PST with registration numbers if provided; HK: no tax lines), total, payment method, tendered/change (if cash), order number, staff name
- Currency symbol and formatting follow the branch (HKD / CAD)
- Print via browser print dialog (thermal-printer CSS sizing: 80mm width) — no direct printer driver integration this round
- "No receipt" is a valid choice — don't block checkout on printing
- Email receipt: OUT of scope this round (stub the button if trivial, otherwise skip)

Depends on: Task 2 (receipt shows payment info).

## Task 4 — Hold Sale (A10)
**Goal**: Park an in-progress cart, start a new sale, resume later.

Scope:
- "Hold" button in cart → saves cart snapshot with a label (auto: time + item count; editable)
- Held sales list (badge showing count), resume restores cart exactly
- Held sales survive page refresh (persist server-side or localStorage — agent proposes, Perry decides; note Claude artifacts restriction does not apply here, this is the POS app)
- Auto-expire held sales at shift close (or after N hours) — propose behavior, Perry decides

## Task 5 — Refund / Exchange (A9)
**Goal**: Reverse or adjust a completed sale with stock restored.

Scope:
- Look up a past order (by order number / recent list)
- Full refund and per-line partial refund; refund method matches original payment (cash refund for cash sale etc.)
- Stock restored for refunded items (with an option to NOT restore, e.g. damaged goods)
- Exchange = refund + new sale (keep it composed of the two primitives; no special exchange entity this round)
- Refund records linked to the original order, visible in order history

Expected: API + schema changes — same stop-and-review rule applies. This is the most complex task; do it last, and split into two sessions if the plan comes back large (refund first, exchange second).

---

## Suggested session cadence
One task = one Claude Code session = one feature branch = one review+merge by Perry. Do not batch multiple tasks into one session — review size stays manageable and each merge is independently deployable.

## Deferred — Offline queue (NOT this week)
Full offline-first (local order queue, background sync, stale product cache) is deliberately deferred until after the sales flow closes. The idempotent client-UUID design in Task 2 is the foundation that makes this a bolt-on later rather than a rewrite. Operational mitigation in the meantime: a phone-hotspot backup network at the store.

## Definition of "sales flow complete"
A customer can: pick products (scan or browse) → pay by cash/card/e-transfer → get correct change → receive a printed receipt → and the store can hold a sale mid-way or refund a past one. At that point the POS is operationally usable for daily trading.