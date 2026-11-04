/** Brazil-only product: fixed pt-BR, BRL and Brasília time (no i18n). */
export const TIME_ZONE = "America/Sao_Paulo";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const currencyNoCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatMoney(value: number, { cents = true } = {}) {
  return (cents ? currency : currencyNoCents).format(value);
}

export function formatPercent(value: number) {
  return `${percent.format(value)}%`;
}

export type YearMonth = { year: number; month: number };

/** Current month on the Brasília calendar. */
export function currentYearMonth(now = new Date()): YearMonth {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "numeric" })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return { year: Number(parts.year), month: Number(parts.month) };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function monthIndex({ year, month }: YearMonth) {
  return year * 12 + month;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function monthLabel({ year, month }: YearMonth) {
  return `${MONTHS[month - 1]} ${year}`;
}

export function shortMonthLabel({ month }: YearMonth) {
  return MONTHS[month - 1].slice(0, 3);
}

/** API DateTimes are UTC; some come without the "Z" and would be read as the browser's local time. */
export function parseApiDate(iso: string) {
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
}

/** "Hoje", "Ontem" or "02 nov", on the Brasília calendar. */
export function relativeDay(iso: string, now = new Date()) {
  const day = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
  const date = parseApiDate(iso);
  const today = day(now);
  const yesterday = day(new Date(now.getTime() - 86_400_000));
  if (day(date) === today) return "Hoje";
  if (day(date) === yesterday) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE, day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "");
}

export function firstName(name: string | undefined) {
  return name?.trim().split(/\s+/)[0] ?? "";
}

/** "nilton@hotmail.com" → "ni***@hotmail.com". */
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}
