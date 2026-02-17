'use server'

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getFinancialSnapshot } from './snapshot';
import { PERSONA_PROMPTS } from './prompts';
import { ensureAuth } from '../actions';

/**
 * NI ADVISOR ENGINE: Senior Partner Logic
 * 
 * Phase 4: Strategic Analysis and Ground-Truth Insights.
 */

export async function askSeniorPartnerAction(question: string, history: any[] = []) {
    const { tenantId } = await ensureAuth();

    // 1. Fetch Ground Truth Snapshot
    // This ensures the AI speaks only facts.
    const snapshot = await getFinancialSnapshot(tenantId);

    if (snapshot.status === 'ERROR') {
        return {
            success: false,
            error: "I'm sorry, I'm having trouble accessing your financial records right now."
        };
    }

    // 2. Generate Insightful Response
    try {
        const { text } = await generateText({
            model: google('models/gemini-1.5-pro-latest'),
            system: PERSONA_PROMPTS.SENIOR_PARTNER,
            messages: [
                {
                    role: 'system',
                    content: `CURRENT FINANCIAL SNAPSHOT (GROUND TRUTH):
                    ${JSON.stringify(snapshot, null, 2)}
                    
                    Use this data to answer the user's question. If the data isn't available in the snapshot, admit it. 
                    Be strategic, professional, and focus on the health of the business.`
                },
                ...history.map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content
                })),
                {
                    role: 'user',
                    content: question
                }
            ]
        });

        return {
            success: true,
            content: text
        };
    } catch (err: any) {
        console.error("Senior Partner failed:", err);
        return {
            success: false,
            error: "Failed to connect with the Senior Partner."
        };
    }
}
