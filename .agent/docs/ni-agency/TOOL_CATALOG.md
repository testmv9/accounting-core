# NI Agency: Tool Catalog & AI Capacities

This document maps the technical Server Actions of the Navera platform to the functional "Abilities" of the AI Agents. It serves as the reference for building AI Tool Definitions.

---

## 🏗️ Core Ledger Tools
| Tool Name | Server Action | Agent Persona | Description |
|-----------|---------------|---------------|-------------|
| `post_entry` | `postTransactionAction` | Clerk/Partner | Records a manual journal entry with debits/credits. |
| `create_account` | `createAccountAction` | Partner | Opens a new nominal account in the Chart of Accounts. |
| `archive_account`| `archiveAccountAction`| Partner | Soft-deletes/archives an unused account. |

## 🧾 Billing & AR Tools
| Tool Name | Server Action | Agent Persona | Description |
|-----------|---------------|---------------|-------------|
| `create_invoice` | `createInvoiceAction` | Clerk | Drafts a new customer invoice from extracted data. |
| `approve_invoice`| `approveInvoiceAction`| Partner | Finalizes a draft invoice and posts to AR. |
| `pay_invoice` | `payInvoiceAction` | Clerk | Records payment against an invoice (Debit Bank, Credit AR). |
| `void_invoice` | `voidInvoiceAction` | Partner | Cancels an invoice and reverses ledger impact. |
| `create_customer`| `createCustomerAction`| Clerk | Adds a new customer entity to the directory. |

## 💸 Expenses & AP Tools
| Tool Name | Server Action | Agent Persona | Description |
|-----------|---------------|---------------|-------------|
| `create_bill` | `createBillAction` | Clerk | Drafts a new supplier bill/expense from a file. |
| `approve_bill` | `approveBillAction` | Partner | Finalizes a draft bill and posts to AP. |
| `pay_bill` | `payBillAction` | Clerk | Records payment to a supplier (Credit Bank, Debit AP). |
| `create_supplier`| `createSupplierAction`| Clerk | Adds a new supplier entity to the directory. |

## 🏦 Banking & Reconciliation Tools
| Tool Name | Server Action | Agent Persona | Description |
|-----------|---------------|---------------|-------------|
| `import_tx` | `importBankTransactionAction`| Clerk | Adds a raw transaction to the bank feed. |
| `reconcile` | `reconcileTransactionAction` | Clerk | Matches a feed transaction to a journal entry. |
| `match_tx` | `matchBankTransactionAction` | Clerk | Matches a feed transaction to a specific Bill or Invoice. |
| `create_rule` | `createBankRuleAction` | Partner | Automates future categorization for recurring descriptions. |
| `categorize_tx` | `categorizeBankTransactionAction`| Clerk | Direct-posts an expense/revenue without a Bill/Invoice. |

## 📊 Analytical Tools (Read-Only)
| Tool Name | Server Action | Agent Persona | Description |
|-----------|---------------|---------------|-------------|
| `get_pnl` | `getPLReportData` | Partner | Fetches Profit & Loss for a specific date range. |
| `get_balance` | `getBalanceSheetData` | Partner | Fetches the Balance Sheet as of a specific date. |
| `get_ledger` | `getLedgerData` | Partner | Lists full transaction history for auditing. |
| `get_debtors` | `getAgedReceivablesAction` | Partner | Analyzes outstanding customer debt by aging bucket. |
| `get_snapshot`| `getFinancialSnapshot` | Partner | Fetches Ground Truth kpis and audit flags for strategic advice. |

---

## 🛡️ Constraint: Agent Integrity
1. **Approval Required**: No tool can execute a transaction without a final human "Proceed".
2. **Contextual Tooling**: The system must filter account lists (e.g., only Revenue accounts for `create_invoice`) before sending context to the AI to minimize tokens.
3. **Deterministic Pre-flight**: Tools that modify data must pass a programmatic validation script (e.g., math balance check) before the AI is allowed to suggest the action to the user.
