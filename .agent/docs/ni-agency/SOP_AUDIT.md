# SOP: Audit & Reconciliation Excellence

This protocol defines how the **Senior Partner** and **Intake Clerk** ensure the integrity of the Navera Ledger and provide proactive auditing.

---

## 1. Daily Bank Reconciliation
The **Intake Clerk** monitors the bank feeds. For every unreconciled transaction:
1. **Rule Match**: Check if the description matches an existing `Bank Rule`.
2. **Invoice/Bill Match**: Scan for outstanding Invoices or Bills with the same amount (± 0.05% for rounding).
3. **Suggestion**: Present the suggestion to the user: *"Found a deposit for $1,250. This matches Invoice #102 for Acme Corp. Reconcile?"*

## 2. Integrity Audit (Senior Partner)
The **Senior Partner** periodically runs an integrity check:
- **Balance Sheet Equality**: Ensures `Assets == Liabilities + Equity`.
- **Negative Cash**: Warns if a bank account balance drops below zero.
- **Aging Debt**: Identifies invoices > 90 days overdue.

## 3. Training & Test Scenarios
The Architect (Antigravity) uses the following test scenarios to validate the AI agents:

### Scenario A: The "Partial Match"
- **Input**: Bank withdrawal of $500.
- **State**: User has two bills for $250 each from the same supplier.
- **Correct AI Response**: The Clerk should *not* auto-reconcile. It should ask the user if this withdrawal covers both bills or if it's a separate entry.

### Scenario B: The "Revenue Mistaken for Expense"
- **Input**: A CSV row with a positive amount described as "Refund from Amazon."
- **Correct AI Response**: The Clerk should recognize this is a contra-expense (positive amount but descriptive of a vendor) rather than a Sales entry.

### Scenario C: The "Duplicate Entry"
- **Input**: User uploads the same PDF twice in 5 minutes.
- **Correct AI Response**: The Intake Clerk must block the second ingestion and notify: *"It looks like 'Invoice_abc.pdf' has already been drafted. Shall I view the existing entry?"*

---

## 📈 Performance Tracking
AI Agent performance is measured by:
- **Extraction Accuracy**: Percentage of correct fields vs human-corrected fields.
- **Reconciliation Success**: Number of auto-matches accepted by the user without modification.
- **Intervention Rate**: How often the AI successfully stops a user from making an out-of-balance entry.
