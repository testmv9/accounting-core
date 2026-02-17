/**
 * SUPER USER VERIFICATION: PHASE 2 VALIDATION ENGINE
 * 
 * This test proves the "Anti-Hallucination" layer works by feeding it
 * both mathematically correct and incorrect data.
 */
import { verifyMathIntegrity } from './src/lib/ni/utils.ts';

const testCases = [
    {
        name: "Valid Invoice (Correct Math)",
        data: {
            subtotalCents: 10000,
            taxCents: 1500,
            totalCents: 11500,
            lineItems: [{ description: "Consulting", amountCents: 10000 }]
        },
        expected: true
    },
    {
        name: "Hallucinated Total (Mathematical Discrepancy)",
        data: {
            subtotalCents: 10000,
            taxCents: 1500,
            totalCents: 12000, // Error: 10000 + 1500 != 12000
            lineItems: [{ description: "Consulting", amountCents: 10000 }]
        },
        expected: false
    }
];

console.log("🏛️ NI AGENCY: Phase 2 Verification Sequence...");

testCases.forEach(tc => {
    const result = verifyMathIntegrity(tc.data);
    if (result.isValid === tc.expected) {
        console.log(`✅ TEST PASSED: ${tc.name}`);
    } else {
        console.error(`❌ TEST FAILED: ${tc.name}`);
        console.error(`   Error received: ${result.error}`);
    }
});
