"use client";

import {
  IconArrowsLeftRight,
  IconChartPie,
  IconCrown,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconSettings,
  IconSparkles,
  IconTargetArrow,
  type Icon,
} from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { Logo } from "@/components/ui/logo";
import { authApi } from "@/lib/api";
import { useProfile, useSubscription } from "@/lib/queries";

type NavItem = { href: string; label: string; icon: Icon };

/** Money in daily use first; the account pages (plan, settings) apart, below. */
const MONEY_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: IconArrowsLeftRight },
  { href: "/categorias", label: "Categorias", icon: IconLayoutGrid },
  { href: "/metas", label: "Metas", icon: IconTargetArrow },
  { href: "/relatorios", label: "Relatórios", icon: IconChartPie },
  { href: "/assistente", label: "Mi Assistente", icon: IconSparkles },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { href: "/assinatura", label: "Assinatura", icon: IconCrown },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

export const NAV_ITEMS: NavItem[] = [...MONEY_ITEMS, ...ACCOUNT_ITEMS];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const subscription = useSubscription();
  const isPremium = subscription.data?.isPremium;

  const renderItems = (items: NavItem[]) =>
    items.map(({ href, label, icon: ItemIcon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={clsx(
            "relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[0.95rem] transition-colors",
            active
              ? "bg-rail-raised text-rail-ink font-semibold"
              : "text-rail-muted hover:bg-rail-raised/60 hover:text-rail-ink",
          )}
        >
          {active && (
            <span
              className="bg-brand-500 absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r-full"
              aria-hidden
            />
          )}
          <ItemIcon
            size="1.25rem"
            stroke={1.7}
            className={active ? "text-brand-500" : undefined}
            aria-hidden
          />
          {label}
        </Link>
      );
    });

  return (
    <div className="flex h-full min-h-dvh flex-col px-4 py-7">
      <Link href="/dashboard" onClick={onNavigate} className="self-start px-2" aria-label="MiCash, dashboard">
        <Logo tone="light" />
      </Link>

      <nav className="mt-9 flex flex-col gap-0.5" aria-label="Menu principal">
        {renderItems(MONEY_ITEMS)}
        <div className="border-rail-line mx-3.5 my-4 border-t" aria-hidden />
        {renderItems(ACCOUNT_ITEMS)}
      </nav>

      <div className="mt-auto flex flex-col gap-5 pt-8">
        {isPremium === false && (
          <Link
            href="/assinatura"
            onClick={onNavigate}
            className="group bg-rail-raised hover:bg-rail-line block rounded-xl p-4 transition-colors"
          >
            <span className="text-rail-ink flex items-center gap-2 font-semibold">
              <IconCrown size="1.1rem" className="text-brand-500" aria-hidden /> Conhecer o Premium
            </span>
            {/* Real Premium benefits (PlanLimits.Premium), not the prototype's "relatórios em PDF". */}
            <span className="text-rail-muted mt-1.5 block text-sm leading-relaxed">
              Mais perguntas ao Mi, metas ilimitadas e histórico completo.
            </span>
          </Link>
        )}
        <ThemeSwitcher compact onRail />
        <UserCard planLabel={isPremium ? "Premium" : isPremium === false ? "Plano Gratuito" : ""} />
      </div>
    </div>
  );
}

function UserCard({ planLabel }: { planLabel: string }) {
  const router = useRouter();
  const profile = useProfile();
  const [leaving, setLeaving] = useState(false);
  const name = profile.data?.name ?? "";
  const shortName = name.split(/\s+/).slice(0, 2).join(" ");

  const logout = async () => {
    setLeaving(true);
    await authApi("logout").catch(() => undefined);
    router.replace("/entrar");
    router.refresh();
  };

  return (
    <div className="border-rail-line flex items-center gap-3 border-t px-1 pt-5">
      <span className="bg-brand-500 grid size-10 shrink-0 place-items-center rounded-full text-base font-bold text-white">
        {name.charAt(0).toUpperCase() || "·"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-rail-ink truncate text-[0.95rem] font-semibold">{shortName}</p>
        <p className="text-rail-muted truncate text-sm">{planLabel}</p>
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={leaving}
        className="text-rail-muted hover:bg-rail-raised hover:text-rail-ink grid size-10 place-items-center rounded-lg"
        aria-label="Sair"
        title="Sair"
      >
        <IconLogout size="1.25rem" aria-hidden />
      </button>
    </div>
  );
}
