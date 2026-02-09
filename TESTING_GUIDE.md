# Baseline Testing Guide 🧪

This document explains the **Baseline Test Suite** (`test/baseline.test.ts`). This script is your "health check" to ensure the entire system—from database to user interface data—is functioning correctly.

## 🚀 How to Run
Open your terminal and run:
```powershell
npm run test:baseline
```

---

## 🔍 What This Test Does (Step-by-Step)

The script performs 4 critical checks in order:

### 1. Functional Testing (The Core Logic)
*   **Goal**: Prove the accounting engine works.
*   **Action**:
    1.  Creates a randomized "Test Tenant" (so we don't mess up real data).
    2.  Creates a **Bank Account** (Asset) and **Expense Account** (Expense).
    3.  Posts a $50.00 transaction between them.
*   **Verification**: Checks that the Bank balance is `-5000` (Credit) and Expense balance is `+5000` (Debit).

### 2. Data Integrity (Frontend vs Backend Alignment)
*   **Goal**: Ensure the user sees exactly what is in the database.
*   **Action**:
    1.  Fetches the "True Balance" directly from the database (Backend).
    2.  Fetches the "Display Balance" via the `getDashboardData` function (Frontend Logic).
*   **Verification**: Assets that `Backend Value === Frontend Value`. This prevents "ghost data" bugs where the UI shows something different from reality.

### 3. Performance Benchmarking
*   **Goal**: Ensure the system is fast enough for commercial use.
*   **Action**:
    1.  Runs a loop of **50 Transactions** effectively simultaneously.
    2.  Measures the total time taken.
*   **Verification**: Fails if the average transaction takes longer than **100ms**. (Ideally, it should be <20ms).

### 4. GUI Availability (Smoke Test)
*   **Goal**: Ensure the website isn't crashing.
*   **Action**:
    1.  Sends a HTTP request to `http://localhost:3000`.
*   **Verification**: Checks if the server replies with `200 OK` (Online) or `307 Redirect` (Protected/Login Page). If existing connection fails, it warns you to start the server.

---

## 📝 How to Create New Tests

We use `vitest`, which follows the standard "Describe - It - Expect" pattern:

```typescript
// 1. DESCRIBE the feature you are testing
describe('New Feature Name', () => {

    // 2. DEFINE a specific scenario ("It should do X")
    it('should calculate tax correctly', async () => {
    
        // ARRANGE: Set up the data
        const amount = 100;
        
        // ACT: Run your code
        const tax = calculateTax(amount);
        
        // ASSERT: Check the result
        expect(tax).toBe(15);
    });
    
});
```

You can duplicate `test/baseline.test.ts` to verify new features like Invoicing or Multi-Currency in the future!
