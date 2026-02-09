'use client'

import { useState } from 'react';
import { AccountSummary, postTransactionAction } from './actions';

export default function TransactionForm({ accounts }: { accounts: AccountSummary[] }) {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [lines, setLines] = useState([
        { accountId: '', debit: '', credit: '' },
        { accountId: '', debit: '', credit: '' }
    ]);
    const [loading, setLoading] = useState(false);

    const updateLine = (idx: number, field: string, value: string) => {
        const newLines = [...lines];
        // @ts-ignore
        newLines[idx][field] = value;
        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, { accountId: '', debit: '', credit: '' }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payloadLines = lines.map(l => ({
                accountId: l.accountId,
                debitCents: Math.round(parseFloat(l.debit || '0') * 100),
                creditCents: Math.round(parseFloat(l.credit || '0') * 100),
            })).filter(l => l.accountId);

            await postTransactionAction({
                tenantId: 'demo-tenant',
                date,
                description,
                lines: payloadLines
            });

            setDescription('');
            setLines([{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }]);
            alert('Transaction Posted!');
        } catch (err) {
            alert('Failed to post transaction');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 className="section-title" style={{ margin: '0 0 1.5rem 0', border: 'none' }}>New Transaction</h2>

            <form onSubmit={handleSubmit}>

                {/* Date Row */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Transaction Date</label>
                    <input
                        className="input"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        style={{ maxWidth: '200px' }}
                    />
                </div>

                {/* Description Row (Full Width) */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>What is this transaction for?</label>
                    <input
                        className="input"
                        placeholder="e.g. Office Supplies, Client Lunch..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        <div>ACCOUNT</div>
                        <div>DEBIT ($)</div>
                        <div>CREDIT ($)</div>
                    </div>

                    {lines.map((line, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                            <select
                                className="select"
                                value={line.accountId}
                                onChange={e => updateLine(idx, 'accountId', e.target.value)}
                                required={idx < 2}
                            >
                                <option value="">Select Account...</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                ))}
                            </select>
                            <input
                                className="input"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={line.debit}
                                onChange={e => updateLine(idx, 'debit', e.target.value)}
                            />
                            <input
                                className="input"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={line.credit}
                                onChange={e => updateLine(idx, 'credit', e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={addLine} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                        + Add Line
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Journal Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
}
