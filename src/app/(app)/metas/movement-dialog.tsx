"use client";

import { IconCalendar, IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionError } from "@/components/app/premium-notice";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Dialog } from "@/components/ui/overlay";
import { formatMoney } from "@/lib/format";
import { addSavingsMovement, invalidateGoals, SavingsMovementType } from "@/lib/goals";
import { todayKey } from "@/lib/transactions";
import type { SavingsGoal } from "@/lib/types";

/** "Guardar dinheiro" / "Retirar dinheiro" of a savings goal. */
export function MovementDialog({
  goal,
  type,
  onClose,
}: {
  goal?: SavingsGoal;
  type: SavingsMovementType;
  onClose: () => void;
}) {
  const deposit = type === SavingsMovementType.Deposit;
  return (
    <Dialog
      open={Boolean(goal)}
      onClose={onClose}
      title={deposit ? "Guardar dinheiro" : "Retirar dinheiro"}
      size="sm"
    >
      {goal && <MovementForm goal={goal} type={type} onClose={onClose} />}
    </Dialog>
  );
}

function MovementForm({
  goal,
  type,
  onClose,
}: {
  goal: SavingsGoal;
  type: SavingsMovementType;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const deposit = type === SavingsMovementType.Deposit;
  const today = todayKey();
  const [cents, setCents] = useState(0);
  const [date, setDate] = useState(today);
  const [formError, setFormError] = useState<string>();
  const [apiError, setApiError] = useState<unknown>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(undefined);
    // Same rules as ValidatorSavingsMovement: amount > 0, date not in the future, withdrawal ≤ saved.
    if (cents <= 0) return setFormError("Informe um valor maior que zero.");
    if (!deposit && cents > Math.round(goal.savedAmount * 100))
      return setFormError("O valor é maior que o guardado na meta.");
    if (!date) return setFormError("Informe a data.");
    if (date > today) return setFormError("A data não pode ser futura.");
    setFormError(undefined);

    setSaving(true);
    try {
      await addSavingsMovement(goal.id, type, cents / 100, date);
      invalidateGoals(client);
      onClose();
    } catch (err) {
      setApiError(err);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <p className="text-muted text-lg">
        Meta <strong className="text-ink">{goal.name}</strong> · guardado {formatMoney(goal.savedAmount)}
      </p>
      {formError && (
        <p role="alert" className="bg-expense-soft text-expense rounded-2xl px-4 py-3">
          {formError}
        </p>
      )}
      <ActionError error={apiError} />
      <MoneyInput
        label="Valor"
        cents={cents}
        onChange={setCents}
        colorClass={deposit ? "text-income" : "text-expense"}
      />
      <Field
        label="Data"
        type="date"
        icon={IconCalendar}
        value={date}
        max={today}
        onChange={(e) => setDate(e.target.value)}
      />
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          <IconCheck size="1.3rem" aria-hidden /> {deposit ? "Guardar" : "Retirar"}
        </Button>
      </div>
    </form>
  );
}
