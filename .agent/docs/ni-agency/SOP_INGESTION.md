# SOP: Financial Data Ingestion Protocol

This Standard Operating Procedure defines the workflow for converting raw files (PDFs, Images, CSVs) into structured ledger entries using the NI Agency.

---

## 1. Trigger
This SOP is triggered when a file is uploaded to the **NI Workroom** or a contextual drop-zone.

## 2. Extraction Phase (Intake Clerk)
The **Intake Clerk** must analyze the file using multimodal vision to extract the following core data points:
- **Transaction Type**: Is this a Bill (Expense from Supplier)? An Invoice (Revenue for Customer)? Or a Bank Statement (Multiple transactions)?
- **Entity**: Detect the Name of the Supplier or Customer.
- **Date**: The issue date of the document.
- **Amounts**:
    - Subtotal
    - Tax/GST amount
    - Total Amount
- **Line Items**: Breakdown of specific goods or services, including quantities and unit prices.

## 3. Categorization & Intelligence
1. **Deterministic Verification**: A script must verify if `Subtotal + Tax == Total`. If they do not match, the AI must explicitly flag the "Math Discrepancy" and cannot proceed to auto-draft.
2. **Context-Aware Filtering (Token Efficiency)**: Only the most relevant nominal accounts (e.g., top 10 Expense accounts) are provided to the AI for categorization, reducing token overhead.
3. **Account Matching**: Suggest a nominal account from the filtered list.
4. **Duplicate Detection**: A deterministic query checks for existing transactions with the same Date, Entity, and Amount.

## 4. Proposal Generation
The Clerk provides a "Draft Proposal" to the human user:
- *"I've analyzed the PDF 'INV-2024-001'. It's a Bill from Spark for $450.00. I recommend posting this to 'Utilities'. Would you like to draft this?"*

## 5. Execution (Super User Action)
Upon human approval, the Clerk calls the appropriate tool:
- **Bill**: `create_bill`
- **Invoice**: `create_invoice`
- **Bank Statement**: `import_bank_transactions`

---

## 🛑 Exception Handling (Safety Protocols)
- **Handwritten Documents**: If the document is handwritten and legibility is < 90%, the Clerk must flag it for "Manual Intervention Required" and *cannot* propose an entry.
- **Unclear Entity**: If a new Supplier/Customer is detected that doesn't exist in Navera, the Clerk must ask to create them first via `create_customer` or `create_supplier`.
- **Currency Mismatch**: If the currency is not USD, the AI must highlight this immediately and ask for the exchange rate or manual entry.
