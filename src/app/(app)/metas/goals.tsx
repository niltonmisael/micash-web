"use client";

import { IconCopy, IconLock, IconMinus, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { CategoryIcon } from "@/components/app/category-icon";
import { MonthPicker } from "@/components/app/month-picker";
import { ActionError, PlanUsageBanner } from "@/components/app/premium-notice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Alert, Card, ProgressBar, Skeleton } from "@/components/ui/misc";
import { ActionMenu, ConfirmDialog, Dialog } from "@/components/ui/overlay";
import { errorMessage } from "@/lib/api";
import { useCategories } from "@/lib/entries";
import {
  addMonths,
  currentYearMonth,
  formatMoney,
  formatPercent,
  monthIndex,
  type YearMonth,
} from "@/lib/format";
import {
  copyLimits,
  deleteLimit,
  deleteSavingsGoal,
  invalidateGoals,
  LimitStatus,
  SavingsMovementType,
  useSavingsGoal,
  useSavingsGoals,
  useSpendingLimits,
  type SpendingLimit,
} from "@/lib/goals";
import { usePlanLimits } from "@/lib/queries";
import { isMonthAllowed } from "@/lib/summary";
import { formatDayKey, todayKey } from "@/lib/transactions";
import type { SavingsGoal } from "@/lib/types";
import { LimitDialog } from "./limit-dialog";
import { MovementDialog } from "./movement-dialog";
import { SavingsGoalDialog } from "./savings-goal-dialog";

type Tab = "economia" | "limites";

export function Goals() {
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = useSearchParams().get("tab") === "limites" ? "limites" : "economia";

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Metas financeiras" subtitle="Acompanhe seus objetivos" />
      <Segmented<Tab>
        label="Tipo de meta"
        value={tab}
        onChange={(value) => router.replace(value === "limites" ? `${pathname}?tab=limites` : pathname)}
        className="border-line bg-surface self-start border"
        options={[
          { value: "economia", label: "Metas de economia" },
          { value: "limites", label: "Limites de gasto" },
        ]}
      />
      {tab === "economia" ? <SavingsSection /> : <LimitsSection />}
    </div>
  );
}

/* ---------------- Metas de economia ---------------- */

function SavingsSection() {
  const client = useQueryClient();
  const goals = useSavingsGoals();
  const limits = usePlanLimits();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal>();
  const [movement, setMovement] = useState<{ goal: SavingsGoal; type: SavingsMovementType }>();
  const [history, setHistory] = useState<SavingsGoal>();
  const [deleting, setDeleting] = useState<SavingsGoal>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const list = goals.data ?? [];
  const max = limits.data?.maxSavingsGoals ?? null;
  const atLimit = max !== null && list.length >= max;

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(undefined);
    try {
      await deleteSavingsGoal(deleting.id);
      invalidateGoals(client);
      setDeleting(undefined);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section aria-label="Metas de economia" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted text-base">Guarde dinheiro para seus objetivos e acompanhe quanto falta.</p>
        <Button onClick={() => setCreating(true)} disabled={atLimit} className="h-12 px-8">
          <IconPlus size="1.4rem" aria-hidden /> Nova meta
        </Button>
      </div>

      {max !== null && limits.data && !limits.data.isPremium && (
        <PlanUsageBanner>
          Você usa{" "}
          <strong>
            {Math.min(list.length, max)} de {max} {max === 1 ? "meta" : "metas"}
          </strong>{" "}
          do plano Gratuito. Com o Premium, crie metas ilimitadas.
        </PlanUsageBanner>
      )}

      {goals.isError ? (
        <Alert>{errorMessage(goals.error)}</Alert>
      ) : goals.isPending ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {list.map((goal) => (
            <li key={goal.id}>
              <SavingsGoalCard
                goal={goal}
                onDeposit={() => setMovement({ goal, type: SavingsMovementType.Deposit })}
                onWithdraw={() => setMovement({ goal, type: SavingsMovementType.Withdrawal })}
                onHistory={() => setHistory(goal)}
                onEdit={() => setEditing(goal)}
                onDelete={() => {
                  setDeleteError(undefined);
                  setDeleting(goal);
                }}
              />
            </li>
          ))}
          <li>
            {atLimit ? (
              <div className="border-brand-200 flex h-full min-h-56 flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-10 text-center">
                <IconLock size="1.8rem" className="text-brand-700" aria-hidden />
                <p className="text-brand-700 text-lg font-semibold">Nova meta</p>
                <p className="text-muted">Disponível no Premium</p>
                <Link href="/assinatura" className="text-brand-700 hover:text-brand-800 mt-2 font-semibold">
                  Conhecer Premium
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="border-brand-200 hover:bg-brand-50 flex h-full min-h-56 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-10"
              >
                <IconPlus size="1.8rem" className="text-brand-700" aria-hidden />
                <span className="text-brand-700 text-lg font-semibold">Nova meta</span>
                <span className="text-muted">Viagem, reserva de emergência, um carro...</span>
              </button>
            )}
          </li>
        </ul>
      )}

      <SavingsGoalDialog open={creating} onClose={() => setCreating(false)} />
      <SavingsGoalDialog open={Boolean(editing)} goal={editing} onClose={() => setEditing(undefined)} />
      <MovementDialog
        goal={movement?.goal}
        type={movement?.type ?? SavingsMovementType.Deposit}
        onClose={() => setMovement(undefined)}
      />
      <HistoryDialog goal={history} onClose={() => setHistory(undefined)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir meta?"
        message={
          <>
            A meta <strong className="text-ink">{deleting?.name}</strong> e todo o histórico de valores
            guardados serão excluídos. Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(undefined)}
        loading={deleteLoading}
        error={deleteError}
      />
    </section>
  );
}

function deadlineLabel(deadline: string) {
  const [year, month] = deadline.split("-").map(Number);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${months[month - 1]}/${year}`;
}

function SavingsGoalCard({
  goal,
  onDeposit,
  onWithdraw,
  onHistory,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // The list has no "por mês"; the detail has it (computed by the API).
  const detail = useSavingsGoal(goal.id);
  const overdue = !goal.isCompleted && goal.deadline !== null && goal.deadline < todayKey();

  return (
    <Card className="flex h-full flex-col p-7">
      <div className="flex items-start gap-4">
        <CategoryIcon icon={goal.icon} color={goal.color} />
        <div className="min-w-0 flex-1">
          <h3 className="text-ink truncate text-xl font-bold">{goal.name}</h3>
          <p className="text-muted">{goal.deadline ? `Até ${deadlineLabel(goal.deadline)}` : "Sem prazo"}</p>
        </div>
        {goal.isCompleted ? (
          <span className="bg-income-soft text-income rounded-full px-4 py-1.5 font-semibold">Concluída</span>
        ) : overdue ? (
          <span className="bg-warning-soft text-warning-ink rounded-full px-4 py-1.5 font-semibold">
            Prazo vencido
          </span>
        ) : null}
        <ActionMenu
          label={`Ações da meta ${goal.name}`}
          items={[
            { label: "Ver histórico", onSelect: onHistory },
            { label: "Editar", onSelect: onEdit },
            { label: "Excluir", onSelect: onDelete, danger: true },
          ]}
        />
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-ink text-[2.4rem] font-bold tracking-tight tabular-nums">
          {formatMoney(goal.savedAmount, { cents: false })}
        </p>
        <p className="text-muted text-base">de {formatMoney(goal.targetAmount, { cents: false })}</p>
      </div>
      <ProgressBar
        value={goal.percentage}
        className="mt-3"
        barClassName={goal.isCompleted ? "bg-income" : overdue ? "bg-warning" : "bg-brand-500"}
        label={`Progresso da meta ${goal.name}`}
      />
      <div className="text-muted mt-3 flex flex-wrap justify-between gap-2 text-base">
        <span>{formatPercent(Math.round(goal.percentage))} concluída</span>
        {detail.data?.monthlyAmountNeeded ? (
          <span>Guardar {formatMoney(detail.data.monthlyAmountNeeded)}/mês</span>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-6">
        <Button onClick={onDeposit} className="h-12 flex-1 px-5 text-base">
          <IconPlus size="1.2rem" aria-hidden /> Guardar
        </Button>
        <Button
          variant="outline"
          onClick={onWithdraw}
          disabled={goal.savedAmount <= 0}
          className="h-12 flex-1 px-5 text-base"
        >
          <IconMinus size="1.2rem" aria-hidden /> Retirar
        </Button>
      </div>
    </Card>
  );
}

function HistoryDialog({ goal, onClose }: { goal?: SavingsGoal; onClose: () => void }) {
  const detail = useSavingsGoal(goal?.id);
  const movements = [...(detail.data?.movements ?? [])].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  );

  return (
    <Dialog open={Boolean(goal)} onClose={onClose} title={`Histórico · ${goal?.name ?? ""}`} variant="drawer">
      {detail.isPending ? (
        <Skeleton className="h-40" />
      ) : detail.isError ? (
        <Alert>{errorMessage(detail.error)}</Alert>
      ) : movements.length === 0 ? (
        <p className="text-muted text-base">Nenhum valor guardado ainda.</p>
      ) : (
        <ul>
          {movements.map((m) => {
            const deposit = m.type === SavingsMovementType.Deposit;
            return (
              <li
                key={m.id}
                className="border-line flex items-center justify-between border-b py-4 last:border-b-0"
              >
                <div>
                  <p className="text-ink text-base font-semibold">{deposit ? "Guardado" : "Retirada"}</p>
                  <p className="text-muted">{formatDayKey(m.date)}</p>
                </div>
                <p
                  className={clsx(
                    "text-base font-semibold tabular-nums",
                    deposit ? "text-income" : "text-expense",
                  )}
                >
                  {deposit ? "+ " : "− "}
                  {formatMoney(m.amount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
}

/* ---------------- Limites de gasto ---------------- */

const STATUS_BAR: Record<LimitStatus, string> = {
  [LimitStatus.Normal]: "bg-income",
  [LimitStatus.Warning]: "bg-warning",
  [LimitStatus.Exceeded]: "bg-expense",
};

function LimitsSection() {
  const client = useQueryClient();
  const plan = usePlanLimits();
  const categories = useCategories();
  const [month, setMonth] = useState<YearMonth>(currentYearMonth);
  const limits = useSpendingLimits(month, categories.data);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SpendingLimit>();
  const [deleting, setDeleting] = useState<SpendingLimit>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copyError, setCopyError] = useState<unknown>();
  const [copying, setCopying] = useState(false);

  const list = limits.data ?? [];
  const max = plan.data?.maxFinancialGoalsPerMonth ?? null;
  const atLimit = max !== null && list.length >= max;
  // The API only accepts new limits from the current (UTC) year on.
  const canCreateHere = month.year >= new Date().getUTCFullYear();
  const previous = addMonths(month, -1);
  const isCurrentOrFuture = monthIndex(month) >= monthIndex(currentYearMonth());

  const copyFromPrevious = async () => {
    setCopyError(undefined);
    setCopying(true);
    try {
      await copyLimits(previous, month);
      invalidateGoals(client);
    } catch (err) {
      setCopyError(err);
    } finally {
      setCopying(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(undefined);
    try {
      await deleteLimit(deleting.id);
      invalidateGoals(client);
      setDeleting(undefined);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section aria-label="Limites de gasto" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <MonthPicker value={month} onChange={setMonth} canGoBack={isMonthAllowed(previous, plan.data)} />
        <div className="flex flex-wrap gap-3">
          {isCurrentOrFuture && list.length === 0 && !limits.isPending && (
            <Button variant="outline" onClick={copyFromPrevious} loading={copying} className="h-12">
              <IconCopy size="1.3rem" aria-hidden /> Copiar do mês anterior
            </Button>
          )}
          <Button
            onClick={() => setCreating(true)}
            disabled={atLimit || !canCreateHere}
            className="h-12 px-8"
            title={!canCreateHere ? "Limites só podem ser criados a partir do ano atual" : undefined}
          >
            <IconPlus size="1.4rem" aria-hidden /> Novo limite
          </Button>
        </div>
      </div>

      <ActionError error={copyError} />

      {max !== null && plan.data && !plan.data.isPremium && (
        <PlanUsageBanner>
          Você usa{" "}
          <strong>
            {Math.min(list.length, max)} de {max} limites
          </strong>{" "}
          neste mês. Com o Premium, os limites são ilimitados e você recebe aviso aos 80%.
        </PlanUsageBanner>
      )}

      {limits.isError ? (
        <ActionError error={limits.error} />
      ) : limits.isPending ? (
        <Skeleton className="h-60" />
      ) : list.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p className="text-ink text-lg font-semibold">Nenhum limite neste mês</p>
          <p className="text-muted max-w-lg text-base">
            Defina quanto quer gastar por categoria (ex.: Mercado até R$ 800) e acompanhe o quanto já usou.
          </p>
        </Card>
      ) : (
        <Card className="px-6 py-2 sm:px-8">
          <ul>
            {list.map((limit) => {
              const over = limit.remainingAmount < 0 || limit.status === LimitStatus.Exceeded;
              return (
                <li
                  key={limit.id}
                  className="border-line flex items-center gap-5 border-b py-6 last:border-b-0"
                >
                  <CategoryIcon icon={limit.icon} color={limit.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-ink truncate text-lg font-semibold">{limit.categoryName}</p>
                      <p className="text-muted text-base tabular-nums">
                        <span className="text-ink font-semibold">{formatMoney(limit.currentAmount)}</span> de{" "}
                        {formatMoney(limit.targetAmount)}
                      </p>
                    </div>
                    <ProgressBar
                      value={limit.percentageUsed}
                      className="mt-3"
                      barClassName={STATUS_BAR[limit.status]}
                      label={`Uso do limite de ${limit.categoryName}`}
                    />
                    <div className="mt-2 flex flex-wrap justify-between gap-2">
                      <span
                        className={clsx(
                          "font-medium",
                          limit.status === LimitStatus.Exceeded
                            ? "text-expense"
                            : limit.status === LimitStatus.Warning
                              ? "text-warning-ink"
                              : "text-muted",
                        )}
                      >
                        {formatPercent(Math.round(limit.percentageUsed))} usado
                        {limit.status === LimitStatus.Warning && " · perto do limite"}
                        {limit.status === LimitStatus.Exceeded && " · limite estourado"}
                      </span>
                      <span className="text-muted">
                        {over
                          ? `Passou ${formatMoney(Math.abs(limit.remainingAmount))}`
                          : `Restam ${formatMoney(limit.remainingAmount)}`}
                      </span>
                    </div>
                  </div>
                  <ActionMenu
                    label={`Ações do limite de ${limit.categoryName}`}
                    items={[
                      { label: "Editar valor", onSelect: () => setEditing(limit) },
                      {
                        label: "Excluir",
                        danger: true,
                        onSelect: () => {
                          setDeleteError(undefined);
                          setDeleting(limit);
                        },
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <LimitDialog
        open={creating}
        onClose={() => setCreating(false)}
        month={month}
        categories={categories.data ?? []}
        usedCategoryIds={list.map((l) => l.categoryId)}
      />
      <LimitDialog
        open={Boolean(editing)}
        onClose={() => setEditing(undefined)}
        month={month}
        limit={editing}
        categories={categories.data ?? []}
        usedCategoryIds={[]}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir limite?"
        message={
          <>
            O limite de <strong className="text-ink">{deleting?.categoryName}</strong> neste mês será
            excluído. Suas despesas não mudam.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(undefined)}
        loading={deleteLoading}
        error={deleteError}
      />
    </section>
  );
}
