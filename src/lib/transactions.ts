import { TIME_ZONE } from "./format";

/** Enums of micash-api, sent and received as numbers (the API has no JsonStringEnumConverter). */
export enum TransactionType {
  Income = 1,
  Expense = 2,
}

export enum PaymentType {
  Cash = 0,
  CreditCard = 1,
  DebitCard = 2,
  EletronicTransfer = 3,
  Pix = 4,
}

export enum ExpenseStatus {
  Pending = 0,
  Paid = 1,
  Canceled = 2,
}

export enum IncomeCategory {
  Salary = 1,
  Freelance = 2,
  Investment = 3,
  Commission = 4,
  Gift = 5,
  Other = 99,
}

/** Same labels as the mobile app (src/lib/transactions.ts and app/new-transaction.tsx there). */
export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  [IncomeCategory.Salary]: "Salário",
  [IncomeCategory.Freelance]: "Freelance",
  [IncomeCategory.Investment]: "Investimento",
  [IncomeCategory.Commission]: "Comissão",
  [IncomeCategory.Gift]: "Presente",
  [IncomeCategory.Other]: "Outros",
};

export const INCOME_CATEGORIES = Object.keys(INCOME_CATEGORY_LABELS).map(Number) as IncomeCategory[];

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.Pix, label: "Pix" },
  { value: PaymentType.DebitCard, label: "Cartão de débito" },
  { value: PaymentType.CreditCard, label: "Cartão de crédito" },
  { value: PaymentType.Cash, label: "Dinheiro" },
  { value: PaymentType.EletronicTransfer, label: "Transferência" },
];

export function paymentTypeLabel(value: PaymentType | null | undefined) {
  return PAYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "";
}

/** GET api/transactions item. */
export type Transaction = {
  id: number;
  type: TransactionType;
  title: string;
  description: string | null;
  amount: number;
  /** "AAAA-MM-DD", Brasília calendar. */
  date: string;
  /** Expense only: the stored UTC instant. */
  expenseDate: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  paymentType: PaymentType | null;
  expenseStatus: ExpenseStatus | null;
  incomeCategory: IncomeCategory | null;
  isRecurring: boolean | null;
};

export type Paged<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

/** ResponseShortCategoryJson — the user's expense categories (incomes use IncomeCategory). */
export type Category = { id: number; name: string; color: string; icon: string; isActive: boolean };

export type ExpenseRequest = {
  title: string;
  /** The API does not accept null here: empty becomes "". */
  description: string;
  /** UTC ISO instant; the API refuses future dates. */
  expenseDate: string;
  amount: number;
  paymentType: PaymentType;
  expenseStatus: ExpenseStatus;
  categoryId: number;
};

export type IncomeRequest = {
  title: string;
  description: string | null;
  amount: number;
  /** DateOnly "AAAA-MM-DD". */
  receivedAt: string;
  incomeCategory: IncomeCategory;
  isRecurring: boolean;
};

/** Today on the Brasília calendar, "AAAA-MM-DD". */
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/**
 * Brasília day → the UTC instant sent as ExpenseDate. Today keeps the current time (it can never be in
 * the future); other days use noon in Brasília, safely inside that day.
 */
export function expenseDateFromDay(dayKey: string, now = new Date()) {
  if (dayKey === todayKey(now)) return now.toISOString();
  return new Date(`${dayKey}T12:00:00-03:00`).toISOString();
}

/** "2026-11-04" → "04/11/2026". */
export function formatDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-");
  return `${day}/${month}/${year}`;
}

/** "Hoje", "Ontem" or "02 nov" for a Brasília day key. */
export function relativeDayKey(dayKey: string, now = new Date()) {
  const today = todayKey(now);
  if (dayKey === today) return "Hoje";
  if (dayKey === todayKey(new Date(now.getTime() - 86_400_000))) return "Ontem";
  const [, month, day] = dayKey.split("-").map(Number);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${String(day).padStart(2, "0")} ${months[month - 1]}`;
}
