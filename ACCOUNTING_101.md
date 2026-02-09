# Accounting 101: The Developer's Guide 🎓

Since we are building accounting software, it helps to understand the "Physics" of the financial world. Here is the crash course.

---

## 1. The Golden Equation ⚖️
Accounting is based on **one** unbreakable law. If this equation ever breaks, the universe (and your database) implodes.

> **Assets = Liabilities + Equity**

*   **Assets**: Stuff you **OWN** (Cash, Computer, Money people owe you).
*   **Liabilities**: Stuff you **OWE** (Credit Card debt, Loans).
*   **Equity**: What is **LEFT OVER** for you (The value of the business).

**Why?**
Imagine you buy a house for $500k. You put $100k cash down and borrow $400k.
*   **Asset** (House) = $500k
*   **Liability** (Loan) = $400k
*   **Equity** (Your slice) = $100k
*   $500k = $400k + $100k. The math works!

---

## 2. The 5 Buckets (ALORE) 🪣
Every single dollar in your database lives in one of these 5 buckets.

| Type | Name | Natural State | Meaning |
| :--- | :--- | :--- | :--- |
| **A** | **Asset** | **Debit** (Left) | Cash, Equipment, Inventory. |
| **L** | **Liability** | **Credit** (Right) | Loans, Credit Cards, Unpaid Bills. |
| **E** | **Equity** | **Credit** (Right) | Owner's Investment, Retained Earnings. |
| **R** | **Revenue** | **Credit** (Right) | Sales, Service Fees, Interest Income. |
| **E** | **Expense** | **Debit** (Left) | Rent, Wages, Coffee, Server Costs. |

**The Cheat Code:**
*   **Assets & Expenses** go UP with a **Debit**.
*   **Liabilities, Equity, & Revenue** go UP with a **Credit**.

---

## 3. Debits vs. Credits (Left vs. Right) 🥊
Forget "Good" and "Bad".
*   **Debit (Dr)** = **Left** Side.
*   **Credit (Cr)** = **Right** Side.

**The Rule:** For every transaction, `Total Debits` MUST equal `Total Credits`.

### Example 1: You Sell a Service (Invoice) 📄
You send an invoice for $1,000.
1.  **Revenue** (Sales) goes UP. (Revenue increases on the **Right** -> Credit).
2.  **Asset** (Accounts Receivable) goes UP. (Assets increase on the **Left** -> Debit).

*   **Dr** Accounts Receivable $1,000
*   **Cr** Sales Revenue $1,000
*   *Balanced!*

### Example 2: You Get Paid 💰
The client pays you that $1,000.
1.  **Asset** (Bank) goes UP. (Debit).
2.  **Asset** (Accounts Receivable) goes DOWN. (To decrease an asset, you do the opposite -> Credit).

*   **Dr** Bank Account $1,000
*   **Cr** Accounts Receivable $1,000
*   *Balanced!*

### Example 3: You Buy Lunch 🍔
You spend $20 on a business lunch.
1.  **Expense** (Meals) goes UP. (Expenses increase on **Left** -> Debit).
2.  **Asset** (Bank) goes DOWN. (To decrease asset -> Credit).

*   **Dr** Meals & Ent $20
*   **Cr** Bank Account $20
*   *Balanced!*

---

## 4. Why "Double Entry"? 👯
Why not just list transactions like a bank statement?
Because a single list doesn't tell you **WHY** money moved.

*   **Single Entry**: "-$20". (Did I lose it? Did I buy something? Did I pay a debt?)
*   **Double Entry**: "-$20 Cash, +$20 Office Supplies". (Ah, I bought supplies!)

It creates a perfect, error-checked history of *exactly* what happened.

---

## 5. How This Matches Our Code 💻
*   `repo.ts` -> `postJournalEntry`: This function ensures `sum(debits) === sum(credits)` before saving.
*   `schema.ts` -> `type`: We defined the 5 buckets (`ASSET`, `LIABILITY`...) exactly for this reason.
*   `Dashboard`: We sum up all the **Revenue** (Credits) and subtract **Expenses** (Debits) to show "Net Profit".

---

### **Homework 📚**
Next time you buy a coffee:
1.  Think: "My **Cash Asset** went DOWN (Credit)."
2.  Think: "My **Caffeine Expense** went UP (Debit)."
3.  Congratulations, you are now an accountant! 🤓
