import BillForm from "../../../components/bill-form";
import { getSuppliersAction, getDashboardData } from "../../../lib/actions";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../../components/brand";
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
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/bills" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    ← Back
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Record New Bill
                </h1>
                <BillForm
                    suppliers={suppliers.map(c => ({ id: c.id, name: c.name, email: c.email }))}
                    expenseAccounts={expenseAccounts.map(a => ({ id: a.id, code: a.code, name: a.name }))}
                />
            </div>
        </main>
    );
}
