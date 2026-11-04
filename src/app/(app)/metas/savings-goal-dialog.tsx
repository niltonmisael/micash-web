"use client";

import { IconCalendar, IconCheck, IconTarget } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import {
  CATEGORY_COLOR_LABELS,
  CATEGORY_COLORS,
  SAVINGS_GOAL_ICON_LABELS,
  SAVINGS_GOAL_ICONS,
  categoryColor,
} from "@/components/app/category-icon";
import { ActionError } from "@/components/app/premium-notice";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Dialog } from "@/components/ui/overlay";
import { invalidateGoals, lastDayOfMonth, saveSavingsGoal } from "@/lib/goals";
import { todayKey } from "@/lib/transactions";
import type { SavingsGoal } from "@/lib/types";

const NAME_MAX_LENGTH = 100; // SavingsGoalRules.NAME_MAX_LENGTH in the API

export function SavingsGoalDialog({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal?: SavingsGoal;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={goal ? "Editar meta" : "Nova meta"} variant="drawer">
      {open && <SavingsGoalForm goal={goal} onClose={onClose} />}
    </Dialog>
  );
}

function SavingsGoalForm({ goal, onClose }: { goal?: SavingsGoal; onClose: () => void }) {
  const client = useQueryClient();
  const currentMonth = todayKey().slice(0, 7);

  const [name, setName] = useState(goal?.name ?? "");
  const [targetCents, setTargetCents] = useState(goal ? Math.round(goal.targetAmount * 100) : 0);
  const [initialCents, setInitialCents] = useState(0);
  const [deadline, setDeadline] = useState(goal?.deadline?.slice(0, 7) ?? "");
  const [icon, setIcon] = useState(goal && goal.icon in SAVINGS_GOAL_ICONS ? goal.icon : "");
  const [color, setColor] = useState(goal ? categoryColor(goal.color).toUpperCase() : "");
  const [formError, setFormError] = useState<string>();
  const [apiError, setApiError] = useState<unknown>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(undefined);
    // Same rules as the API validators (name, target > 0, deadline not before this month, icon, color).
    if (!name.trim()) return setFormError("Informe o nome da meta.");
    if (targetCents <= 0) return setFormError("Informe quanto você quer guardar.");
    if (deadline && deadline < currentMonth)
      return setFormError("O prazo não pode ser um mês que já passou.");
    if (!icon) return setFormError("Escolha um ícone.");
    if (!color) return setFormError("Escolha uma cor.");
    setFormError(undefined);

    setSaving(true);
    try {
      await saveSavingsGoal(
        {
          name: name.trim(),
          targetAmount: targetCents / 100,
          deadline: deadline ? lastDayOfMonth(deadline) : null,
          icon,
          color,
          initialAmount: !goal && initialCents > 0 ? initialCents / 100 : null,
        },
        goal?.id,
      );
      invalidateGoals(client);
      onClose();
    } catch (err) {
      setApiError(err);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7">
      {formError && (
        <p role="alert" className="bg-expense-soft text-expense rounded-2xl px-4 py-3">
          {formError}
        </p>
      )}
      <ActionError error={apiError} />

      <MoneyInput
        label="Quanto quer guardar"
        cents={targetCents}
        onChange={setTargetCents}
        colorClass="text-ink"
      />

      <Field
        label="Nome"
        icon={IconTarget}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Viagem"
        maxLength={NAME_MAX_LENGTH}
        autoFocus
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Prazo (opcional)"
          type="month"
          icon={IconCalendar}
          value={deadline}
          min={currentMonth}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {!goal && <InitialAmount cents={initialCents} onChange={setInitialCents} />}
      </div>

      <fieldset>
        <legend className="text-muted text-base font-medium">Ícone</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(SAVINGS_GOAL_ICONS).map(([key, Glyph]) => (
            <label
              key={key}
              title={SAVINGS_GOAL_ICON_LABELS[key]}
              className={clsx(
                "has-[:focus-visible]:ring-brand-500 grid size-16 cursor-pointer place-items-center rounded-2xl border transition-colors has-[:focus-visible]:ring-2",
                icon === key
                  ? "border-brand-500 bg-brand-100 text-brand-700"
                  : "border-line text-muted hover:bg-brand-50",
              )}
            >
              <input
                type="radio"
                name="goal-icon"
                checked={icon === key}
                onChange={() => setIcon(key)}
                className="sr-only"
                aria-label={SAVINGS_GOAL_ICON_LABELS[key]}
              />
              <Glyph size="1.6rem" aria-hidden />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-muted text-base font-medium">Cor</legend>
        <div className="mt-3 flex flex-wrap gap-4">
          {CATEGORY_COLORS.map((hex) => (
            <label
              key={hex}
              title={CATEGORY_COLOR_LABELS[hex]}
              className={clsx(
                "has-[:focus-visible]:ring-brand-500 ring-offset-surface grid size-14 cursor-pointer place-items-center rounded-full ring-offset-2 has-[:focus-visible]:ring-2",
                color === hex && "ring-ink ring-2",
              )}
              style={{ background: hex }}
            >
              <input
                type="radio"
                name="goal-color"
                checked={color === hex}
                onChange={() => setColor(hex)}
                className="sr-only"
                aria-label={CATEGORY_COLOR_LABELS[hex]}
              />
              {color === hex && <IconCheck size="1.5rem" className="text-white" aria-hidden />}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" block loading={saving}>
        <IconCheck size="1.3rem" aria-hidden /> Salvar meta
      </Button>
    </form>
  );
}

/** "Já guardado (opcional)" — becomes an initial deposit in the goal history. */
function InitialAmount({ cents, onChange }: { cents: number; onChange: (cents: number) => void }) {
  return (
    <Field
      label="Já guardado (opcional)"
      inputMode="numeric"
      value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 11) || "0"))}
    />
  );
}
