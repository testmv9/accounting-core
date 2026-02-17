# Accounting Concepts for Developers 🎓

Accounting is basically a specialized type of math with its own physics. Here's a developer-friendly breakdown.

---

## 1. The Seesaw Rule (Double-Entry)
In accounting, money never "disappears." It only moves from one bucket to another. To keep things balanced, every transaction has two sides:
- **Debit (DR)**: The Left Side.
- **Credit (CR)**: The Right Side.

**The Rule**: `Sum(Debits)` MUST ALWAYS equal `Sum(Credits)`.

---

## 2. The Five Buckets (ALORE)
Every account in the system belongs to one of these five categories:

| Type | Increase With | Examples |
| :--- | :--- | :--- |
| **Asset** | Debit | Cash, Bank, Accounts Receivable |
| **Liability** | Credit | Loans, Accounts Payable, Taxes |
| **Equity** | Credit | Owner's Investment, Retained Earnings |
| **Revenue** | Credit | Sales, Service Fees |
| **Expense** | Debit | Rent, Salaries, Software |

---

## 3. Real-World Examples

### Example: Selling a Service ($100)
1. **Asset** (Accounts Receivable) increases by $100 -> **Debit $100**.
2. **Revenue** (Sales) increases by $100 -> **Credit $100**.

### Example: Paying for Coffee ($5)
1. **Expense** (Meals) increases by $5 -> **Debit $5**.
2. **Asset** (Bank) decreases by $5 -> **Credit $5**.

---

## 4. Why Use Double-Entry?
Single-entry (like a spreadsheet of expenses) tells you what you spent.
Double-entry tells you **what you spent it on AND where the money came from**. It prevents errors because if the sides don't match, you know you've missed something.

---

## 5. Cents Only! 💵
Our system stores all money as **integers in cents** (or the smallest currency unit).
- **Correct**: `$10.50` -> `1050`
- **Incorrect**: `$10.50` -> `10.5` (Floating-point precision errors)

Always multiply by 100 before saving and divide by 100 before displaying.
