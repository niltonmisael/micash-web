import {
  IconArrowRight,
  IconArrowsLeftRight,
  IconBell,
  IconBrandAndroid,
  IconBrandApple,
  IconBriefcase,
  IconChartPie,
  IconCheck,
  IconDeviceMobile,
  IconHome,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconShoppingCart,
  IconSparkles,
  IconTargetArrow,
  type Icon,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "MiCash · Suas finanças, simples e no seu ritmo" },
  description:
    "Organize receitas, despesas e metas em um só lugar, no celular e no computador, com um assistente que entende o seu dinheiro.",
};

const FEATURES: { icon: Icon; title: string; text: string }[] = [
  {
    icon: IconArrowsLeftRight,
    title: "Receitas e despesas",
    text: "Registre em segundos, com categorias que fazem sentido para você.",
  },
  {
    icon: IconTargetArrow,
    title: "Metas e limites",
    text: "Guarde para seus objetivos e defina quanto gastar por categoria no mês.",
  },
  {
    icon: IconChartPie,
    title: "Relatórios claros",
    text: "Veja para onde o dinheiro vai com gráficos simples e comparativos.",
  },
  {
    icon: IconSparkles,
    title: "Mi Assistente",
    text: "Pergunte em linguagem natural e receba respostas sobre as suas finanças.",
  },
  {
    icon: IconBell,
    title: "Avisos e resumo do mês",
    text: "Saiba quando um limite estoura e receba o resumo do mês que terminou.",
  },
  {
    icon: IconDeviceMobile,
    title: "App + Web",
    text: "Comece no celular, continue no computador. Tudo sincronizado.",
  },
];

const STEPS = [
  { title: "Crie sua conta", text: "Cadastro rápido, com e-mail e senha." },
  { title: "Registre suas movimentações", text: "Receitas e despesas em poucos toques." },
  { title: "Entenda e evolua", text: "Relatórios, metas e o Mi te ajudam a decidir melhor." },
];

const FAQ = [
  {
    q: "O MiCash é gratuito?",
    a: "Sim. O plano Gratuito não tem prazo e inclui receitas e despesas ilimitadas, dashboard, relatórios e o Mi Assistente com algumas perguntas por mês. O Premium amplia as metas, o histórico e o assistente.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Seus dados ficam protegidos por login com senha e conexão criptografada, e são tratados conforme a LGPD. Você pode excluir sua conta quando quiser.",
  },
  {
    q: "O MiCash acessa minha conta bancária?",
    a: "Não. Você registra as suas receitas e despesas no app ou na web; o MiCash não se conecta ao seu banco nem pede senhas bancárias.",
  },
  {
    q: "Posso cancelar o Premium quando quiser?",
    a: "Sim, a qualquer momento, na tela de Assinatura. Não há novas cobranças, e você continua com o Premium até o fim do período já pago.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <span className="bg-brand-100 text-brand-700 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold">
              <IconSparkles size="1.1rem" aria-hidden /> Novo · Mi Assistente com IA
            </span>
            <h1 className="text-ink mt-6 text-[2.9rem] leading-[1.05] font-bold tracking-tight sm:text-[4.4rem]">
              Suas finanças, simples e <span className="text-brand-700">no seu ritmo.</span>
            </h1>
            <p className="text-muted mt-6 max-w-xl text-xl leading-relaxed">
              Organize receitas, despesas e metas em um só lugar. No celular e no computador, com um
              assistente que entende o seu dinheiro.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/cadastro" className="px-8">
                <IconArrowRight size="1.3rem" aria-hidden /> Criar conta grátis
              </ButtonLink>
              <ButtonLink href="/#recursos" variant="outline" className="px-8">
                <IconPlayerPlay size="1.2rem" aria-hidden /> Ver como funciona
              </ButtonLink>
            </div>
            <p className="text-muted mt-5">Sem cartão de crédito · Cancele quando quiser</p>
          </div>
          <HeroPreview />
        </section>

        {/* Recursos */}
        <section id="recursos" className="bg-surface scroll-mt-24 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <p className="text-brand-700 text-center font-semibold tracking-wide uppercase">Recursos</p>
            <h2 className="text-ink mt-3 text-center text-[2.2rem] font-bold tracking-tight sm:text-[2.8rem]">
              Tudo que você precisa, nada que atrapalha
            </h2>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
                <li key={title} className="border-line rounded-[1.5rem] border p-8">
                  <span className="bg-brand-100 text-brand-700 grid size-12 place-items-center rounded-xl">
                    <FeatureIcon size="1.4rem" aria-hidden />
                  </span>
                  <h3 className="text-ink mt-6 text-xl font-bold">{title}</h3>
                  <p className="text-muted mt-2 text-lg leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Mi Assistente */}
        <section id="mi-assistente" className="scroll-mt-24 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="text-brand-700 font-semibold tracking-wide uppercase">Mi Assistente</p>
              <h2 className="text-ink mt-3 text-[2.2rem] font-bold tracking-tight sm:text-[2.8rem]">
                Converse com suas finanças
              </h2>
              <p className="text-muted mt-4 max-w-xl text-xl leading-relaxed">
                Pergunte como se falasse com uma pessoa. O Mi analisa seus lançamentos e responde com clareza,
                sem jargão.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Resumo do mês em uma frase",
                  "Avisos quando uma categoria passa do limite",
                  "Sugestões para atingir suas metas",
                ].map((item) => (
                  <li key={item} className="text-ink flex items-center gap-3 text-lg">
                    <IconCheck size="1.3rem" className="text-income" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
              <p className="text-muted mt-6 text-sm">
                O Mi pode errar e não substitui um consultor financeiro.
              </p>
            </div>
            <ChatPreview />
          </div>
        </section>

        {/* Aplicativo */}
        <section id="aplicativo" className="bg-surface scroll-mt-24 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="text-brand-700 font-semibold tracking-wide uppercase">Aplicativo</p>
              <h2 className="text-ink mt-3 text-[2.2rem] font-bold tracking-tight sm:text-[2.8rem]">
                Leve o MiCash no bolso
              </h2>
              <p className="text-muted mt-4 max-w-xl text-xl leading-relaxed">
                Para Android e iOS, com o mesmo login da versão web. Suas finanças sempre à mão.
              </p>
              <ul className="mt-6 flex flex-col gap-5">
                {[
                  {
                    icon: IconRefresh,
                    title: "Sincronizado com a web",
                    text: "Registre no celular e veja no computador.",
                  },
                  {
                    icon: IconPlus,
                    title: "Lançamento em segundos",
                    text: "Um toque para registrar receita ou despesa.",
                  },
                  {
                    icon: IconBell,
                    title: "Avisos no celular",
                    text: "Limite estourado e resumo do mês por notificação.",
                  },
                ].map(({ icon: ItemIcon, title, text }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="bg-brand-100 text-brand-700 grid size-11 shrink-0 place-items-center rounded-xl">
                      <ItemIcon size="1.3rem" aria-hidden />
                    </span>
                    <span>
                      <span className="text-ink block text-lg font-semibold">{title}</span>
                      <span className="text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {/* Not on the stores yet: badges are informative, not links. */}
              <div className="mt-8 flex flex-wrap gap-3">
                <StoreBadge icon={IconBrandApple} store="App Store" />
                <StoreBadge icon={IconBrandAndroid} store="Google Play" />
              </div>
            </div>
            <PhonePreview />
          </div>
        </section>

        {/* Passos */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <h2 className="text-ink text-center text-[2.2rem] font-bold tracking-tight sm:text-[2.8rem]">
              Comece em três passos
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex flex-col items-center text-center">
                  <span className="bg-brand-600 grid size-12 place-items-center rounded-full text-xl font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-ink mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted mt-1 text-lg">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Perguntas */}
        <section id="perguntas" className="bg-surface scroll-mt-24 py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="text-brand-700 font-semibold tracking-wide uppercase">Perguntas frequentes</p>
              <h2 className="text-ink mt-3 text-[2.2rem] font-bold tracking-tight">
                Ficou com alguma dúvida?
              </h2>
              <p className="text-muted mt-3 text-lg">
                Fale com a gente em{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-700 font-semibold hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
            <div>
              {FAQ.map((item) => (
                <details key={item.q} className="border-line group border-b py-5">
                  <summary className="text-ink flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold">
                    {item.q}
                    <IconPlus
                      size="1.3rem"
                      className="text-brand-700 shrink-0 transition-transform group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <p className="text-muted mt-3 text-lg leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-[#b8560f] to-[#9a470c] px-8 py-12 text-white sm:px-14 md:flex-row md:items-center">
            <div>
              <h2 className="text-[2rem] font-bold tracking-tight sm:text-[2.4rem]">
                Pronto para organizar seu dinheiro?
              </h2>
              <p className="mt-2 text-lg">Crie sua conta grátis em menos de um minuto.</p>
            </div>
            <Link
              href="/cadastro"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#9a470c] hover:bg-white/90"
            >
              Começar grátis
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* Illustrative previews (sample values, not real data): hidden from screen readers. */

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden>
      <div className="bg-surface border-line shadow-float rounded-[1.75rem] border p-8">
        <p className="text-muted">Saldo do mês</p>
        <p className="text-ink text-4xl font-bold">R$ 4.280,50</p>
        <p className="text-income mt-1 text-sm font-semibold">▲ 12% vs. mês anterior</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-income-soft rounded-xl p-3">
            <p className="text-income text-sm">Receitas</p>
            <p className="text-ink font-bold">R$ 6.500</p>
          </div>
          <div className="bg-expense-soft rounded-xl p-3">
            <p className="text-expense text-sm">Despesas</p>
            <p className="text-ink font-bold">R$ 2.219</p>
          </div>
        </div>
        <div className="mt-6 flex h-24 items-end gap-3">
          {[45, 70, 55, 85, 60, 95].map((h, i) => (
            <span key={i} className="bg-brand-200 flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="bg-surface border-line shadow-float absolute -right-2 -bottom-10 w-72 rounded-2xl border p-5 sm:-right-8">
        <p className="text-ink flex items-center gap-2 font-semibold">
          <span className="bg-brand-500 grid size-8 place-items-center rounded-lg text-white">
            <IconSparkles size="1rem" />
          </span>
          Mi Assistente
        </p>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          Você gastou <strong className="text-ink">18% menos</strong> em Alimentação este mês. Quer direcionar
          a sobra para a meta Viagem?
        </p>
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div
      className="bg-surface border-line shadow-float mx-auto w-full max-w-lg rounded-[1.75rem] border p-7"
      aria-hidden
    >
      <p className="bg-brand-600 ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-white">
        Quanto gastei com mercado em outubro?
      </p>
      <div className="mt-4 flex items-start gap-3">
        <span className="bg-brand-100 text-brand-700 grid size-9 shrink-0 place-items-center rounded-lg">
          <IconSparkles size="1.1rem" />
        </span>
        <p className="bg-brand-50 text-ink rounded-2xl rounded-tl-md px-4 py-3">
          Em outubro você gastou <strong>R$ 842,30</strong> com Mercado, 6% a menos que em setembro.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Onde posso economizar?", "Resumo do mês"].map((chip) => (
          <span
            key={chip}
            className="bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-semibold"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Phone shell: tall frame with a notch. The frame keeps a light ring so it reads on dark backgrounds too. */
function PhoneFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`shadow-float w-56 rounded-[2.6rem] bg-[#2d2a26] p-2 ring-1 ring-white/10 sm:w-60 ${className ?? ""}`}
    >
      <div className="bg-cream relative flex aspect-[9/18.5] flex-col overflow-hidden rounded-[2.1rem] px-4 pt-10 pb-5">
        <span className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#2d2a26]" />
        {children}
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative mx-auto flex h-[33rem] w-full max-w-md items-center justify-center sm:h-[36rem]" aria-hidden>
      {/* Dashboard */}
      <PhoneFrame className="absolute top-0 left-0 -rotate-6 sm:left-2">
        <p className="text-muted text-xs">Olá, Nilton</p>
        <p className="text-muted mt-3 text-[0.7rem]">Saldo do mês</p>
        <p className="text-ink text-2xl font-bold tracking-tight">R$ 4.280,50</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-income-soft rounded-xl p-2 text-[0.7rem]">
            <p className="text-income">Receitas</p>
            <p className="text-ink text-xs font-bold">R$ 6.500</p>
          </div>
          <div className="bg-expense-soft rounded-xl p-2 text-[0.7rem]">
            <p className="text-expense">Despesas</p>
            <p className="text-ink text-xs font-bold">R$ 2.219</p>
          </div>
        </div>
        <div className="bg-brand-100 mt-3 rounded-xl p-3 text-xs">
          <p className="text-ink font-semibold">Meta · Viagem</p>
          <div className="bg-surface mt-2 h-1.5 rounded-full">
            <div className="bg-brand-500 h-full w-[68%] rounded-full" />
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-2.5 text-xs">
          {(
            [
              [IconBriefcase, "Salário", "+6.500", "text-income", "bg-income-soft text-income"],
              [IconShoppingCart, "Mercado", "−284,90", "text-expense", "bg-expense-soft text-expense"],
              [IconHome, "Aluguel", "−1.200", "text-expense", "bg-expense-soft text-expense"],
            ] as const
          ).map(([RowIcon, name, value, color, chip]) => (
            <li key={name} className="flex items-center gap-2">
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${chip}`}>
                <RowIcon size="0.9rem" />
              </span>
              <span className="text-ink flex-1 font-medium">{name}</span>
              <span className={`font-semibold ${color}`}>{value}</span>
            </li>
          ))}
        </ul>
      </PhoneFrame>

      {/* Mi Assistente */}
      <PhoneFrame className="absolute right-0 bottom-0 rotate-6 sm:right-2">
        <p className="text-ink flex items-center gap-2 text-sm font-semibold">
          <span className="bg-brand-100 text-brand-700 grid size-7 place-items-center rounded-lg">
            <IconSparkles size="0.95rem" />
          </span>
          Mi Assistente
        </p>
        <p className="bg-brand-600 mt-5 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-xs text-white">
          Quanto gastei com mercado?
        </p>
        <p className="bg-surface text-ink mt-3 max-w-[90%] rounded-2xl rounded-tl-md px-3 py-2 text-xs leading-relaxed">
          Em outubro: <strong>R$ 842,30</strong>, 6% a menos que em setembro.
        </p>
        <span className="bg-brand-100 text-brand-700 mt-3 w-fit rounded-full px-3 py-1.5 text-xs font-semibold">
          Resumo do mês
        </span>
      </PhoneFrame>
    </div>
  );
}

function StoreBadge({ icon: StoreIcon, store }: { icon: Icon; store: string }) {
  return (
    <span className="flex items-center gap-3 rounded-xl bg-[#2d2a26] px-5 py-3 text-white">
      <StoreIcon size="1.6rem" aria-hidden />
      <span className="leading-tight">
        <span className="block text-xs text-[#bdb3aa]">Em breve na</span>
        <span className="font-semibold">{store}</span>
      </span>
    </span>
  );
}
