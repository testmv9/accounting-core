'use client';

import { createAccountAction } from "../lib/actions";
import { useState } from "react";

export default function AccountForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        await createAccountAction(formData);
        setLoading(false);
        (document.getElementById('new-account-form') as HTMLFormElement)?.reset();
    }

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Create New Account</h2>
            <form id="new-account-form" action={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 180px 80px 100px', gap: '1.25rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Code</label>
                        <input name="code" className="input-premium" placeholder="e.g. 510" required />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Name</label>
                        <input name="name" className="input-premium" placeholder="e.g. Marketing" required />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Type</label>
                        <select name="type" className="input-premium" required style={{ appearance: 'none' }}>
                            <option value="EXPENSE">Expense</option>
                            <option value="ASSET">Asset</option>
                            <option value="LIABILITY">Liability</option>
                            <option value="EQUITY">Equity</option>
                            <option value="REVENUE">Revenue</option>
                        </select>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Watch</label>
                        <input type="checkbox" name="showOnDashboard" style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} title="Show on Dashboard Watchlist" />
                    </div>

                    <button type="submit" className="btn-premium" disabled={loading} style={{ width: '100%', height: '46px' }}>
                        {loading ? '...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}
