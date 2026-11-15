"use client";

import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { CategoryDialog } from "@/components/app/category-dialog";
import { CategoryIcon, IncomeIcon } from "@/components/app/category-icon";
import { Button } from "@/components/ui/button";
import { Alert, Card, Skeleton } from "@/components/ui/misc";
import { ActionMenu, ConfirmDialog } from "@/components/ui/overlay";
import { errorMessage } from "@/lib/api";
import { deleteCategory, invalidateEntries, useCategories } from "@/lib/entries";
import { INCOME_CATEGORIES, INCOME_CATEGORY_LABELS, type Category } from "@/lib/transactions";

export function Categories() {
  const client = useQueryClient();
  const categories = useCategories();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category>();
  const [deleting, setDeleting] = useState<Category>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const list = [...(categories.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(undefined);
    try {
      await deleteCategory(deleting.id);
      await client.invalidateQueries({ queryKey: ["categories"] });
      invalidateEntries(client);
      setDeleting(undefined);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Categorias"
        subtitle="Organize suas receitas e despesas"
        actions={
          <Button onClick={() => setCreating(true)} className="h-12 px-8">
            <IconPlus size="1.4rem" aria-hidden /> Nova categoria
          </Button>
        }
      />

      <section aria-labelledby="expense-categories">
        <h2 id="expense-categories" className="text-ink text-xl font-bold">
          Despesas <span className="text-subtle font-semibold">· {list.length}</span>
        </h2>
        <div className="mt-5">
          {categories.isError ? (
            <Alert>{errorMessage(categories.error)}</Alert>
          ) : categories.isPending ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <p className="text-ink text-lg font-semibold">Você ainda não tem categorias de despesa</p>
              <p className="text-muted text-base">Crie categorias como Mercado, Moradia ou Transporte.</p>
              <Button onClick={() => setCreating(true)}>
                <IconPlus size="1.3rem" aria-hidden /> Nova categoria
              </Button>
            </Card>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {list.map((category) => (
                <li key={category.id}>
                  <Card className="flex items-center gap-5 px-6 py-5">
                    <CategoryIcon icon={category.icon} color={category.color} />
                    <p className="text-ink min-w-0 flex-1 truncate text-lg font-semibold">{category.name}</p>
                    <ActionMenu
                      horizontal
                      label={`Ações de ${category.name}`}
                      items={[
                        { label: "Editar", onSelect: () => setEditing(category) },
                        {
                          label: "Excluir",
                          danger: true,
                          onSelect: () => {
                            setDeleteError(undefined);
                            setDeleting(category);
                          },
                        },
                      ]}
                    />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="income-categories">
        <h2 id="income-categories" className="text-ink text-xl font-bold">
          Receitas <span className="text-subtle font-semibold">· {INCOME_CATEGORIES.length}</span>
        </h2>
        <p className="text-muted mt-1 text-base">
          As categorias de receita são fixas: as mesmas do app e de todos os usuários.
        </p>
        <ul className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {INCOME_CATEGORIES.map((value) => (
            <li key={value}>
              <Card className="flex items-center gap-5 px-6 py-5">
                <IncomeIcon category={value} />
                <p className="text-ink text-lg font-semibold">{INCOME_CATEGORY_LABELS[value]}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <CategoryDialog open={creating} onClose={() => setCreating(false)} />
      <CategoryDialog open={Boolean(editing)} category={editing} onClose={() => setEditing(undefined)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir categoria?"
        message={
          <>
            A categoria <strong className="text-ink">{deleting?.name}</strong> deixa de aparecer para novos
            lançamentos. As despesas já registradas nela continuam como estão.
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
