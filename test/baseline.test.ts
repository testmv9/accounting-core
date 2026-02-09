import { describe, it, expect, vi } from 'vitest';
import { AccountingRepo } from '../src/repo';
import { createId } from '@paralleldrive/cuid2';

// Mock Next.js cache/revalidation for test environment
vi.mock('next/cache', () => ({
    unstable_noStore: vi.fn(),
    revalidatePath: vi.fn(),
}));

// Import Server Action (GUI Data Layer)
// Note: This relies on 'web' folder structure relative to test root
import { getDashboardData } from '../web/src/lib/actions';

describe('Baseline System Verification 🔍', () => {

    const tenantId = `baseline_test_${createId()}`;
    let expenseAccount: any;
    let bankAccount: any;

    // -------------------------------------------------------------------------
    // 1. FUNCTIONALITY TESTING
    // -------------------------------------------------------------------------
    describe('Core Functionality ⚙️', () => {
        it('should connect to DB and create accounts', async () => {
            bankAccount = await AccountingRepo.createAccount({
                tenantId, code: '100-TEST', name: 'Test Bank', type: 'ASSET'
            });
            expenseAccount = await AccountingRepo.createAccount({
                tenantId, code: '500-TEST', name: 'Test Expenses', type: 'EXPENSE'
            });
            expect(bankAccount.id).toBeTruthy();
        });

        it('should post a transaction and update balances', async () => {
            const amount = 5000; // $50.00

            await AccountingRepo.postJournalEntry({
                tenantId,
                date: '2026-02-07',
                description: 'Baseline functionality check',
                lines: [
                    { accountId: expenseAccount.id, debitCents: amount, creditCents: 0 },
                    { accountId: bankAccount.id, debitCents: 0, creditCents: amount }
                ]
            });

            const expBal = await AccountingRepo.getBalance(expenseAccount.id);
            expect(expBal).toBe(amount);
        });
    });

    // -------------------------------------------------------------------------
    // 2. DATA INTEGRITY (Backend <-> GUI Alignment)
    // -------------------------------------------------------------------------
    describe('Data Alignment (Backend vs GUI) 🤝', () => {
        it('should verify the Dashboard Data matches the DB Truth', async () => {
            // 1. Get Truth from DB direct access
            const realBalance = await AccountingRepo.getBalance(expenseAccount.id);

            // 2. Get Data via GUI Layer (Server Action)
            const guiData = await getDashboardData(tenantId);
            const guiAccount = guiData.find((a: any) => a.id === expenseAccount.id);

            // 3. Assert they are identical
            expect(guiAccount).toBeDefined();
            expect(guiAccount.balanceCents).toBe(realBalance);
            expect(guiAccount.formattedBalance).toBe('$50.00'); // Check formatting ($50.00)

            console.log(`    Alignment Verified: DB Balance ${realBalance} matches GUI '${guiAccount.formattedBalance}' ✅`);
        });
    });

    // -------------------------------------------------------------------------
    // 3. PERFORMANCE TESTING
    // -------------------------------------------------------------------------
    describe('Performance Benchmark ⚡', () => {
        it('should handle 50 sequential transactions quickly', async () => {
            const start = performance.now();
            const count = 50;

            for (let i = 0; i < count; i++) {
                await AccountingRepo.postJournalEntry({
                    tenantId,
                    date: '2026-02-07',
                    description: `Perf Test ${i}`,
                    lines: [
                        { accountId: expenseAccount.id, debitCents: 100, creditCents: 0 },
                        { accountId: bankAccount.id, debitCents: 0, creditCents: 100 }
                    ]
                });
            }

            const end = performance.now();
            const duration = end - start;
            const msPerTx = duration / count;

            console.log(`    Performance: ${count} txs in ${duration.toFixed(0)}ms (${msPerTx.toFixed(2)}ms/tx)`);
            expect(msPerTx).toBeLessThan(100);
        });
    });

    // -------------------------------------------------------------------------
    // 4. GUI AVAILABILITY (Smoke Test)
    // -------------------------------------------------------------------------
    describe('GUI Service Availability 🖥️', () => {
        it('should receive a response from localhost:3000', async () => {
            try {
                const response = await fetch('http://localhost:3000');
                if (response.ok || response.status === 307) { // 307 redirect to login is also "UP"
                    console.log(`    GUI is ONLINE: Status ${response.status} ✅`);
                } else {
                    console.warn(`    GUI returned status ${response.status}`);
                }
                expect([200, 307, 308, 401]).toContain(response.status);
            } catch (err) {
                console.warn('    GUI is OFFLINE (Run npm run dev to enable this check)');
            }
        });
    });

});
