'use client';

import { createAccountAction } from "../actions";
import { useState } from "react";

export default function AccountForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        await createAccountAction(formData);
        setLoading(false);
        // Reset form? HTML form resets on submit usually if not prevented? No, standard form submit reloads page unless JS handles it.
        // Here we use Next.js Server Action directly on <form action={...}>.
        // To clear inputs, we can use ref or simplistic state.
        // For simplicity, we'll let it execute. A page refresh or revalidation happens.
        // But better UX: clear inputs.
        (document.getElementById('new-account-form') as HTMLFormElement)?.reset();
    }

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create Account</h2>
            <form id="new-account-form" action={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>

                    <div>
                        <label className="card-label">Code</label>
                        <input name="code" className="input" placeholder="e.g. 510" required />
                    </div>

                    <div>
                        <label className="card-label">Name</label>
                        <input name="name" className="input" placeholder="e.g. Marketing" required />
                    </div>

                    <div>
                        <label className="card-label">Type</label>
                        <select name="type" className="select" required>
                            <option value="EXPENSE">Expense</option>
                            <option value="ASSET">Asset</option>
                            <option value="LIABILITY">Liability</option>
                            <option value="EQUITY">Equity</option>
                            <option value="REVENUE">Revenue</option>
                        </select>
                    </div>

                    <button type="submit" className="btn" disabled={loading} style={{ height: '46px' }}>
                        {loading ? '...' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
}
