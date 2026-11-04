"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPlus,
  IconReceipt,
  IconSparkles,
  IconTriangleFilled,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { MonthPicker } from "@/components/app/month-picker";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, ProgressBar, Skeleton } from "@/components/ui/misc";
import {
  addMonths,
  currentYearMonth,
  firstName,
  formatMoney,
  formatPercent,
  relativeDay,
  type YearMonth,
} from "@/lib/format";
import { usePlanLimits, useProfile } from "@/lib/queries";
import { CategoryDonut, IncomeExpenseChart } from "@/components/app/charts";
import { useSavingsGoals } from "@/lib/goals";
import { isMonthAllowed, useExpensesByCategory, useMonthlySeries } from "@/lib/summary";
import { CHART_MONTHS, useInsights, useLatestExpenses } from "./use-dashboard";

export function Dashboard() {
  const profile = useProfile();
  const limits = usePlanLimits();
  const [month, setMonth] = useState<YearMonth>(currentYearMonth);
  const [creating, setCreating] = useState(false);

  const series = useMonthlySeries(month, CHART_MONTHS);
  const current = series[series.length - 1];
  const previous = series[series.length - 2];
  const categories = useExpensesByCategory(month);

  const name = firstName(profile.data?.name);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={name ? `Olá, ${name} 👋` : "Olá 👋"}
        subtitle="Veja como estão suas finanças este mês"
        actions={
          <>
            <MonthPicker
              value={month}
              onChange={setMonth}
              canGoBack={isMonthAllowed(addMonths(month, -1), limits.data)}
            />
            <Button onClick={() => setCreating(true)} className="h-16 px-8">
              <IconPlus size="1.4rem" aria-hidden /> Nova transação
            </Button>
          </>
        }
      />
      <TransactionDialog open={creating} onClose={() => setCreating(false)} />

      <section className="grid gap-6 md:grid-cols-3" aria-label="Resumo do mês">
        <KpiCard
          label="Saldo do mês"
          icon={IconWallet}
          iconClass="bg-brand-100 text-brand-700"
          value={current.summary?.balance}
          previous={previous.summary?.balance}
          higherIsGood
          loading={current.loading}
        />
        <KpiCard
          label="Receitas"
          icon={IconArrowDownLeft}
          iconClass="bg-income-soft text-income"
          value={current.summary?.totalIncome}
          previous={previous.summary?.totalIncome}
          higherIsGood
          loading={current.loading}
        />
        <KpiCard
          label="Despesas"
          icon={IconArrowUpRight}
          iconClass="bg-expense-soft text-expense"
          value={current.summary?.totalExpense}
          previous={previous.summary?.totalExpense}
          higherIsGood={false}
          loading={current.loading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-ink text-2xl font-bold">Receitas x Despesas</h2>
            <span className="text-muted">Últimos 6 meses</span>
          </div>
          <div className="mt-6">
            {series.some((m) => m.loading) ? (
              <Skeleton className="h-72" />
            ) : (
              <IncomeExpenseChart months={series} />
            )}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-ink text-2xl font-bold">Despesas por categoria</h2>
          <div className="mt-6">
            {categories.isPending ? (
              <Skeleton className="h-64" />
            ) : categories.data && categories.data.length > 0 ? (
              <CategoryDonut data={categories.data} total={current.summary?.totalExpense ?? 0} />
            ) : (
              <EmptyState
                text={
                  categories.isError
                    ? "Não foi possível carregar as categorias."
                    : "Nenhuma despesa neste mês."
                }
              />
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <LatestExpensesCard />
        <div className="flex flex-col gap-6">
          <SavingsGoalCard />
          <InsightCard month={month} />
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  icon: KpiIcon,
  iconClass,
  value,
  previous,
  higherIsGood,
  loading,
}: {
  label: string;
  icon: Icon;
  iconClass: string;
  value?: number;
  previous?: number;
  higherIsGood: boolean;
  loading: boolean;
}) {
  const change =
    value !== undefined && previous ? ((value - previous) / Math.abs(previous)) * 100 : undefined;
  const up = (change ?? 0) >= 0;
  const good = up === higherIsGood;

  return (
    <Card className="p-8">
      <div className="flex items-start justify-between">
        <p className="text-muted text-lg">{label}</p>
        <span className={clsx("grid size-14 place-items-center rounded-2xl", iconClass)}>
          <KpiIcon size="1.5rem" aria-hidden />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-11 w-48" />
      ) : (
        <p className="text-ink -mt-2 text-[2.6rem] font-bold tracking-tight tabular-nums">
          {formatMoney(value ?? 0)}
        </p>
      )}
      <p className={clsx("mt-2 flex h-6 items-center gap-1.5", good ? "text-income" : "text-expense")}>
        {change !== undefined && Number.isFinite(change) && (
          <>
            <IconTriangleFilled size="0.875rem" className={clsx(!up && "rotate-180")} aria-hidden />
            <span className="sr-only">{up ? "Aumento de" : "Queda de"}</span>
            {formatPercent(Math.abs(Math.round(change)))} vs. mês anterior
          </>
        )}
      </p>
    </Card>
  );
}

function LatestExpensesCard() {
  const latest = useLatestExpenses(4);
  return (
    <Card className="p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-ink text-2xl font-bold">Últimas despesas</h2>
        <Link href="/transacoes" className="text-brand-700 hover:text-brand-800 text-lg font-semibold">
          Ver todas
        </Link>
      </div>
      {latest.isPending ? (
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : latest.data && latest.data.length > 0 ? (
        <ul className="mt-4">
          {latest.data.map((expense) => (
            <li
              key={expense.id}
              className="border-line flex items-center gap-5 border-b py-5 last:border-b-0"
            >
              <span
                className="grid size-14 shrink-0 place-items-center rounded-2xl"
                style={{ background: `${expense.color || "#c9674e"}22`, color: expense.color || "#c9674e" }}
              >
                <IconReceipt size="1.5rem" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate text-xl font-medium">{expense.title}</p>
                <p className="text-muted">
                  {relativeDay(expense.expenseDate)} · {expense.category}
                </p>
              </div>
              <p className="text-expense text-xl font-semibold whitespace-nowrap tabular-nums">
                − {formatMoney(expense.amount)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          text={
            latest.isError ? "Não foi possível carregar as despesas." : "Você ainda não registrou despesas."
          }
        />
      )}
    </Card>
  );
}

function SavingsGoalCard() {
  const goals = useSavingsGoals();
  const goal = goals.data?.find((g) => !g.isCompleted) ?? goals.data?.[0];

  if (goals.isPending) return <Skeleton className="h-40" />;

  if (!goal) {
    return (
      <Card className="p-8">
        <h2 className="text-ink text-xl font-bold">Metas</h2>
        <p className="text-muted mt-2">Crie uma meta para acompanhar quanto falta para o seu objetivo.</p>
        <Link href="/metas" className="text-brand-700 hover:text-brand-800 mt-4 inline-block font-semibold">
          Criar meta
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-ink truncate text-2xl font-bold">Meta · {goal.name}</h2>
        <span className="text-brand-700 text-xl font-semibold">
          {formatPercent(Math.round(goal.percentage))}
        </span>
      </div>
      <p className="text-muted mt-2 text-lg">
        {formatMoney(goal.savedAmount, { cents: false })} de{" "}
        {formatMoney(goal.targetAmount, { cents: false })}
      </p>
      <ProgressBar value={goal.percentage} className="mt-6" label={`Progresso da meta ${goal.name}`} />
    </Card>
  );
}

function InsightCard({ month }: { month: YearMonth }) {
  const insights = useInsights(month);
  const data = insights.data;
  const message = data?.artificialInsight?.message ?? data?.insights[0]?.message;

  if (insights.isPending) return <Skeleton className="h-44" />;
  if (!message) return null;

  return (
    <div className="bg-brand-100 rounded-[var(--radius-card)] p-8">
      <p className="text-ink flex items-center gap-4 text-xl font-bold">
        <span className="bg-brand-500 grid size-12 place-items-center rounded-2xl text-white">
          <IconSparkles size="1.5rem" aria-hidden />
        </span>
        Mi Assistente
      </p>
      <p className="text-ink mt-5 text-lg leading-relaxed">{message}</p>
      {data?.isPreview && data.lockedInsightsCount > 0 && (
        <Link
          href="/assinatura"
          className="text-brand-700 hover:text-brand-800 mt-4 inline-block font-semibold"
        >
          +{data.lockedInsightsCount} {data.lockedInsightsCount === 1 ? "dica" : "dicas"} com análise completa
          no Premium
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-muted py-10 text-center text-lg">{text}</p>;
}
