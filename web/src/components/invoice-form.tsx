'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoiceAction, createCustomerAction } from '../lib/actions'

type AccountOption = { id: string; code: string; name: string }
type CustomerOption = { id: string; name: string; email?: string | null }

export default function InvoiceForm({ customers, revenueAccounts }: { customers: CustomerOption[], revenueAccounts: AccountOption[] }) {
    const router = useRouter()

    // Header State
    const [customerId, setCustomerId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // New Customer State (Modal-ish)
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');

    // Lines State
    const [lines, setLines] = useState([
        { description: '', quantity: 1, unitPrice: '', revenueAccountId: '' }
    ]);

    const [loading, setLoading] = useState(false);

    // Dynamic Line Helpers
    const updateLine = (idx: number, field: string, value: string | number) => {
        const newLines = [...lines];
        // @ts-ignore
        newLines[idx][field] = value;
        setLines(newLines);
    };

    const addLine = () => setLines([...lines, { description: '', quantity: 1, unitPrice: '', revenueAccountId: '' }]);
    const removeLine = (idx: number) => {
        if (lines.length > 1) {
            setLines(lines.filter((_, i) => i !== idx));
        }
    };

    // New Customer Helper
    const handleCustomerCreate = async () => {
        if (!newCustomerName) return;
        setLoading(true);
        try {
            await createCustomerAction(newCustomerName, newCustomerEmail, undefined);
            // In a real app we would select the new customer ID after revalidation, 
            // but for MVP we might need a refresh or optimistically add to list. 
            // Since server action revalidates path, the page might reload or we just alert user to select.

            router.refresh(); // Refresh to fetch the new customer list

            setIsNewCustomer(false);
            setNewCustomerName('');
            alert('Customer Created! Select them from the list.');
        } catch (e) {
            console.error(e);
            alert('Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    // Submit Invoice
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createInvoiceAction(customerId, issueDate, dueDate, lines);
            // alert('Invoice Created! 🎉');
            router.push('/invoices');
        } catch (err) {
            console.error(err);
            alert('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Total for Display
    const total = lines.reduce((sum, line) => {
        return sum + (line.quantity * (parseFloat(line.unitPrice || '0')));
    }, 0);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Customer Selection / Creation */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Client Details</h2>

                {!isNewCustomer ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Client</label>
                            <select
                                className="select"
                                value={customerId}
                                onChange={e => setCustomerId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">-- Choose Client --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsNewCustomer(true)}
                            style={{ padding: '0.6rem 1rem' }}
                        >
                            + New Client
                        </button>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#38bdf8' }}>New Client</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                className="input"
                                placeholder="Business Name"
                                value={newCustomerName}
                                onChange={e => setNewCustomerName(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="Email (Optional)"
                                value={newCustomerEmail}
                                onChange={e => setNewCustomerEmail(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn" onClick={handleCustomerCreate} disabled={loading}>Save Client</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsNewCustomer(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    <div>
                        <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Issue Date</label>
                        <input className="input" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date</label>
                        <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="card">
                <h2 className="section-title">Invoice Items</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px 8px 0 0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 2fr 30px', gap: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                    <div>DESCRIPTION</div>
                    <div>QTY</div>
                    <div>PRICE</div>
                    <div>ACCOUNT</div>
                    <div></div>
                </div>

                {lines.map((line, idx) => (
                    <div key={idx} style={{ padding: '0.5rem 0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 2fr 30px', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            className="input"
                            placeholder="e.g. Consulting Services"
                            value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                        />
                        <input
                            className="input"
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e => updateLine(idx, 'quantity', Number(e.target.value))}
                        />
                        <input
                            className="input"
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', e.target.value)}
                        />
                        <select
                            className="select"
                            value={line.revenueAccountId}
                            onChange={e => updateLine(idx, 'revenueAccountId', e.target.value)}
                        >
                            <option value="">Select Revenue...</option>
                            {revenueAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            &times;
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addLine}
                    style={{ marginTop: '1rem', color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    + Add Item
                </button>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Total Amount</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Draft Invoice'}
                </button>
            </div>

        </div>
    )
}
