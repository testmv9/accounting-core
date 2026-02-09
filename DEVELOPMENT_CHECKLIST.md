# Navera Development Checklist

## Phase 1: Core Accounting Engine 🏗️
- [x] Double-Entry Ledger System
- [x] Chart of Accounts
- [x] Journal Entry Posting
- [x] Financial Reports (P&L, Balance Sheet)
- [x] Tenant-based isolation

## Phase 2: Sales & Revenue (Accounts Receivable) 📈
- [x] Customer Management
- [x] Invoicing (Draft → Approved → Sent → Paid)
- [x] Invoice Voiding & Reversals
- [x] Aged Receivables Report

## Phase 3: Expenses & Purchasing (Accounts Payable) 💸
- [x] Supplier Management
- [x] Bill Tracking (Draft → Approved → Paid)
- [x] Expense Account Pairing
- [x] AP Revisions & Voiding

## Phase 4: Banking & Reconciliation 🏦
- [x] Bank Transactions Schema (`bank_transactions` table)
- [x] Bank Feed Repository (`BankingRepo`)
- [x] Bank Reconciliation UI (`/banking/reconcile`)
- [x] Manual Categorization (Direct to GL)
- [x] Automated Matching (Pair with Invoices/Bills)
- [x] Bank Rules (Automation Suggestion)
- [x] CSV Import & Column Mapping
- [x] Bank Rules Engine (Full Automation)
- [ ] PDF Data Extraction (AI OCR)

## Phase 5: Multi-Tenancy & Live Auth 🔐
- [x] Real Database-backed Authentication (NextAuth + Users table)
- [x] Tenant Schema & Table Isolations
- [x] Active Tenant Session Context
- [x] Dynamic Action Security (Actions auto-scoped to User)
- [x] Multi-user Membership Logic

## The Future 🚀
- [ ] Multi-Currency Support
- [ ] Fixed Assets & Depreciation
- [ ] Inventory Management
- [ ] Granular Role-based Permissions (RW/RO)
- [ ] Audit Logs (Entry Tracking)
- [ ] API for external integrations
