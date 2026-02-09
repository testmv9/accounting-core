'use client';

import { useState } from 'react';
import { matchBankTransactionAction, categorizeBankTransactionAction } from '../../../lib/actions';

interface ReconcileRowProps {
    tx: any;
    openInvoices: any[];
    openBills: any[];
    accounts: any[];
}

export default function ReconcileRow({ tx, openInvoices, openBills, accounts }: ReconcileRowProps) {
    const [mode, setMode] = useState<'NONE' | 'MATCH' | 'CATEGORIZE'>('NONE');
    const [loading, setLoading] = useState(false);

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    const handleMatch = async (matchType: 'INVOICE' | 'BILL', matchId: string) => {
        setLoading(true);
        try {
            await matchBankTransactionAction(tx.id, matchType, matchId);
        } finally {
            setLoading(false);
            setMode('NONE');
        }
    };

    const handleCategorize = async (accountId: string) => {
        setLoading(true);
        try {
            await categorizeBankTransactionAction(tx.id, accountId);
        } finally {
            setLoading(false);
            setMode('NONE');
        }
    };

    return (
        <div className="card" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 150px 200px',
                alignItems: 'center',
                padding: '1.5rem',
                gap: '1rem',
                opacity: loading ? 0.5 : 1
            }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{tx.date}</div>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{tx.description}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Bank Statement Line</div>
                </div>
                <div style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: tx.amountCents > 0 ? '#34d399' : '#f87171'
                }}>
                    {formatMoney(tx.amountCents)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        className={`btn ${mode === 'MATCH' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => setMode(mode === 'MATCH' ? 'NONE' : 'MATCH')}
                        disabled={loading}
                    >
                        Match
                    </button>
                    <button
                        className={`btn ${mode === 'CATEGORIZE' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => setMode(mode === 'CATEGORIZE' ? 'NONE' : 'CATEGORIZE')}
                        disabled={loading}
                    >
                        Categorize
                    </button>
                </div>
            </div>

            {tx.suggestion && mode === 'NONE' && (
                <div style={{
                    margin: '0 1.5rem 1rem 1.5rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(52, 211, 153, 0.05)',
                    border: '1px dashed #34d399',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rule Suggestion:</span>
                        <span style={{ marginLeft: '0.5rem', color: '#f1f5f9' }}>Apply <strong>{tx.suggestion.name}</strong> to <strong>{tx.suggestion.targetAccount.name}</strong>?</span>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => handleCategorize(tx.suggestion.targetAccountId)}
                        disabled={loading}
                    >
                        Apply Rule
                    </button>
                </div>
            )}

            {mode === 'MATCH' && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#94a3b8' }}>
                        Match with open {tx.amountCents > 0 ? 'Invoices' : 'Bills'}
                    </h4>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {tx.amountCents > 0 ? (
                            openInvoices.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No open invoices found.</p> :
                                openInvoices.filter(i => i.amountCents === tx.amountCents).map(inv => (
                                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: '4px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{inv.invoiceNumber} - {inv.customer.name} ({formatMoney(inv.amountCents)})</span>
                                        <button className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleMatch('INVOICE', inv.id)}>Match</button>
                                    </div>
                                ))
                        ) : (
                            openBills.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No unpaid bills found.</p> :
                                openBills.filter(b => b.amountCents === Math.abs(tx.amountCents)).map(bill => (
                                    <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: '4px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{bill.billNumber} - {bill.supplier.name} ({formatMoney(bill.amountCents)})</span>
                                        <button className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleMatch('BILL', bill.id)}>Match</button>
                                    </div>
                                ))
                        )}
                        {/* If no exact matches, show all open ones */}
                        {(tx.amountCents > 0 ? openInvoices : openBills).filter(x => x.amountCents !== Math.abs(tx.amountCents)).length > 0 && (
                            <>
                                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Other Open Items</div>
                                {(tx.amountCents > 0 ? openInvoices : openBills).filter(x => x.amountCents !== Math.abs(tx.amountCents)).map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{item.invoiceNumber || item.billNumber} - {item.customer?.name || item.supplier?.name} ({formatMoney(item.amountCents)})</span>
                                        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleMatch(tx.amountCents > 0 ? 'INVOICE' : 'BILL', item.id)}>Match</button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}

            {mode === 'CATEGORIZE' && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#94a3b8' }}>Categorize as...</h4>
                    <select
                        className="input"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        onChange={(e) => handleCategorize(e.target.value)}
                        defaultValue=""
                        disabled={loading}
                    >
                        <option value="" disabled>Select an account...</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
