# Project Overview & Learning Guide 📘

**Project:** Accounting SaaS Core  
**Created:** February 7, 2026  
**Status:** MVP (Minimum Viable Product) Complete

---

## 🐣 Part 1: Explained Like I'm 5 (The Concepts)

### What is "Double-Entry Accounting"?
Imagine a **Seesaw** on a playground.
*   If one side goes **UP**, the other side MUST go **DOWN** by the exact same amount. If they don't, the seesaw breaks!
*   In accounting, every time you move money, it comes *from* somewhere and goes *to* somewhere else.
    *   **Example**: You buy a $5 coffee.
    *   $5 leaves your **Bank Account** (GOES DOWN).
    *   $5 enters your **Expense Pile** (GOES UP).
*   This ensures no money ever magically appears or disappears. It’s always tracked.

### What are Debits and Credits?
Don't think of them as "Good" or "Bad". Think of them as **Left** and **Right**.
*   **Debit (DR)** = Left Side
*   **Credit (CR)** = Right Side
*   **Rule**: The Left Side (Debits) must always equal the Right Side (Credits).

### What is a "Ledger"?
Think of a **Ledger** as a captain's logbook or a diary.
*   Every single time anything happens (you buy coffee, you get paid), you write it down in the diary.
*   You **never erase** lines in a diary. If you make a mistake, you write a new line to fix it. This is why our software is "Immutable" (unchanging history).

---

## 🏗️ Part 2: The Technology Stack (Professional)

Here is the "Engine Room" of what we built and why we chose these tools:

### 1. **Next.js (The Framework)**
*   **What it is**: A framework for React that handles both the "Frontend" (what you see) and the "Backend" (logic).
*   **Role**: It renders your Dashboard, handles the Login page, and processes your clicks.
*   **Why we used it**: It allows us to build a full-stack app in one place without needing a separate backend server.

### 2. **PostgreSQL (The Database)**
*   **What it is**: A robust, industrial-strength database system.
*   **Role**: It stores your "Ledger" (the diary) and "Accounts" (the piles of money) safely on disk.
*   **Why we used it**: It supports "ACID Transactions", which guarantees that if the power goes out while saving a transaction, it won't save "half" of it. It saves ALL or NOTHING. Critical for money.

### 3. **Drizzle ORM (The Translator)**
*   **What it is**: An Object-Relational Mapper (ORM).
*   **Role**: It translates your TypeScript code (like `db.insert(...)`) into SQL commands the database understands (`INSERT INTO...`).
*   **Why we used it**: It gives us "Type Safety". If we try to save a transaction without a Date, Drizzle yells at us *before* we run the code, preventing bugs.

### 4. **Docker (The Container)**
*   **What it is**: A platform to run applications in isolated environments.
*   **Role**: It runs your PostgreSQL database inside a "box" on your computer.
*   **Why we used it**: You didn't have to install PostgreSQL manually on Windows! You just ran `docker compose up`, and poof—a database appeared.

### 5. **NextAuth.js (The Security Guard)**
*   **What it is**: An authentication library for Next.js.
*   **Role**: It checks if your email/password matches `admin` before letting you see the Dashboard.
*   **Why we used it**: Security is hard. NextAuth handles sessions, cookies, and redirects securely so we don't have to reinvent the wheel.

---

## 🚀 Part 3: What We Built Today (Chronological)

1.  **The Foundation**:
    *   Set up the **Database Schema** (Tables for Accounts, Journal Entries, Ledger Lines).
    *   Built the **Repository** (`repo.ts`) to handle the "Double-Entry" logic (Idempotency, Balance Calculation).

2.  **The Interface (UI)**:
    *   Created a **Dashboard** to see live balances.
    *   Built a **Transaction Form** to post new entries (Expense, Revenue).
    *   Added a **Chart of Accounts** to manage categories.

3.  **The Refactor**:
    *   Cleaned up code! Moved logic to `src/lib/actions.ts` and UI to `src/components/`.
    *   Ensures the app stays organized as it grows.

4.  **Security**:
    *   Added a **Login Page**.
    *   Protected the Dashboard so only logged-in users enter.

---

## 🔮 Future Roadmap (Ideas)
*   **Invoicing**: Generate PDF invoices to send to clients.
*   **Reporting**: Profit & Loss (P&L) Statements.
*   **Multi-Tenancy**: Allow multiple companies to use the same app.

You now have a production-grade foundation. Happy coding! 💻
