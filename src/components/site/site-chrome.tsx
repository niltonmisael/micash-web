import { IconChartBar } from "@tabler/icons-react";
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

/** Public site header. Signed-in visitors (session cookie) get "Ir para o painel" instead of the sign-up CTA. */
export async function SiteHeader({ active }: { active?: "planos" }) {
  const signedIn = Boolean((await cookies()).get("micash_rt")?.value);

  return (
    <header className="bg-cream/90 border-line sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="MiCash, página inicial">
          <Logo />
        </Link>
        <nav aria-label="Site" className="hidden items-center gap-10 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === "planos" && item.href === "/planos" ? "page" : undefined}
              className={
                active === "planos" && item.href === "/planos"
                  ? "text-brand-700 text-lg font-semibold"
                  : "text-muted hover:text-ink text-lg"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {signedIn ? (
            <ButtonLink href="/dashboard" className="h-12 px-5 text-base">
              Ir para o painel
            </ButtonLink>
          ) : (
            <>
              <Link href="/entrar" className="text-ink hover:text-brand-700 text-lg font-semibold">
                Entrar
              </Link>
              <ButtonLink href="/cadastro" className="h-12 px-5 text-base">
                Começar grátis
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
    // Always dark, like the prototype, in both themes.
    <footer className="bg-[#2d2a26] text-[#e9e2db]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-3">
              <span
                className="bg-brand-500 grid size-10 place-items-center rounded-xl text-white"
                aria-hidden
              >
                <IconChartBar size="1.4rem" />
              </span>
              <span className="text-2xl font-bold text-white">MiCash</span>
            </span>
            <p className="mt-4 text-[#bdb3aa]">Organização financeira pessoal, simples e no seu ritmo.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="font-semibold text-white">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[#bdb3aa] hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-[#a59c94]">
          © {new Date().getFullYear()} NILTON MISAEL DA COSTA – TECNOLOGIAS · CNPJ 63.742.180/0001-05 ·
          www.micash.com.br
        </p>
      </div>
    </footer>
  );
}
