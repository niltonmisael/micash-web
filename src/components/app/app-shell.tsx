"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Sidebar } from "./sidebar";

/** Graphite sidebar fixed on desktop; drawer on small screens. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="bg-cream min-h-dvh">
      <aside className="bg-rail fixed inset-y-0 left-0 hidden w-[16.5rem] overflow-y-auto lg:block">
        <Sidebar />
      </aside>

      <header className="border-line bg-surface/95 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:hidden">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-ink hover:bg-brand-50 -mr-1 grid size-11 place-items-center rounded-xl"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <IconMenu2 size="1.5rem" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="absolute inset-0 bg-[#0c0b0a]/60"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div className="bg-rail absolute inset-y-0 left-0 w-[min(18rem,85vw)] overflow-y-auto">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-rail-muted hover:text-rail-ink absolute top-5 right-3 grid size-11 place-items-center rounded-xl"
              aria-label="Fechar menu"
            >
              <IconX size="1.4rem" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="px-4 pt-6 pb-16 sm:px-8 lg:ml-[16.5rem] lg:px-10 lg:pt-9 2xl:px-14">
        <div className="mx-auto w-full max-w-[96rem]">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="text-ink text-[2rem] leading-[1.1] font-bold sm:text-[2.35rem]">{title}</h1>
        <p className="text-muted mt-1.5 text-base">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
