# Accounting SaaS Core 🏢💰

A professional-grade, multi-tenant double-entry accounting engine built with **Next.js 15**, **Drizzle ORM**, and **PostgreSQL**.

---

## 🔥 Features
- **Double-Entry Engine**: Unbreakable transactional integrity for financial data.
- **Multi-Tenancy**: Support multiple companies with isolated data and user permissions.
- **Full Ledger**: Automatic balance calculations and audit-ready journal entries.
- **Invoicing & Billing**: Comprehensive Accounts Receivable and Payable flows.
- **Banking Integration**: Import transactions and apply automated reconciliation rules.
- **Modern Stack**: Blazing fast UI and type-safe backend.

---

## 📚 Documentation
Welcome to the project! We have organized the documentation into specialized guides:

### 🚀 Getting Started
1. **[Architecture Overview](docs/ARCHITECTURE.md)**: Deep dive into the tech stack and system design.
2. **[Domain Models](docs/DOMAIN_MODELS.md)**: Understand the data structures (Tenants, Accounts, Journals).
3. **[Accounting 101](docs/ACCOUNTING_CONCEPTS.md)**: A crash course on Debits, Credits, and the "Seesaw Rule".

### 🛠️ Developer Resources
- **[API Reference](docs/API_REFERENCE.md)**: How to use the `AccountingRepo` in your code.
- **[Testing Guide](TESTING_GUIDE.md)**: Instructions for running the test suite.
- **[Roadmap](ROADMAP.md)**: Upcoming features and current progress.

---

## 🏗️ Quick Start (Local Setup)

1. **Start the Database**:
   ```bash
   docker compose up -d
   ```
2. **Setup Environment**:
   Copy `.env.example` to `.env` and fill in the details.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run the Dashboard**:
   ```bash
   cd web && npm run dev
   ```

---

## 🐣 Explained Like I'm 5 (The Seesaw)
Imagine a **Seesaw** on a playground.
- If one side goes **UP**, the other side MUST go **DOWN** by the exact same amount. If they don't, the seesaw breaks!
- In accounting, every time you move money, it comes *from* somewhere and goes *to* somewhere else.
- This ensures no money ever magically appears or disappears. It’s always tracked.

---

## 🔮 Our Vision
To provide the most robust, open, and developer-friendly accounting infrastructure for the next generation of SaaS applications.

---

*Built with ❤️ for professional accountants and developers alike.*
