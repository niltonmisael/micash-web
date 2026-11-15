import Link from "next/link";
import { cookies } from "next/headers";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SUPPORT_EMAIL } from "@/lib/site";

const NAV = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#mi-assistente", label: "Mi Assistente" },
  { href: "/#aplicativo", label: "Aplicativo" },
  { href: "/planos", label: "Planos" },
  { href: "/#perguntas", label: "Perguntas" },
];

/** Shared width of the public pages: header, sections and footer start and end on the same lines. */
export const SITE_WRAP = "mx-auto w-full max-w-[84rem] px-4 sm:px-8 lg:px-10";

/**
 * Public site header, graphite like the hero and the footer. Signed-in visitors (session cookie) get
 * "Ir para o painel" instead of the sign-up CTA.
 */
export async function SiteHeader({ active }: { active?: "planos" }) {
  const signedIn = Boolean((await cookies()).get("micash_rt")?.value);

  return (
    <header className="bg-rail/95 border-rail-line sticky top-0 z-30 border-b backdrop-blur">
      <div className={`${SITE_WRAP} flex h-[4.25rem] items-center justify-between gap-3 sm:gap-6`}>
        <Link href="/" aria-label="MiCash, página inicial" className="shrink-0">
          <span className="sm:hidden">
            <Logo tone="light" size="sm" />
          </span>
          <span className="hidden sm:block">
            <Logo tone="light" />
          </span>
        </Link>
        <nav aria-label="Site" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const current = active === "planos" && item.href === "/planos";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={
                  current
                    ? "text-rail-ink decoration-brand-500 text-[0.95rem] font-semibold underline decoration-2 underline-offset-[0.6rem]"
                    : "text-rail-muted hover:text-rail-ink text-[0.95rem] transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 sm:gap-5">
          {signedIn ? (
            <ButtonLink href="/dashboard" className="h-10 px-4 text-[0.95rem]">
              Ir para o painel
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/entrar"
                className="text-rail-ink hover:text-brand-500 px-2.5 py-2.5 text-sm font-semibold transition-colors sm:text-[0.95rem]"
              >
                Entrar
              </Link>
              <ButtonLink
                href="/cadastro"
                className="h-10 px-3.5 text-sm whitespace-nowrap max-[379px]:hidden sm:px-4 sm:text-[0.95rem]"
              >
                Criar conta<span className="hidden sm:inline">&nbsp;grátis</span>
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const columns = [
    {
      title: "Produto",
      links: [
        { href: "/#recursos", label: "Recursos" },
        { href: "/#mi-assistente", label: "Mi Assistente" },
        { href: "/planos", label: "Planos" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { href: `mailto:${SUPPORT_EMAIL}`, label: "Contato" },
        { href: "/#perguntas", label: "Perguntas" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/termos", label: "Termos de Uso" },
        { href: "/privacidade", label: "Política de Privacidade" },
      ],
    },
  ];

  return (
    // Always graphite, in both themes.
    <footer className="bg-rail text-rail-muted">
      <div className={`${SITE_WRAP} pt-16 pb-10`}>
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-4 leading-relaxed">Organização financeira pessoal, simples e no seu ritmo.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-rail-ink text-sm font-semibold">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="hover:text-rail-ink inline-block py-1.5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="border-rail-line mt-14 border-t pt-6 text-sm">
          © {new Date().getFullYear()} NILTON MISAEL DA COSTA – TECNOLOGIAS · CNPJ 63.742.180/0001-05 ·
          www.micash.com.br
        </p>
      </div>
    </footer>
  );
}
