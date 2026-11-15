import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/misc";
import { SUPPORT_EMAIL } from "@/lib/site";

function LegalLinks({ withHelp }: { withHelp?: boolean }) {
  return (
    <nav className="text-muted flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
      <Link href="/termos" className="hover:text-ink py-1">
        Termos de Uso
      </Link>
      <Link href="/privacidade" className="hover:text-ink py-1">
        Política de Privacidade
      </Link>
      {withHelp && (
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink py-1">
          Ajuda
        </a>
      )}
    </nav>
  );
}

/** Illustrative panel from the app's dashboard (sample values, not the user's data). */
function PreviewPanel() {
  return (
    <div className="w-full max-w-md" aria-hidden>
      <div className="bg-rail-raised border-rail-line rounded-2xl border p-7">
        <p className="text-rail-muted text-sm">Saldo de novembro</p>
        <p className="figure text-rail-ink mt-1 text-[2.9rem] leading-none font-bold">R$ 4.280,50</p>
        <p className="mt-2 text-sm font-medium text-[#7fd3a1]">▲ 12% vs. mês anterior</p>
        <div className="border-rail-line mt-6 grid grid-cols-2 border-t pt-5">
          <div>
            <p className="text-rail-muted text-xs">Receitas</p>
            <p className="figure text-rail-ink text-lg font-bold">R$ 6.500,00</p>
          </div>
          <div className="border-rail-line border-l pl-5">
            <p className="text-rail-muted text-xs">Despesas</p>
            <p className="figure text-rail-ink text-lg font-bold">R$ 2.219,50</p>
          </div>
        </div>
      </div>
      <div className="bg-surface text-ink mt-3 ml-10 rounded-2xl p-5 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.6)]">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">Meta Viagem</span>
          <span className="figure text-brand-700 text-lg font-bold">68%</span>
        </div>
        <div className="bg-brand-50 mt-2.5 h-2 rounded-full">
          <div className="bg-brand-500 h-full w-[68%] rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Login and sign-up: form on the left, graphite panel with the product on the right (large screens). */
export function SplitAuthLayout({
  children,
  asideTitle,
  asideText,
}: {
  children: React.ReactNode;
  asideTitle: string;
  asideText: string;
}) {
  return (
    <div className="bg-surface grid min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <Link href="/" aria-label="MiCash, página inicial" className="self-start">
          <Logo />
        </Link>
        <main className="mx-auto flex w-full max-w-[27rem] flex-1 flex-col justify-center py-12">
          {children}
        </main>
        <LegalLinks />
      </div>

      <aside className="bg-rail text-rail-ink hidden flex-col justify-between gap-12 px-14 py-16 lg:flex xl:px-20">
        <div>
          <h2 className="max-w-md text-[2.5rem] leading-[1.05] font-bold">{asideTitle}</h2>
          <p className="text-rail-muted mt-4 max-w-md text-lg leading-relaxed">{asideText}</p>
        </div>
        <PreviewPanel />
      </aside>
    </div>
  );
}

/** Password reset and e-mail verification: a centered panel on the paper background. */
export function CenteredAuthLayout({
  icon: HeaderIcon,
  title,
  description,
  children,
}: {
  icon: Icon;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
      <Link href="/" aria-label="MiCash, página inicial">
        <Logo />
      </Link>
      <main className="mt-10 w-full max-w-[34rem]">
        <Card className="px-6 py-10 sm:px-12">
          <div className="bg-brand-100 text-brand-700 grid size-14 place-items-center rounded-xl">
            <HeaderIcon size="1.75rem" aria-hidden />
          </div>
          <h1 className="text-ink mt-6 text-[2rem] leading-tight font-bold">{title}</h1>
          <div className="text-muted mt-3 text-base leading-relaxed">{description}</div>
          <div className="mt-8">{children}</div>
        </Card>
      </main>
      <div className="mt-10">
        <LegalLinks withHelp />
      </div>
    </div>
  );
}
