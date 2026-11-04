"use client";

import { IconLayoutGrid, IconPlus, IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { CategoryIcon, IncomeIcon } from "@/components/app/category-icon";
import { MonthPicker } from "@/components/app/month-picker";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Segmented, Select } from "@/components/ui/controls";
import { Alert, Card, Skeleton } from "@/components/ui/misc";
import { ActionMenu, ConfirmDialog } from "@/components/ui/overlay";
import { errorMessage } from "@/lib/api";
import { deleteTransaction, invalidateEntries, useCategories, useTransactions } from "@/lib/entries";
import { currentYearMonth, formatMoney, type YearMonth } from "@/lib/format";
import {
  ExpenseStatus,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  TransactionType,
  paymentTypeLabel,
  relativeDayKey,
  type IncomeCategory,
  type Transaction,
} from "@/lib/transactions";

const PAGE_SIZE = 10;

type TypeFilter = "all" | TransactionType;
/** "" = all, "e:<id>" = expense category, "i:<value>" = income category. */
type CategoryFilter = string;

export function Transactions() {
  const client = useQueryClient();
  const categories = useCategories();

  const [month, setMonth] = useState<YearMonth>(currentYearMonth);
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Transaction>();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Transaction>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search waits for a pause in typing instead of calling the API on every key.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const query = useTransactions({
    ...month,
    type: type === "all" ? undefined : type,
    categoryId: category.startsWith("e:") ? Number(category.slice(2)) : undefined,
    incomeCategory: category.startsWith("i:") ? (Number(category.slice(2)) as IncomeCategory) : undefined,
    search,
    page,
    pageSize: PAGE_SIZE,
  });
  const result = query.data;

  const changeType = (value: TypeFilter) => {
    setType(value);
    // A category of the other kind would empty the list.
    if (
      (value === TransactionType.Income && category.startsWith("e:")) ||
      (value === TransactionType.Expense && category.startsWith("i:"))
    )
      setCategory("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(undefined);
    try {
      await deleteTransaction(deleting);
      invalidateEntries(client);
      setDeleting(undefined);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasFilters = type !== "all" || category !== "" || search !== "";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Transações"
        subtitle="Todas as suas receitas e despesas"
        actions={
          <Button onClick={() => setCreating(true)} className="h-16 px-8">
            <IconPlus size="1.4rem" aria-hidden /> Nova transação
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <Segmented<TypeFilter>
          label="Tipo"
          value={type}
          onChange={changeType}
          className="border-line border bg-white"
          options={[
            { value: "all", label: "Todas" },
            { value: TransactionType.Income, label: "Receitas" },
            { value: TransactionType.Expense, label: "Despesas" },
          ]}
        />
        <MonthPicker
          value={month}
          onChange={(value) => {
            setMonth(value);
            setPage(1);
          }}
        />
        <Select
          label="Categoria"
          hideLabel
          icon={IconLayoutGrid}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="min-w-60"
        >
          <option value="">Todas as categorias</option>
          {type !== TransactionType.Income && (categories.data?.length ?? 0) > 0 && (
            <optgroup label="Despesas">
              {categories.data!.map((c) => (
                <option key={c.id} value={`e:${c.id}`}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
          {type !== TransactionType.Expense && (
            <optgroup label="Receitas">
              {INCOME_CATEGORIES.map((value) => (
                <option key={value} value={`i:${value}`}>
                  {INCOME_CATEGORY_LABELS[value]}
                </option>
              ))}
            </optgroup>
          )}
        </Select>
        <label className="border-line focus-within:border-brand-500 focus-within:ring-brand-100 flex h-16 min-w-60 flex-1 items-center gap-3 rounded-2xl border bg-white px-4 focus-within:ring-4">
          <IconSearch size="1.3rem" className="text-subtle" aria-hidden />
          <span className="sr-only">Buscar transação</span>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar transação"
            className="text-ink placeholder:text-subtle h-full w-full bg-transparent text-lg outline-none focus-visible:outline-none"
          />
        </label>
      </div>

      <Card className="px-4 py-4 sm:px-8 sm:py-6">
        {query.isError ? (
          <div className="py-8">
            <Alert>{errorMessage(query.error)}</Alert>
          </div>
        ) : query.isPending ? (
          <div className="flex flex-col gap-3 py-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : result && result.data.length > 0 ? (
          <>
            <table
              className={clsx("w-full border-collapse", query.isFetching && "opacity-60 transition-opacity")}
            >
              <caption className="sr-only">Transações do mês</caption>
              <thead className="hidden md:table-header-group">
                <tr className="text-muted border-line border-b text-left text-base">
                  <th scope="col" className="py-4 pr-4 font-medium">
                    Data
                  </th>
                  <th scope="col" className="py-4 pr-4 font-medium">
                    Descrição
                  </th>
                  <th scope="col" className="py-4 pr-4 font-medium">
                    Categoria
                  </th>
                  <th scope="col" className="hidden py-4 pr-4 font-medium lg:table-cell">
                    Pagamento
                  </th>
                  <th scope="col" className="py-4 pr-4 text-right font-medium">
                    Valor
                  </th>
                  <th scope="col" className="w-12 py-4">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((t) => (
                  <TransactionRow
                    key={`${t.type}-${t.id}`}
                    transaction={t}
                    onEdit={() => setEditing(t)}
                    onDelete={() => {
                      setDeleteError(undefined);
                      setDeleting(t);
                    }}
                  />
                ))}
              </tbody>
            </table>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              shown={result.data.length}
              total={result.totalRecords}
              onChange={setPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-ink text-xl font-semibold">
              {hasFilters ? "Nenhuma transação encontrada" : "Nenhuma transação neste mês"}
            </p>
            <p className="text-muted text-lg">
              {hasFilters
                ? "Tente outro filtro ou limpe a busca."
                : "Registre uma receita ou despesa para começar."}
            </p>
            {!hasFilters && (
              <Button onClick={() => setCreating(true)}>
                <IconPlus size="1.3rem" aria-hidden /> Nova transação
              </Button>
            )}
          </div>
        )}
      </Card>

      <TransactionDialog open={creating} onClose={() => setCreating(false)} />
      <TransactionDialog
        open={Boolean(editing)}
        transaction={editing}
        onClose={() => setEditing(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.type === TransactionType.Income ? "Excluir receita?" : "Excluir despesa?"}
        message={
          <>
            <strong className="text-ink">{deleting?.title}</strong> ({formatMoney(deleting?.amount ?? 0)})
            será excluída. Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(undefined)}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}

function TransactionRow({
  transaction: t,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = t.type === TransactionType.Income;
  const categoryLabel = isIncome
    ? t.incomeCategory
      ? INCOME_CATEGORY_LABELS[t.incomeCategory]
      : "Receita"
    : (t.categoryName ?? "Sem categoria");
  const detail = isIncome ? (t.isRecurring ? "Recorrente" : "") : paymentTypeLabel(t.paymentType);
  const pending = t.expenseStatus === ExpenseStatus.Pending;

  return (
    <tr className="border-line border-b last:border-b-0">
      <td className="text-muted hidden py-4 pr-4 text-lg whitespace-nowrap md:table-cell">
        {relativeDayKey(t.date)}
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          {isIncome ? (
            <IncomeIcon category={t.incomeCategory} />
          ) : (
            <CategoryIcon icon={t.categoryIcon} color={t.categoryColor} />
          )}
          <div className="min-w-0">
            <p className="text-ink truncate text-lg font-semibold">{t.title}</p>
            {/* Small screens: date and category under the title instead of their own columns. */}
            <p className="text-muted text-base md:hidden">
              {relativeDayKey(t.date)} · {categoryLabel}
            </p>
            {pending && <p className="text-warning-ink text-sm font-semibold">Pendente</p>}
          </div>
        </div>
      </td>
      <td className="hidden py-4 pr-4 md:table-cell">
        <span className="bg-brand-50 text-ink inline-block rounded-full px-4 py-1.5 text-base font-medium">
          {categoryLabel}
        </span>
      </td>
      <td className="text-muted hidden py-4 pr-4 text-lg lg:table-cell">{detail}</td>
      <td
        className={clsx(
          "py-4 pr-4 text-right text-lg font-semibold whitespace-nowrap tabular-nums",
          isIncome ? "text-income" : "text-expense",
        )}
      >
        <span className="sr-only">{isIncome ? "Receita de" : "Despesa de"}</span>
        <span aria-hidden>{isIncome ? "+ " : "− "}</span>
        {formatMoney(t.amount)}
      </td>
      <td className="py-4 text-right">
        <ActionMenu
          label={`Ações de ${t.title}`}
          items={[
            { label: "Editar", onSelect: onEdit },
            { label: "Excluir", onSelect: onDelete, danger: true },
          ]}
        />
      </td>
    </tr>
  );
}

function Pagination({
  page,
  totalPages,
  shown,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  shown: number;
  total: number;
  onChange: (page: number) => void;
}) {
  // Up to 5 page numbers around the current one.
  const first = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => first + i);

  return (
    <nav
      aria-label="Paginação"
      className="border-line mt-2 flex flex-wrap items-center justify-between gap-4 border-t pt-5"
    >
      <p className="text-muted text-lg">
        Mostrando {shown} de {total} {total === 1 ? "transação" : "transações"}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <PageButton disabled={page <= 1} onClick={() => onChange(page - 1)}>
            Anterior
          </PageButton>
          {pages.map((p) => (
            <PageButton key={p} active={p === page} onClick={() => onChange(p)} label={`Página ${p}`}>
              {p}
            </PageButton>
          ))}
          <PageButton disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
            Próxima
          </PageButton>
        </div>
      )}
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "min-w-12 rounded-full px-4 py-2.5 text-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-brand-600 text-white" : "bg-brand-50 text-ink hover:bg-brand-100",
      )}
    >
      {children}
    </button>
  );
}
