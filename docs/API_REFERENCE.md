# API Reference 📖

The `AccountingRepo` is the primary interface for interacting with the core engine. It is a unified facade that provides access to all sub-modules.

## 📂 Importing
```typescript
import { AccountingRepo } from "@/lib/repo";
```

---

## 🏛️ General Ledger (Ledgers)

### `createAccount(params: CreateAccountParams)`
Creates a new Chart of Accounts entry.
- **Params**: `tenantId`, `code` (e.g. "1200"), `name` ("Bank"), `type` ("ASSET").

### `postJournalEntry(params: PostEntryParams)`
The core function for recording financial transactions.
- **Attributes**: Transactional, validates that debits = credits.
- **Lines**: An array of `{ accountId, debitCents, creditCents }`.

### `getBalance(accountId: string)`
Returns the current balance of an account in cents.

---

## 📄 Accounts Receivable (Invoices)

### `createInvoice(params: CreateInvoiceParams)`
Creates an invoice for a customer.
- **Status**: Defaults to `DRAFT`.
- **Note**: Does not post to the Ledger until the status changes or a payment is recorded (depending on your implementation).

### `recordInvoicePayment(invoiceId: string, bankAccountId: string, amountCents: number)`
Records a payment against an invoice and generates the balancing Journal Entry:
- `Dr Bank`
- `Cr Accounts Receivable`

---

## 🧾 Accounts Payable (Bills)

### `createBill(params: CreateBillParams)`
Records a vendor/supplier bill.

### `payBill(billId: string, bankAccountId: string)`
Sets status to `PAID` and moves money from Bank to Accounts Payable.

---

## 🏦 Banking

### `importBankTransactions(tenantId: string, transactions: any[])`
Bulk inserts bank statement lines for reconciliation.

### `applyBankRules(tenantId: string)`
Automatically categorizes pending bank transactions based on user-defined patterns (e.g., "Starbucks" -> "Meals & Entertainment").

---

## 👥 Users & Tenancy

### `createTenant(name: string, ownerUserId: string)`
Initializes a new company and assigns the creator as OWNER.

### `getMemberTenants(userId: string)`
Lists all companies a user has access to.

---

## 💡 Best Practices
1. **Always use Cents**: All monetary values are integers (cents) to avoid floating-point errors.
2. **Handle Errors**: Repository methods throw descriptive errors if a transaction fails or a balance doesn't match.
3. **Use Transactions**: If you need to perform multiple repository calls together, wrap them in a `db.transaction`.
