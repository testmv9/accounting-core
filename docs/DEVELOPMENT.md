# Development & Setup 🛠️

Follow these instructions to set up your local development environment and contribute to the Accounting SaaS Core.

---

## 🏗️ Prerequisites
- **Node.js**: Version 18 or higher.
- **Docker**: For running the local PostgreSQL database.
- **npm**: Package manager.

---

## ⚙️ Environment Configuration
Create a `.env` file in the root directory (and in the `web/` directory if needed). Use `.env.example` as a template.

### Key Variables:
- `DATABASE_URL`: The connection string for PostgreSQL (e.g., `postgres://user:pass@localhost:5432/accounting`).
- `AUTH_SECRET`: A secret string used for session encryption.
- `NEXT_PUBLIC_APP_URL`: The URL where the app is hosted (e.g., `http://localhost:3000`).

---

## 🚀 Running the App

### 1. Database
We use Docker to simplify database setup.
```bash
docker compose up -d
```

### 2. Migrations
To push schema changes to the database:
```bash
npx drizzle-kit push
```

### 3. Start Development Server
```bash
cd web
npm run dev
```

---

## 🧪 Testing & Debugging
We use **Vitest** for unit and integration testing.

### Running Tests:
```bash
npm test
```

### Utility Scripts:
The `scripts/` directory contains tools for database maintenance and debugging:
- `npm run verify-all`: Checks for balance inconsistencies in the ledger.
- `tsx scripts/seed_aged_receivables.ts`: Generates sample data for testing reports.

---

## 🎨 Styling Guidelines
- **CSS**: We use a combination of Vanilla CSS for core components and Tailwind CSS for rapid layout prototyping.
- **Icons**: Use [Lucide React](https://lucide.dev) for all vector graphics.

---

## 🛡️ Code Quality
- **Type Safety**: Avoid using `any`. Define interfaces in `src/types.ts`.
- **Commits**: Use descriptive commit messages (e.g., `feat: add invoice payment flow`).
