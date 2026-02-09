'use client';

import { useState, useRef } from 'react';
import { findBankAccountAction } from '../../../lib/actions';

interface CsvUploaderProps {
    onImport: (data: any[], bankAccountId: string) => Promise<void>;
    bankAccounts: any[];
}

export default function CsvUploader({ onImport, bankAccounts }: CsvUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<{ date: string, desc: string, amount: string }>({ date: '', desc: '', amount: '' });
    const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'UPLOAD' | 'MAP'>('UPLOAD');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
            if (rows.length > 0) {
                setHeaders(rows[0]);
                setPreview(rows.slice(1, 6)); // Show first 5 rows
                setFile(selectedFile);

                // Smart suggestion
                const h = rows[0].map(s => s.toLowerCase());
                setMapping({
                    date: rows[0][h.findIndex(s => s.includes('date'))] || '',
                    desc: rows[0][h.findIndex(s => s.includes('desc') || s.includes('payee') || s.includes('memo'))] || '',
                    amount: rows[0][h.findIndex(s => s.includes('amount') || s.includes('total') || s.includes('value'))] || ''
                });

                setStep('MAP');
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (!file || !mapping.date || !mapping.desc || !mapping.amount || !bankAccountId) return;

        setLoading(true);
        try {
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
            const dataRows = rows.slice(1).filter(r => r.length === headers.length);

            const dateIdx = headers.indexOf(mapping.date);
            const descIdx = headers.indexOf(mapping.desc);
            const amountIdx = headers.indexOf(mapping.amount);

            const transactions = dataRows.map(row => ({
                date: row[dateIdx],
                description: row[descIdx],
                amountCents: Math.round(parseFloat(row[amountIdx].replace(/[^-0.9.]/g, '')) * 100)
            })).filter(tx => !isNaN(tx.amountCents));

            await onImport(transactions, bankAccountId);
            setStep('UPLOAD');
            setFile(null);
        } catch (err) {
            console.error("Import failed:", err);
            alert("Failed to parse CSV. Please check the mapping.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            {step === 'UPLOAD' ? (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Import Bank Statement</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Upload a CSV file from your bank to begin reconciliation.
                    </p>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Select CSV File
                    </button>
                </div>
            ) : (
                <div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Map Your Columns</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Target Bank Account</label>
                                <select
                                    className="input"
                                    style={{ width: '100%' }}
                                    value={bankAccountId}
                                    onChange={e => setBankAccountId(e.target.value)}
                                >
                                    {bankAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Transaction Date</label>
                                <select
                                    className="input"
                                    style={{ width: '100%' }}
                                    value={mapping.date}
                                    onChange={e => setMapping({ ...mapping, date: e.target.value })}
                                >
                                    <option value="">Select column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Description / Payee</label>
                                <select
                                    className="input"
                                    style={{ width: '100%' }}
                                    value={mapping.desc}
                                    onChange={e => setMapping({ ...mapping, desc: e.target.value })}
                                >
                                    <option value="">Select column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Amount</label>
                                <select
                                    className="input"
                                    style={{ width: '100%' }}
                                    value={mapping.amount}
                                    onChange={e => setMapping({ ...mapping, amount: e.target.value })}
                                >
                                    <option value="">Select column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase' }}>Preview</h4>
                            <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            {headers.map(h => <th key={h} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, i) => (
                                            <tr key={i}>
                                                {row.map((cell, j) => <td key={j} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{cell}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setStep('UPLOAD')}>Cancel</button>
                        <button
                            className="btn btn-primary"
                            disabled={loading || !mapping.date || !mapping.desc || !mapping.amount}
                            onClick={handleImport}
                        >
                            {loading ? 'Importing...' : 'Complete Import'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
