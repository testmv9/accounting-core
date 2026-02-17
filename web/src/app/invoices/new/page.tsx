import InvoiceForm from "../../../components/invoice-form";
import { getCustomersAction, getDashboardData } from "../../../lib/actions";
import { auth } from "@/auth";
import Link from "next/link";

export default async function NewInvoicePage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to create invoices.</div>
    }

    const [customers, accounts] = await Promise.all([
        getCustomersAction(tenantId),
        getDashboardData(tenantId)
    ]);

    // Filter to only REVENUE accounts for line items
    const revenueAccounts = accounts.filter(a => a.type === 'REVENUE');

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create New Invoice</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Draft and issue a new billing request to your customers</p>
                </div>
                <Link href="/invoices" className="btn-secondary-premium">
                    Cancel & Back
                </Link>
            </div>

            <div style={{ maxWidth: '1000px' }}>
                <InvoiceForm
                    customers={customers.map(c => ({ id: c.id, name: c.name, email: c.email }))}
                    revenueAccounts={revenueAccounts.map(a => ({ id: a.id, code: a.code, name: a.name }))}
                />
            </div>
        </div>
    );
}
