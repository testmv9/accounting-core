# Navera Invoicing System Plan

## 1. Overview
The Invoicing module allows users to generate professional sales invoices, track amounts owed by customers (Accounts Receivable), and record payments.

## 2. Core Workflows

### A. Create & Approve Invoice
1.  User creates a **Draft** invoice.
    - Select Customer.
    - Add Line Items (Description, Qty, Price, Revenue Account).
2.  User **Approves** the invoice.
    - **Accounting Impact (Automatic Journal):**
        - **Debit**: Accounts Receivable (Asset)
        - **Credit**: Sales/Revenue Account
    - Status changes to **AWAITING PAYMENT**.

### B. Receive Payment
1.  User records a payment against the invoice.
2.  **Accounting Impact (Automatic Journal):**
    - **Debit**: Bank Account (Cash in)
    - **Credit**: Accounts Receivable (Clears the debt)
    - Status changes to **PAID**.

## 3. Database Schema Updates

### New Table: `customers`
- **id**: unique string
- **name**: string (e.g., "Acme Corp")
- **email**: string (optional)
- **address**: text (optional, for PDF)

### New Table: `invoices`
- **id**: unique string
- **customer_id**: link to `customers`
- **invoice_number**: string (e.g., "INV-001")
- **issue_date**: string (YYYY-MM-DD)
- **due_date**: string (YYYY-MM-DD)
- **status**: enum ('DRAFT', 'SENT', 'PAID', 'VOID')
- **total_amount**: integer (cents)

### New Table: `invoice_lines`
- **id**: unique string
- **invoice_id**: link to `invoices`
- **description**: string
- **quantity**: number
- **unit_price**: integer (cents)
- **account_id**: link to Revenue Account

## 4. UI Screens Required

1.  **Dashboard Widget**: "Total Owed to You" (Sum of Awaiting Payment invoices).
2.  **Invoices List**: Filterable table (All, Draft, Awaiting Payment, Paid).
3.  **Invoice Editor**:
    - Dynamic form to add/remove lines.
    - Customer selector (autocomplete).
4.  **Invoice View/Print**:
    - Clean HTML layout suitable for "Print to PDF".

## 5. Implementation Steps
1.  **Schema First**: Add tables to `schema.ts`.
2.  **Repo Logic**: Functions to create Invoice and *post the tied journal entry*.
3.  **UI - List**: Page to see all invoices.
4.  **UI - Editor**: The builder form.
5.  **UI - Actions**: "Approve" and "Record Payment" buttons.

## 6. Future Enhancements
- **Emailing**: Send PDF directly from Navera (using Resend/Nodemailer).
- **Recurring Invoices**: Auto-generate invoices on a schedule.
