"use client";

import { IconDotsVertical, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

/** Open dialogs, newest last: only the top one reacts to Esc/Tab (a category drawer over the transaction modal). */
const openDialogs: object[] = [];

/** Esc closes, Tab stays inside, focus returns to the opener and the page behind does not scroll. */
function useDialogBehavior(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const token = {};
    openDialogs.push(token);
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    if (!panel?.contains(document.activeElement))
      (panel?.querySelector<HTMLElement>("[autofocus]") ?? focusables()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== token) return;
      if (event.key === "Escape") {
        onCloseRef.current();
      }
      if (event.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openDialogs.splice(openDialogs.indexOf(token), 1);
      if (openDialogs.length === 0) document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [open]);

  return panelRef;
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** "modal" = centered card (Nova transação); "drawer" = right side panel (Nova categoria). */
  variant?: "modal" | "drawer";
  size?: "sm" | "md";
};

export function Dialog({ open, onClose, title, children, variant = "modal", size = "md" }: DialogProps) {
  const titleId = useId();
  const panelRef = useDialogBehavior(open, onClose);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#0c0b0a]/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          "bg-surface absolute overflow-y-auto shadow-[0_40px_80px_-20px_rgb(0_0_0/0.45)]",
          variant === "drawer"
            ? "inset-y-0 right-0 w-full max-w-[34rem] px-6 py-8 sm:px-9"
            : clsx(
                "inset-x-4 top-1/2 max-h-[92dvh] -translate-y-1/2 rounded-2xl px-6 py-8 sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2 sm:px-10",
                size === "sm" ? "sm:max-w-lg" : "sm:max-w-[52rem]",
              ),
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-ink text-[1.65rem] leading-tight font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-brand-50 hover:text-ink -mt-1 -mr-2 rounded-xl p-2"
            aria-label="Fechar"
          >
            <IconX size="1.5rem" />
          </button>
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  loading,
  error,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <div className="text-muted text-base leading-relaxed">{message}</div>
      {error && (
        <p role="alert" className="text-expense mt-4">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} loading={loading} className="bg-expense hover:bg-expense/90">
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

/** "⋮" / "⋯" button with a small action list. */
export function ActionMenu({
  label,
  items,
  horizontal,
}: {
  label: string;
  items: { label: string; onSelect: () => void; danger?: boolean }[];
  horizontal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === "Escape"
          : !rootRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="text-subtle hover:bg-brand-50 hover:text-ink rounded-xl p-2"
      >
        <IconDotsVertical size="1.4rem" className={horizontal ? "rotate-90" : undefined} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="border-line bg-surface absolute top-full right-0 z-20 mt-1 min-w-44 overflow-hidden rounded-xl border py-1.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={clsx(
                "hover:bg-brand-50 focus:bg-brand-50 block w-full px-4 py-2.5 text-left text-[0.95rem] outline-none",
                item.danger ? "text-expense" : "text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
