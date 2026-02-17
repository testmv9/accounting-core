'use server'

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { verifyMathIntegrity, toCents, isPotentialDuplicate } from './utils';
import { getLedgerData, ensureAuth } from '../actions';

/**
 * NI VISION ENGINE: Intake Clerk Logic
 * 
 * Specifically designed for Phase 2 & 3: Multimodal Extraction & Drafting.
 * Aligns with SOP_INGESTION.md and NI_ARCHITECTURE.md.
 */

import { VISION_SYSTEM_PROMPT } from './prompts';

const ExtractionSchema = z.object({
    type: z.enum(['BILL', 'INVOICE', 'RECEIPT']),
    entityName: z.string().describe('Name of the vendor/supplier or customer'),
    date: z.string().describe('ISO date found on the document'),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    currency: z.string().default('USD'),
    lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        total: z.number()
    }))
});

export async function analyzeDocumentAction(base64File: string, mimeType: string) {
    const { tenantId } = await ensureAuth();

    // 1. AI Extraction Phase (Intake Clerk)
    // We use Gemini 1.5 Pro via Vercel AI SDK for high-fidelity vision processing.
    const { object: extracted } = await generateObject({
        model: google('models/gemini-1.5-pro-latest'),
        schema: ExtractionSchema,
        messages: [
            {
                role: 'system',
                content: VISION_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Extract all financial data from this document.' },
                    { type: 'file', data: base64File, mimeType }
                ]
            }
        ]
    });

    // 2. Deterministic Verification Layer (Anti-Hallucination)
    // As per NI_ARCHITECTURE.md, we perform hard-coded math checks before proposing to user.
    const totalCents = toCents(extracted.total);
    const centData = {
        subtotalCents: toCents(extracted.subtotal),
        taxCents: toCents(extracted.tax),
        totalCents,
        lineItems: (extracted.lineItems as any[]).map(l => ({
            description: l.description,
            amountCents: toCents(l.total)
        }))
    };

    const validation = verifyMathIntegrity(centData);

    if (!validation.isValid) {
        return {
            success: false,
            error: validation.error,
            rawExtracted: extracted // Still return it for UI to allow manual correction
        };
    }

    // 2.1 Duplicate Detection (SOP_INGESTION Section 3.4)
    const existing = await getLedgerData(tenantId);
    const isDup = isPotentialDuplicate({
        entityName: extracted.entityName,
        totalCents,
        date: extracted.date
    }, existing);

    if (isDup) {
        return {
            success: false,
            error: `Duplicate detected: A transaction from '${extracted.entityName}' for $${(totalCents / 100).toFixed(2)} on ${extracted.date} already exists in the ledger.`,
            isDuplicate: true
        };
    }

    // 3. Success - Propose the draft
    return {
        success: true,
        data: {
            ...extracted,
            ...centData,
            status: 'VALIDATED'
        }
    };
}

/**
 * PHASE 3: OPERATIONAL TOOLS
 * 
 * Logic to actually move data into the ledger.
 */
import {
    getSuppliersAction,
    getCustomersAction,
    getDashboardData,
    createBillAction,
    createInvoiceAction
} from '../actions';

export async function getIngestionContextAction() {
    const { tenantId } = await ensureAuth();

    const [suppliers, customers, accounts] = await Promise.all([
        getSuppliersAction(tenantId),
        getCustomersAction(tenantId),
        getDashboardData(tenantId)
    ]);

    // Filter accounts based on common usage (Expenses vs Revenue)
    // As per NI_ARCHITECTURE.md (Token Efficiency)
    return {
        suppliers: suppliers.map(s => ({ id: s.id, name: s.name })),
        customers: customers.map(c => ({ id: c.id, name: c.name })),
        expenseAccounts: accounts.filter(a => a.type === 'EXPENSE').map(a => ({ id: a.id, name: a.name, code: a.code })),
        revenueAccounts: accounts.filter(a => a.type === 'REVENUE').map(a => ({ id: a.id, name: a.name, code: a.code }))
    };
}

export async function recordDocumentAction(params: {
    type: 'BILL' | 'INVOICE' | 'RECEIPT',
    entityId: string,
    date: string,
    dueDate: string,
    accountId: string,
    lines: Array<{ description: string, quantity: number, unitPrice: number }>
}) {
    const { tenantId } = await ensureAuth();

    try {
        if (params.type === 'BILL' || params.type === 'RECEIPT') {
            await createBillAction(
                params.entityId,
                params.date,
                params.dueDate || params.date,
                params.lines.map(l => ({
                    ...l,
                    expenseAccountId: params.accountId
                }))
            );
        } else {
            await createInvoiceAction(
                params.entityId,
                params.date,
                params.dueDate || params.date,
                params.lines.map(l => ({
                    ...l,
                    revenueAccountId: params.accountId
                }))
            );
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
