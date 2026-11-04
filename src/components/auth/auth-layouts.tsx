import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/misc";
import { SUPPORT_EMAIL } from "@/lib/site";

function LegalLinks({ withHelp }: { withHelp?: boolean }) {
  return (
    <nav className="text-muted flex flex-wrap justify-center gap-x-2 text-base">
      <Link href="/termos" className="hover:text-ink">
        Termos de Uso
      </Link>
      <span aria-hidden>·</span>
      <Link href="/privacidade" className="hover:text-ink">
        Política de Privacidade
      </Link>
      {withHelp && (
        <>
          <span aria-hidden>·</span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
            Ajuda
          </a>
        </>
      )}
    </nav>
  );
}

/** Illustrative card from the prototypes (sample values, not the user's data). */
function PreviewCard() {
  return (
    <div
      className="border-line shadow-float w-full max-w-md rounded-[1.5rem] border bg-white p-8 text-left"
      aria-hidden
    >
      <p className="text-muted">Saldo do mês</p>
      <p className="text-ink mt-1 text-4xl font-bold">R$ 4.280,50</p>
      <div className="bg-brand-100 mt-6 h-2.5 rounded-full">
        <div className="bg-brand-500 h-full w-[68%] rounded-full" />
      </div>
      <p className="text-muted mt-4">Meta Viagem · 68%</p>
    </div>
  );
}

/** Login and sign-up: form on the left, peach panel on the right (hidden on small screens). */
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
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.27fr_1fr]">
      <div className="flex min-w-0 flex-col px-6 py-10 sm:px-12 lg:px-[8.5rem] lg:py-16">
        <Link href="/" aria-label="MiCash, página inicial" className="self-start">
          <Logo />
        </Link>
        <main className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col justify-center py-12 lg:px-[5.5rem]">
          {children}
        </main>
        <LegalLinks />
      </div>

      <aside className="relative hidden overflow-hidden bg-[#fbe9da] lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-16">
        <div className="bg-brand-200/70 absolute -top-24 -right-20 size-[24rem] rounded-full" aria-hidden />
        <div className="bg-brand-200/60 absolute -bottom-24 -left-24 size-[21rem] rounded-full" aria-hidden />
        <div className="relative flex flex-col items-center text-center">
          <PreviewCard />
          <h2 className="text-ink mt-12 text-4xl font-bold tracking-tight">{asideTitle}</h2>
          <p className="text-muted mt-4 max-w-xl text-xl leading-relaxed">{asideText}</p>
        </div>
      </aside>
    </div>
  );
}

/** Password reset and e-mail verification: centered card on the cream background. */
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
    <div className="bg-cream flex min-h-dvh flex-col items-center px-4 py-12 sm:py-20">
      <Link href="/" aria-label="MiCash, página inicial">
        <Logo size="lg" />
      </Link>
      <main className="mt-14 w-full max-w-[45rem]">
        <Card className="shadow-float rounded-[1.75rem] px-6 py-12 sm:px-16">
          <div className="bg-brand-100 text-brand-700 mx-auto grid size-24 place-items-center rounded-3xl">
            <HeaderIcon size="2.5rem" aria-hidden />
          </div>
          <h1 className="text-ink mt-8 text-center text-[2.6rem] leading-tight font-bold tracking-tight">
            {title}
          </h1>
          <div className="text-muted mt-4 text-center text-xl leading-relaxed">{description}</div>
          <div className="mt-10">{children}</div>
        </Card>
      </main>
      <div className="mt-12">
        <LegalLinks withHelp />
      </div>
    </div>
  );
}
