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
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { authApi } from "@/lib/api";
import { useProfile, useSubscription } from "@/lib/queries";

export const NAV_ITEMS: { href: string; label: string; icon: Icon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: IconArrowsLeftRight },
  { href: "/categorias", label: "Categorias", icon: IconLayoutGrid },
  { href: "/metas", label: "Metas", icon: IconTargetArrow },
  { href: "/relatorios", label: "Relatórios", icon: IconChartPie },
  { href: "/assistente", label: "Mi Assistente", icon: IconSparkles },
  { href: "/assinatura", label: "Assinatura", icon: IconCrown },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const subscription = useSubscription();
  const isPremium = subscription.data?.isPremium;

  return (
    <div className="flex h-full flex-col px-6 py-9">
      <Link href="/dashboard" onClick={onNavigate} className="px-2" aria-label="MiCash, dashboard">
        <Logo />
      </Link>

      <nav className="mt-10 flex flex-col gap-2" aria-label="Menu principal">
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex h-16 items-center gap-4 rounded-2xl px-6 text-xl transition-colors",
                active
                  ? "bg-brand-100 text-brand-700 font-semibold"
                  : "text-muted hover:bg-brand-50 hover:text-ink",
              )}
            >
              <ItemIcon size="1.625rem" stroke={1.6} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-6 pt-8">
        {isPremium === false && (
          <div className="bg-brand-100 rounded-3xl p-6">
            <p className="text-ink flex items-center gap-2 text-xl font-bold">
              <IconCrown size="1.375rem" className="text-brand-700" aria-hidden /> Premium
            </p>
            {/* Real Premium benefits (PlanLimits.Premium), not the prototype's "relatórios em PDF". */}
            <p className="text-muted mt-2 leading-relaxed">
              Mais perguntas ao Mi, metas ilimitadas e histórico completo.
            </p>
            <ButtonLink href="/assinatura" block onClick={onNavigate} className="mt-5 h-12 text-lg">
              Conhecer
            </ButtonLink>
          </div>
        )}
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
    <div className="flex items-center gap-4 px-1">
      <span className="bg-brand-200 text-brand-700 grid size-14 shrink-0 place-items-center rounded-full text-2xl font-bold">
        {name.charAt(0).toUpperCase() || "·"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-lg font-semibold">{shortName}</p>
        <p className="text-muted truncate">{planLabel}</p>
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={leaving}
        className="text-subtle hover:bg-brand-50 hover:text-ink rounded-xl p-2"
        aria-label="Sair"
        title="Sair"
      >
        <IconLogout size="1.5rem" aria-hidden />
      </button>
    </div>
  );
}
