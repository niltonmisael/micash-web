"use client";

import { IconCheck, IconLayoutGrid } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionError } from "@/components/app/premium-notice";
import { Button } from "@/components/ui/button";
import { MoneyInput, Select } from "@/components/ui/controls";
import { Dialog } from "@/components/ui/overlay";
import { monthLabel, type YearMonth } from "@/lib/format";
import { createLimit, invalidateGoals, updateLimit, type SpendingLimit } from "@/lib/goals";
import type { Category } from "@/lib/transactions";

/** New spending limit for a category in the month, or edit the amount of an existing one. */
export function LimitDialog({
  open,
  onClose,
  month,
  limit,
  categories,
  usedCategoryIds,
}: {
  open: boolean;
  onClose: () => void;
  month: YearMonth;
  limit?: SpendingLimit;
  categories: Category[];
  usedCategoryIds: number[];
}) {
  return (
    <Dialog open={open} onClose={onClose} title={limit ? "Editar limite" : "Novo limite de gasto"} size="sm">
      {open && (
        <LimitForm
          month={month}
          limit={limit}
          categories={categories.filter((c) => !usedCategoryIds.includes(c.id))}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function LimitForm({
  month,
  limit,
  categories,
  onClose,
}: {
  month: YearMonth;
  limit?: SpendingLimit;
  categories: Category[];
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [categoryId, setCategoryId] = useState<number | undefined>(limit?.categoryId);
  const [cents, setCents] = useState(limit ? Math.round(limit.targetAmount * 100) : 0);
  const [formError, setFormError] = useState<string>();
  const [apiError, setApiError] = useState<unknown>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(undefined);
    if (!limit && categoryId === undefined) return setFormError("Selecione uma categoria.");
    if (cents <= 0) return setFormError("Informe um valor maior que zero.");
    setFormError(undefined);

    setSaving(true);
    try {
      if (limit) await updateLimit(limit.id, cents / 100);
      else await createLimit({ categoryId: categoryId!, targetAmount: cents / 100, ...month });
      invalidateGoals(client);
      onClose();
    } catch (err) {
      setApiError(err);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <p className="text-muted text-base">
        Quanto você quer gastar, no máximo, em <strong className="text-ink">{monthLabel(month)}</strong>.
      </p>
      {formError && (
        <p role="alert" className="bg-expense-soft text-expense rounded-2xl px-4 py-3">
          {formError}
        </p>
      )}
      <ActionError error={apiError} />

      {limit ? (
        <p className="text-ink text-lg font-semibold">{limit.categoryName}</p>
      ) : categories.length === 0 ? (
        <p className="text-muted">Todas as suas categorias já têm limite neste mês.</p>
      ) : (
        <Select
          label="Categoria"
          icon={IconLayoutGrid}
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="" disabled>
            Selecione
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      <MoneyInput label="Limite do mês" cents={cents} onChange={setCents} colorClass="text-ink" />

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving} disabled={!limit && categories.length === 0}>
          <IconCheck size="1.3rem" aria-hidden /> Salvar limite
        </Button>
      </div>
    </form>
  );
}
