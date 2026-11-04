"use client";

import { IconCheck, IconTag } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/overlay";
import { errorMessage } from "@/lib/api";
import { invalidateEntries, saveCategory } from "@/lib/entries";
import type { Category } from "@/lib/transactions";
import {
  CATEGORY_COLOR_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICONS,
  categoryColor,
} from "./category-icon";

const NAME_MAX_LENGTH = 100; // categories.name column

/**
 * Side panel to create or edit an expense category. Income categories are a fixed list in the API, so
 * there is no Despesa/Receita switch here (unlike the prototype).
 */
export function CategoryDialog({
  open,
  onClose,
  category,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Present = edit. */
  category?: Category;
  /** Called with the saved name (the create endpoint does not return the new id). */
  onSaved?: (name: string) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Editar categoria" : "Nova categoria"}
      variant="drawer"
    >
      {/* Remounted on every open, so the form starts from the category (or empty). */}
      {open && <CategoryForm category={category} onClose={onClose} onSaved={onSaved} />}
    </Dialog>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category && category.icon in CATEGORY_ICONS ? category.icon : "");
  const [color, setColor] = useState(category ? categoryColor(category.color).toUpperCase() : "");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Informe o nome da categoria.");
    if (!icon) return setError("Escolha um ícone.");
    if (!color) return setError("Escolha uma cor.");

    setError(undefined);
    setSaving(true);
    try {
      await saveCategory({ name: trimmed, icon, color }, category?.id);
      await client.invalidateQueries({ queryKey: ["categories"] });
      // Category name/color/icon also show on the transactions and the dashboard.
      if (category) invalidateEntries(client);
      onSaved?.(trimmed);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      {error && <Alert>{error}</Alert>}
      <Field
        label="Nome"
        icon={IconTag}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Pets"
        maxLength={NAME_MAX_LENGTH}
        autoFocus
      />

      <fieldset>
        <legend className="text-muted text-base font-medium">Ícone</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(CATEGORY_ICONS).map(([key, Glyph]) => {
            const selected = icon === key;
            return (
              <label
                key={key}
                title={CATEGORY_ICON_LABELS[key]}
                className={clsx(
                  "has-[:focus-visible]:ring-brand-500 grid size-16 cursor-pointer place-items-center rounded-2xl border transition-colors has-[:focus-visible]:ring-2",
                  selected
                    ? "border-brand-500 bg-brand-100 text-brand-700"
                    : "border-line text-muted hover:bg-brand-50",
                )}
              >
                <input
                  type="radio"
                  name="category-icon"
                  value={key}
                  checked={selected}
                  onChange={() => setIcon(key)}
                  className="sr-only"
                  aria-label={CATEGORY_ICON_LABELS[key]}
                />
                <Glyph size="1.6rem" aria-hidden />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-muted text-base font-medium">Cor</legend>
        <div className="mt-3 flex flex-wrap gap-4">
          {CATEGORY_COLORS.map((hex) => {
            const selected = color === hex;
            return (
              <label
                key={hex}
                title={CATEGORY_COLOR_LABELS[hex]}
                className={clsx(
                  "has-[:focus-visible]:ring-brand-500 ring-offset-surface grid size-14 cursor-pointer place-items-center rounded-full ring-offset-2 has-[:focus-visible]:ring-2",
                  selected && "ring-ink ring-2",
                )}
                style={{ background: hex }}
              >
                <input
                  type="radio"
                  name="category-color"
                  value={hex}
                  checked={selected}
                  onChange={() => setColor(hex)}
                  className="sr-only"
                  aria-label={CATEGORY_COLOR_LABELS[hex]}
                />
                {selected && <IconCheck size="1.5rem" className="text-white" aria-hidden />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Button type="submit" block loading={saving}>
        <IconCheck size="1.3rem" aria-hidden /> Salvar categoria
      </Button>
    </form>
  );
}
