# Otra Ronda Más — Wapsell TO-BE workspace mock

**Route:** /[locale]/demo/workspace (also /[locale]/workspace)  
**Status:** UI prototype only — not an integrated ERP demo.

## Purpose

Show a responsive, WhatsApp-inspired commercial workspace for Wapsell with Otra Ronda Más as the first Business. The prototype makes the intended navigation and major commercial workflows tangible without claiming that the current Wapsell frontend is already integrated with the Otra Ronda Más backend.

## Screens / modules represented

- Messaging inbox, conversation thread, customer context and simulated send
- Catalog search, product creation in local component state, cart and hand-off to demo orders
- Orders list and simulated state transitions
- Sales overview
- Stock alerts and TO-BE inventory principles
- Purchases / replenishment concept (not MVP-confirmed functionality)
- Cash overview and simulated income/expense actions
- Customers and conversation hand-off
- Reports with illustrative charts and metrics
- Team / roles / permissions concept
- Brand preview for Otra Ronda Más

## Data provenance and limitations

- Brand name, tagline and visual palette are drawn from the Otra Ronda Más project context: Otra Ronda Más, “Bebidas y mucho más para tu negocio”, #FFD700, #1a1a1a, #2d2d2d, #f5f5f5.
- Product names, prices, quantities, conversations, customers, order totals and metrics in this page are illustrative mock data, not a verified export of the current production catalog or database. Do not use them for commercial decisions.
- All actions are client-side simulations. They do not write to FastAPI, NestJS, PostgreSQL, SQLite, Messaging, stock, cash or order persistence.
- No real WhatsApp delivery, payment processing, role enforcement, tenant isolation or realtime transport is exercised by this prototype.
- The screen represents a product direction based on TO-BE documentation; it does not approve draft specifications or resolve open product decisions.
- Purchases is displayed as a future/conceptual view because the current General SPEC places Purchases / Accounts Payable outside the initial MVP.
- No schema, migrations, persisted data, auth mechanism or production deployment was changed by this prototype.

## Validation status

This implementation was added through GitHub's repository API. A local install, type-check, browser/mobile E2E and CI result are not yet verified. Do not treat the visual prototype as a functional integration or as a release Gate PASS.
