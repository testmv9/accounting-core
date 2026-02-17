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
                <div style={{ background: 'var(--surface-hover)', padding: '0.3rem', borderRadius: '10px', display: 'flex', gap: '0.2rem' }}>
                    <button
                        type="button"
                        onClick={() => setMode('quick')}
                        className={`nav-link ${mode === 'quick' ? 'active' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: 'none', background: mode === 'quick' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                    >
                        Easy Spend/Receive
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('journal')}
                        className={`nav-link ${mode === 'journal' ? 'active' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: 'none', background: mode === 'journal' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                    >
                        Manual Journal
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Shared Header (Date & Description) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                        <input
                            className="input-premium"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                        <input
                            className="input-premium"
                            placeholder="e.g. Office Supplies, Monthly Subscription..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {mode === 'quick' ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                type="button"
                                onClick={() => setQuickType('spend')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid',
                                    borderColor: quickType === 'spend' ? 'var(--primary)' : 'var(--glass-border)',
                                    background: quickType === 'spend' ? 'rgba(56,189,248,0.1)' : 'transparent',
                                    color: quickType === 'spend' ? 'var(--primary)' : 'var(--muted)',
                                    cursor: 'pointer', fontWeight: '800', transition: '0.2s'
                                }}
                            >
                                💸 Spend Money
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickType('receive')}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid',
                                    borderColor: quickType === 'receive' ? 'var(--success)' : 'var(--glass-border)',
                                    background: quickType === 'receive' ? 'rgba(16,185,129,0.1)' : 'transparent',
                                    color: quickType === 'receive' ? 'var(--success)' : 'var(--muted)',
                                    cursor: 'pointer', fontWeight: '800', transition: '0.2s'
                                }}
                            >
                                💰 Receive Money
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {quickType === 'spend' ? 'Bank (Paid From)' : 'Bank (Deposited To)'}
                                </label>
                                <select
                                    className="input-premium"
                                    value={bankAccount}
                                    onChange={e => setBankAccount(e.target.value)}
                                    required={mode === 'quick'}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">Select Bank...</option>
                                    {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    Category
                                </label>
                                <select
                                    className="input-premium"
                                    value={categoryAccount}
                                    onChange={e => setCategoryAccount(e.target.value)}
                                    required={mode === 'quick'}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amount ($)</label>
                                <input
                                    className="input-premium"
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
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>
                            <div>Account</div>
                            <div style={{ textAlign: 'right' }}>Debit ($)</div>
                            <div style={{ textAlign: 'right' }}>Credit ($)</div>
                        </div>

                        {lines.map((line, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                                <select
                                    className="input-premium"
                                    value={line.accountId}
                                    onChange={e => updateLine(idx, 'accountId', e.target.value)}
                                    required={mode === 'journal' && idx < 2}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">Select Account...</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                    ))}
                                </select>
                                <input
                                    className="input-premium"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={line.debit}
                                    onChange={e => updateLine(idx, 'debit', e.target.value)}
                                    style={{ textAlign: 'right' }}
                                />
                                <input
                                    className="input-premium"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={line.credit}
                                    onChange={e => updateLine(idx, 'credit', e.target.value)}
                                    style={{ textAlign: 'right' }}
                                />
                            </div>
                        ))}

                        <button type="button" onClick={addLine} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.5rem' }}>
                            + Add Another Line
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-premium" disabled={loading} style={{ padding: '0.85rem 3rem' }}>
                        {loading ? 'Processing...' : (mode === 'quick' ? 'Confirm Payment' : 'Post Journal Entry')}
                    </button>
                </div>
            </form>
        </div>
    );
}
