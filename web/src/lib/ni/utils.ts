/**
 * DETERMINISTIC VALIDATION UTILITIES
 * 
 * Performance of hard-coded accounting logic to eliminate AI hallucination.
 * As per NI_ARCHITECTURE.md, these scripts run BEFORE any AI proposal is shown.
 */

export interface ExtractedData {
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    lineItems: Array<{
        description: string;
        amountCents: number;
    }>;
}

/**
 * Verifies the mathematical integrity of extracted financial data.
 */
export function verifyMathIntegrity(data: ExtractedData): { isValid: boolean; error?: string } {
    const calculatedTotal = data.subtotalCents + data.taxCents;
    const lineItemTotal = data.lineItems.reduce((sum, item) => sum + item.amountCents, 0);

    // Check 1: Subtotal + Tax == Total
    if (Math.abs(calculatedTotal - data.totalCents) > 1) { // 1 cent tolerance for rounding
        return {
            isValid: false,
            error: `Mathematical discrepancy: Subtotal (${data.subtotalCents}) + Tax (${data.taxCents}) does not equal Total (${data.totalCents}).`
        };
    }

    // Check 2: Sum of Line Items == Subtotal (or Total depending on if tax is inclusive/exclusive)
    // For this SOP, we assume line items sum to the subtotal.
    if (Math.abs(lineItemTotal - data.subtotalCents) > 1) {
        return {
            isValid: false,
            error: `Line item mismatch: Individual items sum to ${lineItemTotal}, but recorded subtotal is ${data.subtotalCents}.`
        };
    }

    return { isValid: true };
}

/**
 * High-precision rounding to prevent float errors
 */
export function toCents(amount: number): number {
    return Math.round(amount * 100);
}

/**
 * DUPLICATE DETECTION LAYER
 * Aligns with SOP_INGESTION.md Section 3.4.
 * 
 * Compares extracted data against existing records.
 */
export function isPotentialDuplicate(extracted: { entityName: string, totalCents: number, date: string }, existingRecords: any[]): boolean {
    return existingRecords.some(record => {
        const sameAmount = record.totalCents === extracted.totalCents;
        const sameDate = record.date === extracted.date || record.issueDate === extracted.date;
        // Simple name match for now
        const sameEntity = record.supplier?.name?.toLowerCase() === extracted.entityName.toLowerCase() ||
            record.customer?.name?.toLowerCase() === extracted.entityName.toLowerCase();

        return sameAmount && sameDate && sameEntity;
    });
}
