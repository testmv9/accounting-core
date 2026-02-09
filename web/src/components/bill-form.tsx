'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBillAction, createSupplierAction } from '../lib/actions'

type AccountOption = { id: string; code: string; name: string }
type SupplierOption = { id: string; name: string; email?: string | null }

export default function BillForm({ suppliers, expenseAccounts }: { suppliers: SupplierOption[], expenseAccounts: AccountOption[] }) {
    const router = useRouter()

    // Header State
    const [supplierId, setSupplierId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // New Supplier State
    const [isNewSupplier, setIsNewSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierEmail, setNewSupplierEmail] = useState('');

    // Lines State
    const [lines, setLines] = useState([
        { description: '', quantity: 1, unitPrice: '', expenseAccountId: '' }
    ]);

    const [loading, setLoading] = useState(false);

    // Dynamic Line Helpers
    const updateLine = (idx: number, field: string, value: string | number) => {
        const newLines = [...lines];
        // @ts-ignore
        newLines[idx][field] = value;
        setLines(newLines);
    };

    const addLine = () => setLines([...lines, { description: '', quantity: 1, unitPrice: '', expenseAccountId: '' }]);
    const removeLine = (idx: number) => {
        if (lines.length > 1) {
            setLines(lines.filter((_, i) => i !== idx));
        }
    };

    // New Supplier Helper
    const handleSupplierCreate = async () => {
        if (!newSupplierName) return;
        setLoading(true);
        try {
            await createSupplierAction(newSupplierName, newSupplierEmail, undefined);

            router.refresh(); // Refresh list

            setIsNewSupplier(false);
            setNewSupplierName('');
            alert('Supplier Created! Select them from the list.');
        } catch (e) {
            console.error(e);
            alert('Failed to create supplier');
        } finally {
            setLoading(false);
        }
    };

    // Submit Bill
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createBillAction(supplierId, issueDate, dueDate, lines);
            router.push('/bills');
        } catch (err) {
            console.error(err);
            alert('Failed to create bill');
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

            {/* Supplier Selection / Creation */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Supplier Details</h2>

                {!isNewSupplier ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Supplier</label>
                            <select
                                className="select"
                                value={supplierId}
                                onChange={e => setSupplierId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">-- Choose Supplier --</option>
                                {suppliers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsNewSupplier(true)}
                            style={{ padding: '0.6rem 1rem' }}
                        >
                            + New Supplier
                        </button>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#ec4899' }}>New Supplier</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                className="input"
                                placeholder="Business Name"
                                value={newSupplierName}
                                onChange={e => setNewSupplierName(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="Email (Optional)"
                                value={newSupplierEmail}
                                onChange={e => setNewSupplierEmail(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn" onClick={handleSupplierCreate} disabled={loading} style={{ background: '#ec4899' }}>Save Supplier</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsNewSupplier(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    <div>
                        <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
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
                <h2 className="section-title">Bill Items</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px 8px 0 0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 2fr 30px', gap: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                    <div>DESCRIPTION</div>
                    <div>QTY</div>
                    <div>PRICE</div>
                    <div>EXPENSE ACCOUNT</div>
                    <div></div>
                </div>

                {lines.map((line, idx) => (
                    <div key={idx} style={{ padding: '0.5rem 0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 2fr 30px', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            className="input"
                            placeholder="e.g. Office Chairs"
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
                            value={line.expenseAccountId}
                            onChange={e => updateLine(idx, 'expenseAccountId', e.target.value)}
                        >
                            <option value="">Select Expense...</option>
                            {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
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
                    style={{ marginTop: '1rem', color: '#ec4899', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
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
                <button type="submit" className="btn" onClick={handleSubmit} disabled={loading} style={{ background: '#ec4899' }}>
                    {loading ? 'Creating...' : 'Create Draft Bill'}
                </button>
            </div>

        </div>
    )
}
