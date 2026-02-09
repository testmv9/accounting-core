# Product Plan: Next-Gen Accounting SaaS

## 1. Vision
To build an accounting platform that combines **Enterprise-Grade Trust** with **Consumer-Grade UX**.
Unlike legacy tools (Xero, QuickBooks) which often feel like "digitized paper ledgers", our software will function as a **Modern Financial Operating System**.

**Mission**: Make accounting "invisible" for the user while maintaining rigid, audit-proof accuracy in the background.

## 2. Core Differentiators & Strategy

### A. User Experience (The "Wow" Factor)
*   **Intent-Based vs. Form-Filling**: 
    *   *Competitors*: "Create Journal Entry -> Select Account 400 -> Type 50.00 -> Select Credit Account..."
    *   *Us*: "I bought coffee." -> System infers Category, Tax, and creates the Journal Entry automatically.
*   **Performance**:
    *   *Competitors*: Server-side rendering, slow page reloads.
    *   *Us*: **Local-First / Optimistic UI**. Actions feel instant. Sync happens in the background.
*   **Visual Guidance**: 
    *   Use color and motion to indicate financial health (e.g., runway visualization), not just static tables.

### B. Technical Robustness (The "Trust" Factor)
*   **Immutable Ledger**: 
    *   We **never** update a posted ledger line. If a mistake is made, we post a corrective entry. This guarantees a 100% accurate audit trail forever.
*   **Idempotency**: 
    *   The system must be proof against network retries or double-clicks. Every transaction has a unique ID that cannot be re-processed.
*   **Strict Typing**: 
    *   Leverage TypeScript to ensure Money is always handled as Integers (Cents), preventing floating-point errors.

## 3. SaaS Architecture

### Multi-Tenancy
*   **Data Isolation**: Every record must have a `TenantId`.
*   **Scalability**: Design schema to support thousands of concurrent organizations.

### Tech Stack Recommendation
*   **Core Logic**: TypeScript (Current `accounting-core`).
*   **Database**: PostgreSQL (Crucial for transactional integrity & JSONB for flexible metadata).
*   **Backend**: Node.js / NestJS or Next.js API Routes.
*   **Frontend**: React / Next.js with Tailwind CSS.
*   **Auth**: Clerk or Supabase Auth.
*   **Billing**: Stripe.

## 4. Implementation Roadmap

### Phase 1: Harden the Core (Current Focus)
The `accounting-core` must be bulletproof before we build a UI on top of it.
*   [ ] **Idempotency**: Implement `seen_ids` check to prevent double-posting.
*   [ ] **Backdating Logic**: Handle entries inserted with past dates.
    *   *Strategy*: When a backdated entry is inserted, trigger a recalculation of `balanceCents` for all subsequent entries in that account.
*   [ ] **Validation**: Add strict checks for "Closed Periods" (e.g., cannot post to 2024 if 2024 is closed).

### Phase 2: Persistence & API
*   Migrate in-memory `LedgerState` to a real Database (SQLite for dev, Postgres for prod).
*   Create API endpoints for the Frontend.

### Phase 3: The SaaS Experience (Frontend)
*   Build the Dashboards.
*   Implement "Smart Entry" (Natural Language to Journal Entry).
*   Integrate Banking Feeds (Plaid/GoCardless).

## 5. Feature Wishlist
*   **AI Bookkeeper**: Scans receipts and suggests categorizations with high confidence.
*   **Cash Flow Forecasting**: "What happens if I hire 2 people?" (Scenario planning).
