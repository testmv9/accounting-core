# Domain Models 🧩

Understanding the data structure is key to building on top of the Accounting SaaS Core.

---

## 🏗️ Core Entities

### **Tenant**
A container for all professional data. A single installation of this software can host thousands of Tenants.
- `id`: Unique identifier (CUID).
- `slug`: URL-friendly name.

### **Account (Chart of Accounts)**
The categories where money is stored or tracked.
- **Types**: `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE`.
- **Code**: A numbering system (e.g., 1000-1999 for Assets).

### **Journal Entry & Ledger Line**
The atomic record of movement.
- **Journal Entry**: The "header" (Who, what, when).
- **Ledger Line**: The "detail" (Which account, how much, Debit or Credit).
- **Rule**: Every Entry MUST have at least 2 lines that sum to zero.

---

## 📄 Sales & Purchasing

### **Customer & Supplier**
External parties the business interacts with.
- **Customer**: Owes us money (Assets).
- **Supplier**: We owe them money (Liabilities).

### **Invoice**
A request for payment sent to a Customer.
- **Lines**: Itemized details (Quantity, Unit Price).
- **Integration**: Linked to the General Ledger via a "Revenue Account".

### **Bill**
An invoice received from a Supplier.
- **Lines**: Itemized details.
- **Integration**: Linked to the General Ledger via an "Expense Account".

---

## 🏦 Banking

### **Bank Transaction**
A line item from a bank statement (unprocessed).
- **Status**: `PENDING`, `MATCHED`, `EXCLUDED`.
- **Matching**: The process of linking a bank line to a Journal Entry (Reconciliation).

### **Bank Rule**
A simple "If-Then" logic for automation.
- **Pattern**: "Uber"
- **Target Account**: "Travel / Taxi" (Expense).

---

## 🔐 Identity

### **User**
An individual person with an email and password.
### **Membership**
The bridge between Users and Tenants. Links a user to a company with a specific **Role** (OWNER or MEMBER).
