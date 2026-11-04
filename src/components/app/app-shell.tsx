"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Sidebar } from "./sidebar";

/** Fixed sidebar on desktop; drawer on small screens. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="bg-cream min-h-dvh">
      <aside className="border-line bg-surface fixed inset-y-0 left-0 hidden w-[22.5rem] overflow-y-auto border-r lg:block">
        <Sidebar />
      </aside>

      <header className="border-line bg-surface sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-ink rounded-xl p-2"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <IconMenu2 size="1.75rem" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="absolute inset-0 bg-black/55"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div className="bg-surface absolute inset-y-0 left-0 w-[min(22.5rem,85vw)] overflow-y-auto">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted absolute top-4 right-4 rounded-xl p-2"
              aria-label="Fechar menu"
            >
              <IconX size="1.625rem" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="px-4 py-8 sm:px-8 lg:ml-[22.5rem] lg:px-14 lg:py-9">{children}</main>
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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-ink text-[2.6rem] leading-tight font-bold tracking-tight">{title}</h1>
        <p className="text-muted mt-1 text-xl">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-4">{actions}</div>}
    </div>
  );
}
