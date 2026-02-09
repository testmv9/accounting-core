export type TenantId = string;

export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export type Account = {
  id: string;
  tenantId: TenantId;
  code: string;
  name: string;
  type: AccountType;
  showOnDashboard?: boolean;
  isSystem?: boolean;
};

export type JournalLine = {
  accountId: string;
  debitCents?: number;
  creditCents?: number;
};

export type SourceType =
  | "OWNER_CONTRIBUTION"
  | "CASH_SALE"
  | "INVOICE"
  | "INVOICE_PAYMENT"
  | "BILL"
  | "BILL_PAYMENT";

export type JournalEntry = {
  id: string;
  tenantId: TenantId;
  date: string;
  description: string;
  lines: JournalLine[];

  sourceType?: SourceType;
  sourceId?: string;
};

export type LedgerLine = {
  entryId: string;
  date: string;
  description: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number;

  sourceType?: SourceType;
  sourceId?: string;
};


export type LedgerState = Record<string, LedgerLine[]>;
