'use client'

import { useFormStatus } from 'react-dom';
import { voidInvoiceAction } from '../lib/actions';

export function VoidButton({ invoiceId }: { invoiceId: string }) {
    const { pending } = useFormStatus();

    return (
        <form action={voidInvoiceAction.bind(null, invoiceId)}
            onSubmit={(e) => {
                if (!confirm('Are you sure you want to VOID this invoice? This action cannot be undone.')) {
                    e.preventDefault();
                }
            }}>
            <button
                disabled={pending}
                className="btn"
                style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: pending ? 'not-allowed' : 'pointer',
                    opacity: pending ? 0.7 : 1
                }}
            >
                {pending ? 'Voiding...' : 'Void Invoice'}
            </button>
        </form>
    );
}
