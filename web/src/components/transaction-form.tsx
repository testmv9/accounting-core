'use client'

import { useState } from 'react';
import { AccountSummary, postTransactionAction } from '../lib/actions';

export default function TransactionForm({ accounts, tenantId }: { accounts: AccountSummary[], tenantId: string }) {
    const [mode, setMode] = useState<'quick' | 'journal'>('quick');
    const [quickType, setQuickType] = useState<'spend' | 'receive'>('spend');

    // Form States
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Manual Journal Lines
    const [lines, setLines] = useState([
        { accountId: '', debit: '', credit: '' },
        { accountId: '', debit: '', credit: '' }
    ]);

    // Quick Mode State
    const [bankAccount, setBankAccount] = useState('');
    const [categoryAccount, setCategoryAccount] = useState('');
    const [amount, setAmount] = useState('');

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
            let payloadLines = [];

            if (mode === 'quick') {
                const amountCents = Math.round(parseFloat(amount) * 100);
                if (quickType === 'spend') {
                    // Spend Money: Debit Expense/Category, Credit Bank
                    payloadLines = [
                        { accountId: categoryAccount, debitCents: amountCents, creditCents: 0 },
                        { accountId: bankAccount, debitCents: 0, creditCents: amountCents }
                    ];
                } else {
                    // Receive Money: Debit Bank, Credit Revenue/Category
                    payloadLines = [
                        { accountId: bankAccount, debitCents: amountCents, creditCents: 0 },
                        { accountId: categoryAccount, debitCents: 0, creditCents: amountCents }
                    ];
                }
            } else {
                payloadLines = lines.map(l => ({
                    accountId: l.accountId,
                    debitCents: Math.round(parseFloat(l.debit || '0') * 100),
                    creditCents: Math.round(parseFloat(l.credit || '0') * 100),
                })).filter(l => l.accountId && (l.debitCents > 0 || l.creditCents > 0));
            }

            if (payloadLines.length < 2) throw new Error("At least 2 ledger lines required");

            await postTransactionAction({
                tenantId,
                date,
                description,
                lines: payloadLines
            });

            // Reset
            setDescription('');
            setAmount('');
            setLines([{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }]);
            alert('Transaction Posted! Navera is up to date.');

        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Failed to post'}`);
        } finally {
            setLoading(false);
        }
    };

    const bankAccounts = accounts.filter(a => a.type === 'ASSET');
    const categories = accounts; // Could filter to non-assets if desired

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-title" style={{ margin: 0, border: 'none' }}>Post Transaction</h2>

                {/* Mode Toggles */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px', display: 'flex', gap: '0.2rem' }}>
                    <button
                        type="button"
                        onClick={() => setMode('quick')}
                        className={`btn ${mode === 'quick' ? '' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Easy Spend/Receive
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('journal')}
                        className={`btn ${mode === 'journal' ? '' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Manual Journal
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Shared Header (Date & Description) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                        <input
                            className="input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <input
                            className="input"
                            placeholder="e.g. Office Supplies, Monthly Subscription..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {mode === 'quick' ? (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setQuickType('spend')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid',
                                    borderColor: quickType === 'spend' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                                    background: quickType === 'spend' ? 'rgba(56,189,248,0.1)' : 'transparent',
                                    color: quickType === 'spend' ? '#38bdf8' : '#fff',
                                    cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                Spend Money 💸
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickType('receive')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid',
                                    borderColor: quickType === 'receive' ? '#34d399' : 'rgba(255,255,255,0.1)',
                                    background: quickType === 'receive' ? 'rgba(52,211,153,0.1)' : 'transparent',
                                    color: quickType === 'receive' ? '#34d399' : '#fff',
                                    cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                Receive Money 💰
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    {quickType === 'spend' ? 'Bank (Paid From)' : 'Bank (Deposited To)'}
                                </label>
                                <select
                                    className="select"
                                    value={bankAccount}
                                    onChange={e => setBankAccount(e.target.value)}
                                    required={mode === 'quick'}
                                >
                                    <option value="">Select Bank...</option>
                                    {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    {quickType === 'spend' ? 'Category (Expense)' : 'Category (Revenue)'}
                                </label>
                                <select
                                    className="select"
                                    value={categoryAccount}
                                    onChange={e => setCategoryAccount(e.target.value)}
                                    required={mode === 'quick'}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                                <input
                                    className="input"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required={mode === 'quick'}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Manual Journal View */
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
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
                                    required={mode === 'journal' && idx < 2}
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
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn" disabled={loading} style={{ padding: '0.8rem 2rem' }}>
                        {loading ? 'Processing...' : (mode === 'quick' ? 'Post Payment' : 'Post Journal Entry')}
                    </button>
                </div>
            </form>
        </div>
    );
}
