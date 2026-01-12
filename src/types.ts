export type TenantId = string;
export type AccountId = string;

export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export interface Account {
  id: AccountId;
  tenantId: TenantId;
  code: string;
  name: string;
  type: AccountType;
  isSystem: boolean;
}

export interface JournalLine {
  accountId: AccountId;
  debitCents?: number;   // integer >= 0
  creditCents?: number;  // integer >= 0
  memo?: string;
}

export interface JournalEntry {
  id: string;
  tenantId: TenantId;
  date: string; // ISO YYYY-MM-DD
  description: string;
  lines: JournalLine[];
}

export interface LedgerLine {
  entryId: string;
  date: string;
  description: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number; // running balance for that account
}

export type LedgerState = Record<AccountId, LedgerLine[]>;
