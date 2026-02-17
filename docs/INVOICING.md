# Invoicing & Accounts Receivable 📄

The invoicing module handles the lifecycle of sales, from drafting a request for payment to receiving cash in the bank.

---

## 🔄 Invoice Lifecycle

### 1. Draft
- **Action**: Create an invoice but don't finalize it.
- **Ledger Impact**: None. The transaction is not yet "real" in accounting terms.

### 2. Approval (Sent)
- **Action**: Finalize the invoice and send it to the customer.
- **Accounting Impact**:
  - **Debit**: Accounts Receivable (Asset) - *Someone owes us money.*
  - **Credit**: Sales Revenue (Revenue) - *We earned money.*
- **Status**: `AWAITING_PAYMENT`.

### 3. Payment
- **Action**: Record that the customer has paid (e.g., via bank transfer).
- **Accounting Impact**:
  - **Debit**: Bank Account (Asset) - *We have the cash now.*
  - **Credit**: Accounts Receivable (Asset) - *The debt is cleared.*
- **Status**: `PAID`.

---

## 🛠️ Key Operations

### Creating a Customer
Before creating an invoice, you must have a Customer record:
```typescript
const customer = await AccountingRepo.createCustomer({
    tenantId,
    name: "Acme Corp",
    email: "billing@acme.com"
});
```

### Creating an Invoice
```typescript
const invoice = await AccountingRepo.createInvoice({
    tenantId,
    customerId,
    invoiceNumber: "INV-1001",
    issueDate: "2026-02-12",
    dueDate: "2026-03-12",
    lines: [
        { 
            description: "Consulting Services", 
            quantity: 1, 
            unitPriceCents: 500000, // $5,000.00
            revenueAccountId: "rev_123" 
        }
    ]
});
```

### Recording Payment
Once the money hits the bank:
```typescript
await AccountingRepo.recordInvoicePayment(invoice.id, bankAccountId, 500000);
```

---

## 📊 Reporting
- **Aged Receivables**: This report shows how much money is owed to you, categorized by how "old" the debt is (0-30 days, 31-60 days, etc.).
- **Revenue by Customer**: Tracks which clients are providing the most value.
