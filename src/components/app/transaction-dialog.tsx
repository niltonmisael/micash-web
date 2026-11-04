"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCalendar,
  IconCheck,
  IconCreditCard,
  IconPencil,
  IconPlus,
  IconRepeat,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoneyInput, Segmented, Select, Toggle } from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Alert, Skeleton } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/overlay";
import { errorMessage } from "@/lib/api";
import { parseApiDate } from "@/lib/format";
import { invalidateEntries, saveExpense, saveIncome, useCategories } from "@/lib/entries";
import {
  ExpenseStatus,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  PAYMENT_TYPE_OPTIONS,
  PaymentType,
  TransactionType,
  expenseDateFromDay,
  todayKey,
  type Category,
  type IncomeCategory,
  type Transaction,
} from "@/lib/transactions";
import { CategoryDialog } from "./category-dialog";
import { CATEGORY_ICONS, categoryColor, incomeIcon } from "./category-icon";

/** Modal "Nova transação" (or edit, when `transaction` is given). */
export function TransactionDialog({
  open,
  onClose,
  transaction,
  initialType = TransactionType.Expense,
}: {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  initialType?: TransactionType;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={transaction ? "Editar transação" : "Nova transação"}>
      {open && <TransactionForm transaction={transaction} initialType={initialType} onClose={onClose} />}
    </Dialog>
  );
}

type Errors = Partial<Record<"amount" | "title" | "category" | "date" | "paymentType", string>>;

function TransactionForm({
  transaction,
  initialType,
  onClose,
}: {
  transaction?: Transaction;
  initialType: TransactionType;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const categories = useCategories();
  const editing = Boolean(transaction);

  const [type, setType] = useState(transaction?.type ?? initialType);
  const [cents, setCents] = useState(transaction ? Math.round(transaction.amount * 100) : 0);
  const [title, setTitle] = useState(transaction?.title ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(transaction?.categoryId ?? undefined);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory | undefined>(
    transaction?.incomeCategory ?? undefined,
  );
  const [day, setDay] = useState(transaction?.date ?? todayKey());
  const [paymentType, setPaymentType] = useState<PaymentType | undefined>(
    transaction?.paymentType ?? undefined,
  );
  const [status, setStatus] = useState(transaction?.expenseStatus ?? ExpenseStatus.Paid);
  const [recurring, setRecurring] = useState(transaction?.isRecurring ?? false);

  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const isIncome = type === TransactionType.Income;
  const today = todayKey();

  const validate = (): Errors => {
    const next: Errors = {};
    if (cents <= 0) next.amount = "Informe um valor maior que zero.";
    if (!title.trim()) next.title = "Informe uma descrição.";
    if (!day) next.date = "Informe a data.";
    else if (!isIncome && day > today) next.date = "A data da despesa não pode ser futura.";
    if (isIncome ? incomeCategory === undefined : categoryId === undefined)
      next.category = "Selecione uma categoria.";
    if (!isIncome && paymentType === undefined) next.paymentType = "Selecione a forma de pagamento.";
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError(undefined);
    setSaving(true);
    try {
      const amount = cents / 100;
      if (isIncome) {
        await saveIncome(
          {
            title: title.trim(),
            description: transaction?.description ?? null,
            amount,
            receivedAt: day,
            incomeCategory: incomeCategory!,
            isRecurring: recurring,
          },
          transaction?.id,
        );
      } else {
        await saveExpense(
          {
            title: title.trim(),
            description: transaction?.description ?? "",
            // Editing without changing the day keeps the original time of the expense.
            expenseDate:
              transaction?.expenseDate && transaction.date === day
                ? parseApiDate(transaction.expenseDate).toISOString()
                : expenseDateFromDay(day),
            amount,
            paymentType: paymentType!,
            expenseStatus: status,
            categoryId: categoryId!,
          },
          transaction?.id,
        );
      }
      invalidateEntries(client);
      onClose();
    } catch (err) {
      setServerError(errorMessage(err));
      setSaving(false);
    }
  };

  const chip = (selected: boolean) =>
    clsx(
      "has-[:focus-visible]:ring-brand-500 flex w-[7.4rem] cursor-pointer flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-center text-base transition-colors has-[:focus-visible]:ring-2",
      selected
        ? isIncome
          ? "border-income bg-income-soft text-income font-semibold"
          : "border-expense bg-expense-soft text-expense font-semibold"
        : "border-line text-muted hover:bg-brand-50",
    );

  return (
    <>
      <form onSubmit={submit} noValidate className="flex flex-col gap-7">
        {/* The kind of an existing entry cannot change: they live in different API resources. */}
        {!editing && (
          <Segmented
            label="Tipo de transação"
            value={type}
            onChange={(value) => {
              setType(value);
              setErrors({});
            }}
            options={[
              {
                value: TransactionType.Expense,
                label: (
                  <>
                    <IconArrowUpRight size="1.2rem" aria-hidden /> Despesa
                  </>
                ),
                activeClass: "bg-expense text-white",
              },
              {
                value: TransactionType.Income,
                label: (
                  <>
                    <IconArrowDownLeft size="1.2rem" aria-hidden /> Receita
                  </>
                ),
                activeClass: "bg-income text-white",
              },
            ]}
          />
        )}

        {serverError && <Alert>{serverError}</Alert>}

        <MoneyInput
          label="Valor"
          cents={cents}
          onChange={setCents}
          colorClass={isIncome ? "text-income" : "text-expense"}
          error={errors.amount}
        />

        <Field
          label="Descrição"
          icon={IconPencil}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isIncome ? "Ex.: Salário de novembro" : "Ex.: Supermercado"}
          maxLength={100}
          error={errors.title}
        />

        <fieldset>
          <legend className="text-muted text-base font-medium">Categoria</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {isIncome ? (
              INCOME_CATEGORIES.map((value) => {
                const Glyph = incomeIcon(value);
                return (
                  <label key={value} className={chip(incomeCategory === value)}>
                    <input
                      type="radio"
                      name="income-category"
                      checked={incomeCategory === value}
                      onChange={() => setIncomeCategory(value)}
                      className="sr-only"
                    />
                    <Glyph size="1.6rem" aria-hidden />
                    {INCOME_CATEGORY_LABELS[value]}
                  </label>
                );
              })
            ) : categories.isPending ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              (categories.data ?? []).map((category) => {
                const Glyph = CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS.dots;
                const selected = categoryId === category.id;
                return (
                  <label key={category.id} className={chip(selected)}>
                    <input
                      type="radio"
                      name="expense-category"
                      checked={selected}
                      onChange={() => setCategoryId(category.id)}
                      className="sr-only"
                    />
                    <Glyph
                      size="1.6rem"
                      aria-hidden
                      style={selected ? undefined : { color: categoryColor(category.color) }}
                    />
                    <span className="w-full truncate">{category.name}</span>
                  </label>
                );
              })
            )}
          </div>
          {!isIncome && (
            <Button
              type="button"
              variant="link"
              onClick={() => setCreatingCategory(true)}
              className="mt-4 text-lg"
            >
              <IconPlus size="1.2rem" aria-hidden /> Criar nova categoria
            </Button>
          )}
          {isIncome && <p className="text-muted mt-3 text-sm">As categorias de receita são fixas.</p>}
          {errors.category && <p className="text-expense mt-2 text-base">{errors.category}</p>}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Data"
            type="date"
            icon={IconCalendar}
            value={day}
            max={isIncome ? undefined : today}
            onChange={(e) => setDay(e.target.value)}
            error={errors.date}
          />
          {!isIncome && (
            <div>
              <Select
                label="Forma de pagamento"
                icon={IconCreditCard}
                value={paymentType ?? ""}
                onChange={(e) =>
                  setPaymentType(e.target.value === "" ? undefined : (Number(e.target.value) as PaymentType))
                }
              >
                <option value="" disabled>
                  Selecione
                </option>
                {PAYMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.paymentType && <p className="text-expense mt-2 text-base">{errors.paymentType}</p>}
            </div>
          )}
        </div>

        {isIncome ? (
          <Toggle label="Repetir mensalmente" icon={IconRepeat} checked={recurring} onChange={setRecurring} />
        ) : (
          <Segmented
            label="Situação"
            value={status}
            onChange={setStatus}
            className="bg-brand-50 sm:max-w-sm"
            options={[
              { value: ExpenseStatus.Paid, label: "Pago" },
              { value: ExpenseStatus.Pending, label: "Pendente" },
            ]}
          />
        )}

        <div className="flex flex-wrap justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} className="min-w-56">
            <IconCheck size="1.3rem" aria-hidden /> {isIncome ? "Salvar receita" : "Salvar despesa"}
          </Button>
        </div>
      </form>

      {/* Outside the <form>: React events bubble through portals, so a nested submit would also save the transaction. */}
      <CategoryDialog
        open={creatingCategory}
        onClose={() => setCreatingCategory(false)}
        onSaved={(name) => {
          // The create endpoint returns only the name; the drawer already refetched the list, so pick the
          // newest category with that name.
          const created = (client.getQueryData<Category[]>(["categories"]) ?? [])
            .filter((c) => c.name === name)
            .sort((a, b) => b.id - a.id)[0];
          if (created) setCategoryId(created.id);
        }}
      />
    </>
  );
}
