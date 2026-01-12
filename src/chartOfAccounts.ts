import { Account, AccountType, TenantId } from "./types";

export function seedSystemAccounts(tenantId: TenantId): Account[] {
  return [
    { id: "bank", tenantId, code: "100", name: "Bank", type: AccountType.ASSET, isSystem: true },
    { id: "ar", tenantId, code: "110", name: "Accounts Receivable", type: AccountType.ASSET, isSystem: true },
    { id: "ap", tenantId, code: "200", name: "Accounts Payable", type: AccountType.LIABILITY, isSystem: true },
    { id: "revenue", tenantId, code: "400", name: "Revenue", type: AccountType.REVENUE, isSystem: true },
    { id: "expense", tenantId, code: "500", name: "Expense", type: AccountType.EXPENSE, isSystem: true },
    { id: "equity", tenantId, code: "300", name: "Equity", type: AccountType.EQUITY, isSystem: true },
  ];
}

export function indexAccountsById(accounts: Account[]): Record<string, Account> {
  return Object.fromEntries(accounts.map(a => [a.id, a]));
}
