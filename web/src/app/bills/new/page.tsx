import BillForm from "../../../components/bill-form";
import { getSuppliersAction, getDashboardData } from "../../../lib/actions";
import { auth } from "@/auth";
import Link from "next/link";

export default async function NewBillPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to record bills.</div>
    }

    const [suppliers, accounts] = await Promise.all([
        getSuppliersAction(tenantId),
        getDashboardData(tenantId)
    ]);

    // Filter to only EXPENSE accounts for line items
    const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Record New Bill</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Log organizational expenses and monitor vendor liabilities</p>
                </div>
                <Link href="/bills" className="btn-secondary-premium">
                    Cancel & Back
                </Link>
            </div>

            <div style={{ maxWidth: '1000px' }}>
                <BillForm
                    suppliers={suppliers.map(c => ({ id: c.id, name: c.name, email: c.email }))}
                    expenseAccounts={expenseAccounts.map(a => ({ id: a.id, code: a.code, name: a.name }))}
                />
            </div>
        </div>
    );
}
