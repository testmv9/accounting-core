# Navera Technology Stack

This document tracks the core technologies, platforms, and tools powering the Navera Accounting platform.

## 🏗️ Core Framework & Logic
- **Next.js 15.2.6**: The React framework for production. Handles Server Components, Server Actions, and Routing.
- **TypeScript**: Ensures type safety and catches bugs during development.
- **Node.js**: The runtime environment.

## 🐘 Data & Storage
- **Neon.tech**: Serverless PostgreSQL database for cloud-scale data storage.
- **Drizzle ORM**: Type-safe database client used for schema management and queries.
- **CUID2**: Used for generating secure, collision-resistant unique IDs for all database records.

## 🛡️ Security & Authentication
- **NextAuth.js (v5)**: Manages secure user sessions, login, and registration.
- **bcrypt**: (Planned) For secure password hashing.
- **GitHub Branch Protection**: Safeguards the `main` branch from accidental breaking changes.

## 🚀 Hosting & DevOps
- **Vercel**: Global edge hosting and automated CI/CD deployments.
- **GitHub**: Source control and repository management.

## 🎨 Design & UI
- **Vanilla CSS + Tailwind CSS**: Responsive, high-performance styling.
- **Lucide React**: Clean, professional vector icons.
- **Responsive Web Design**: Optimized for Desktop and iPhone viewports.

## 📊 Accounting Logic
- **Double-Entry Engine**: Custom TypeScript implementation of ledger principles (Debits/Credits).
- **Multi-Tenancy**: Architecture designed to isolate data for multiple separate business entities on one platform.

---
*Last Updated: 2026-02-10*
