# System Architecture 🏗️

The **Accounting SaaS Core** is built as a modular, multitenant double-entry accounting engine. It follows a layered architecture to ensure data integrity, scalability, and ease of use.

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 15+](https://nextjs.org) | UI, Routing, and Server Actions. |
| **Backend** | [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) | API logic and database interactions. |
| **Database** | [PostgreSQL](https://www.postgresql.org) | Robust storage with ACID transactions. |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | Type-safe SQL generation and migrations. |
| **Auth** | [NextAuth.js (Auth.js)](https://authjs.dev) | Secure user authentication and session management. |

---

## 🧩 Core Components

### 1. The Double-Entry Engine (`src/repo/ledgers.ts`)
The heart of the system. Every financial event is recorded as a **Journal Entry** with at least two **Ledger Lines** (Debits and Credits).
- **Transactional Integrity**: Uses database transactions to ensure that an entry and its lines are saved together or not at all.
- **Immutable Ledger**: Lines are never deleted or modified; corrections are made via new entries.
- **Running Balances**: Each ledger line stores the account balance at that point in time for fast lookups.

### 2. Multi-Tenancy (`src/db/schema.ts`)
The system supports multiple companies (Tenants) on a single database.
- **Isolation**: Every record (Accounts, Invoices, etc.) is keyed by `tenant_id`.
- **Memberships**: Users can belong to multiple tenants with different roles (OWNER, MEMBER).

### 3. Modular Repositories (`src/repo/`)
Logic is split into specialized repositories, all unified under a single `AccountingRepo` facade:
- **LedgerRepo**: Core accounting logic (Accounts, Journals).
- **InvoiceRepo**: Accounts Receivable (Customers, Invoices).
- **BillRepo**: Accounts Payable (Suppliers, Bills).
- **BankingRepo**: Bank statements and reconciliation rules.
- **ReportRepo**: Financial reporting (P&L, Balance Sheet).

---

## 🔄 Data Flow

1. **User Action**: A user submits a form (e.g., "Pay Invoice").
2. **Server Action**: Validates permissions and calls the appropriate method in `AccountingRepo`.
3. **Repository**: 
   - Starts a database transaction.
   - Creates the high-level document (e.g., an Invoice Payment record).
   - Generates the balancing Journal Entry.
   - Updates the General Ledger.
4. **Database**: Commits the change and ensures physical consistency.
5. **UI**: Updates the view based on the success of the action.

---

## 🔒 Security
- **Authentication**: Handled via NextAuth with secure session cookies.
- **Authorization**: All repository methods require a `tenantId` to ensure users only see their own data. Middleware and Server Actions verify membership before executing.
