"use client";

import { IconLock } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { categoryColor } from "@/components/app/category-icon";
import { DailyIncomeExpenseChart, IncomeExpenseChart } from "@/components/app/charts";
import { PremiumLink } from "@/components/app/premium-notice";
import { Alert, Card, Skeleton } from "@/components/ui/misc";
import { errorMessage } from "@/lib/api";
import {
  addMonths,
  currentYearMonth,
  formatMoney,
  formatPercent,
  monthLabel,
  type YearMonth,
} from "@/lib/format";
import { usePlanLimits } from "@/lib/queries";
import {
  isMonthAllowed,
  monthsEndingAt,
  useDailySummary,
  useExpensesByCategoryOver,
  useMonthlySeries,
} from "@/lib/summary";

type Period = { key: string; label: string; months: number; endOffset: number };

const PERIODS: Period[] = [
  { key: "current", label: "Mês atual", months: 1, endOffset: 0 },
  { key: "previous", label: "Mês anterior", months: 1, endOffset: -1 },
  { key: "3", label: "3 meses", months: 3, endOffset: 0 },
  { key: "6", label: "6 meses", months: 6, endOffset: 0 },
  { key: "12", label: "12 meses", months: 12, endOffset: 0 },
];

const TOP_CATEGORIES = 6;

export function Reports() {
  const plan = usePlanLimits();
  const [periodKey, setPeriodKey] = useState("current");
  const period = PERIODS.find((p) => p.key === periodKey)!;

  const last = addMonths(currentYearMonth(), period.endOffset);
  const months = monthsEndingAt(last, period.months);
  const allowed = (p: Period) =>
    isMonthAllowed(addMonths(currentYearMonth(), p.endOffset - (p.months - 1)), plan.data);
  const locked = !allowed(period);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Relatórios" subtitle="Entenda para onde seu dinheiro vai" />

      <div
        role="radiogroup"
        aria-label="Período"
        className="border-line flex flex-wrap gap-1 self-start rounded-2xl border bg-white p-1.5"
      >
        {PERIODS.map((p) => {
          const active = p.key === periodKey;
          const pLocked = !allowed(p);
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPeriodKey(p.key)}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-lg font-semibold transition-colors",
                active ? "bg-brand-600 text-white" : "text-muted hover:text-ink",
              )}
            >
              {p.label}
              {pLocked && <IconLock size="1.1rem" aria-label="(Premium)" />}
            </button>
          );
        })}
      </div>

      {locked ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <IconLock size="2rem" className="text-brand-700" aria-hidden />
          <p className="text-ink text-xl font-semibold">Histórico completo no Premium</p>
          <p className="text-muted max-w-lg text-lg">
            No plano Gratuito, os relatórios mostram o mês atual e os {plan.data?.historyMonths ?? 3} meses
            anteriores.
          </p>
          <PremiumLink />
        </Card>
      ) : (
        <ReportBody months={months} single={period.months === 1 ? last : undefined} />
      )}
    </div>
  );
}

function ReportBody({ months, single }: { months: YearMonth[]; single?: YearMonth }) {
  const last = months[months.length - 1];
  const series = useMonthlySeries(last, months.length);
  const daily = useDailySummary(single ?? last, Boolean(single));
  const categories = useExpensesByCategoryOver(months);

  const loading = series.some((m) => m.loading);
  const income = series.reduce((sum, m) => sum + (m.summary?.totalIncome ?? 0), 0);
  const expense = series.reduce((sum, m) => sum + (m.summary?.totalExpense ?? 0), 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : null;
  const top = categories.data.slice(0, TOP_CATEGORIES);
  const maxAmount = top[0]?.amount ?? 0;
  const title = single ? monthLabel(single) : `${monthLabel(months[0])} a ${monthLabel(last)}`;

  return (
    <>
      <Card className="grid gap-6 px-8 py-7 sm:grid-cols-2 xl:grid-cols-4" aria-label={`Resumo: ${title}`}>
        <Kpi label="Receitas" value={formatMoney(income)} className="text-income" loading={loading} />
        <Kpi label="Despesas" value={formatMoney(expense)} className="text-expense" loading={loading} />
        <Kpi label="Saldo" value={formatMoney(balance)} className="text-ink" loading={loading} />
        <Kpi
          label="Taxa de poupança"
          value={savingsRate === null ? "—" : formatPercent(Math.round(savingsRate * 10) / 10)}
          className={savingsRate !== null && savingsRate < 0 ? "text-expense" : "text-brand-700"}
          loading={loading}
          hint="Quanto da receita sobrou"
        />
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-ink text-2xl font-bold">{single ? "Evolução no mês" : "Evolução mensal"}</h2>
            <span className="text-muted">{title}</span>
          </div>
          <div className="mt-6">
            {single ? (
              daily.isPending ? (
                <Skeleton className="h-80" />
              ) : daily.isError ? (
                <Alert>{errorMessage(daily.error)}</Alert>
              ) : (
                <DailyIncomeExpenseChart summary={daily.data} title={title} />
              )
            ) : loading ? (
              <Skeleton className="h-72" />
            ) : (
              <IncomeExpenseChart months={series} />
            )}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-ink text-2xl font-bold">Maiores categorias</h2>
          <div className="mt-6">
            {categories.loading ? (
              <Skeleton className="h-72" />
            ) : categories.error ? (
              <Alert>{errorMessage(categories.error)}</Alert>
            ) : top.length === 0 ? (
              <p className="text-muted py-10 text-center text-lg">Nenhuma despesa no período.</p>
            ) : (
              <ul className="flex flex-col gap-6">
                {top.map((c) => (
                  <li key={c.categoryId}>
                    <div className="flex items-baseline justify-between gap-4 text-lg">
                      <span className="text-ink truncate">{c.categoryName}</span>
                      <span className="text-ink font-semibold whitespace-nowrap tabular-nums">
                        {formatMoney(c.amount)}
                        <span className="text-muted ml-2 text-base font-normal">
                          {formatPercent(Math.round(c.percentage))}
                        </span>
                      </span>
                    </div>
                    <div className="bg-brand-50 mt-2 h-3 overflow-hidden rounded-full" aria-hidden>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${maxAmount > 0 ? (c.amount / maxAmount) * 100 : 0}%`,
                          background: categoryColor(c.categoryColor),
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </section>
    </>
  );
}

function Kpi({
  label,
  value,
  className,
  loading,
  hint,
}: {
  label: string;
  value: string;
  className: string;
  loading: boolean;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-muted text-lg" title={hint}>
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-10 w-40" />
      ) : (
        <p className={clsx("mt-1 text-[2rem] font-bold tracking-tight tabular-nums", className)}>{value}</p>
      )}
    </div>
  );
}
