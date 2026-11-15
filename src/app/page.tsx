import {
  IconArrowsLeftRight,
  IconBrandAndroid,
  IconBrandApple,
  IconChartBar,
  IconChartPie,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconPlus,
  IconSend2,
  IconSparkles,
  IconTargetArrow,
  type Icon,
} from "@tabler/icons-react";
import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { Pricing } from "@/components/site/pricing";
import { SITE_WRAP, SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { fetchPlans } from "@/lib/server/plans";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "MiCash · Suas finanças, simples e no seu ritmo" },
  description:
    "Organize receitas, despesas e metas em um só lugar, no celular e no computador, com um assistente que entende o seu dinheiro.",
};

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

const H2 = "text-ink text-[2.1rem] leading-[1.08] font-bold sm:text-[2.9rem]";

export default async function HomePage() {
  const plans = await fetchPlans();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero: the promise on the left, how to start on the right, the product itself underneath. */}
        <section className="bg-rail text-rail-ink overflow-hidden">
          <div className={`${SITE_WRAP} pt-14 sm:pt-20 lg:pt-24`}>
            <div
              className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16"
              data-enter
            >
              <h1 className="text-[2.9rem] leading-[0.98] font-bold tracking-[-0.035em] sm:text-[4.4rem] xl:text-[5.4rem]">
                Suas finanças, simples e no seu ritmo.
              </h1>
              <div className="lg:pb-3">
                <p className="text-rail-muted max-w-md text-lg leading-relaxed">
                  Organize receitas, despesas e metas em um só lugar. No celular e no computador, com um
                  assistente que entende o seu dinheiro.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonLink href="/cadastro" className="h-13 px-6">
                    Criar conta grátis
                  </ButtonLink>
                  <ButtonLink
                    href="/#recursos"
                    variant="ghost"
                    className="text-rail-ink hover:bg-rail-raised hover:text-rail-ink h-13 border border-[#45403a] px-6"
                  >
                    Ver como funciona
                  </ButtonLink>
                </div>
                <p className="text-rail-muted mt-4 text-sm">
                  Plano Gratuito sem prazo e sem cartão de crédito.
                </p>
              </div>
            </div>
            <div className="mt-14 sm:mt-16" data-enter-late>
              <AppPreview />
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="scroll-mt-20 py-20 sm:py-28">
          <div className={SITE_WRAP}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
              <h2 className={H2}>O seu mês inteiro, organizado numa tela</h2>
              <p className="text-muted max-w-md text-lg leading-relaxed">
                Registre o que entra e o que sai, defina até onde gastar e acompanhe o que está guardando. O
                MiCash soma, compara e avisa.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-5">
              <FeatureTile
                className="lg:col-span-7"
                title="Receitas e despesas em segundos"
                text="Com categorias que fazem sentido para você e a forma de pagamento de cada uma."
              >
                <TransactionsFragment />
              </FeatureTile>
              <FeatureTile
                className="lg:col-span-5"
                title="Limites por categoria"
                text="Defina quanto gastar no mês e veja quanto ainda cabe em cada categoria."
              >
                <LimitsFragment />
              </FeatureTile>
              <FeatureTile
                className="lg:col-span-5"
                title="Metas com prazo"
                text="Guarde para seus objetivos e saiba quanto separar por mês para chegar lá."
              >
                <GoalFragment />
              </FeatureTile>
              <FeatureTile
                className="lg:col-span-7"
                title="Relatórios que comparam"
                text="Veja para onde o dinheiro vai, mês a mês, e receba o resumo do mês que terminou."
              >
                <ReportFragment />
              </FeatureTile>
            </div>
          </div>
        </section>

        {/* Mi Assistente */}
        <section id="mi-assistente" className="bg-rail text-rail-ink scroll-mt-16 py-20 sm:py-28">
          <div
            className={`${SITE_WRAP} grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20`}
          >
            <div>
              <p className="text-brand-500 flex items-center gap-2 font-semibold">
                <IconSparkles size="1.2rem" aria-hidden /> Mi Assistente
              </p>
              <h2 className="mt-4 text-[2.1rem] leading-[1.08] font-bold sm:text-[2.9rem]">
                Pergunte como falaria com uma pessoa
              </h2>
              <p className="text-rail-muted mt-5 max-w-lg text-lg leading-relaxed">
                O Mi lê os seus lançamentos e responde com os seus números, sem jargão. Use para fechar o mês,
                achar onde economizar ou ver quanto falta para uma meta.
              </p>
              <ul className="border-rail-line mt-8 max-w-lg border-t">
                {[
                  "Resumo do mês em uma frase",
                  "Avisos quando uma categoria passa do limite",
                  "Sugestões para atingir suas metas",
                ].map((item) => (
                  <li key={item} className="border-rail-line flex items-center gap-3 border-b py-3.5">
                    <span className="bg-brand-500 size-1.5 shrink-0 rounded-full" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-rail-muted mt-6 text-sm">
                O Mi pode errar e não substitui um consultor financeiro.
              </p>
            </div>
            <ChatPreview />
          </div>
        </section>

        {/* Aplicativo */}
        <section id="aplicativo" className="scroll-mt-16 overflow-hidden py-20 sm:py-28">
          <div className={`${SITE_WRAP} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
            <div className="lg:order-2">
              <h2 className={H2}>Comece no celular, continue no computador</h2>
              <p className="text-muted mt-5 max-w-lg text-lg leading-relaxed">
                Para Android e iOS, com o mesmo login da versão web. Registre a despesa na hora e veja o mês
                completo quando sentar no computador.
              </p>
              <dl className="mt-8 grid max-w-lg gap-x-8 gap-y-6 sm:grid-cols-2">
                {[
                  ["Sincronizado com a web", "Registre no celular e veja no computador."],
                  ["Lançamento em segundos", "Um toque para registrar receita ou despesa."],
                  ["Avisos no celular", "Limite estourado e resumo do mês por notificação."],
                  ["Mesmo plano nos dois", "Sua assinatura vale no app e na web."],
                ].map(([title, text]) => (
                  <div key={title} className="border-brand-500 border-l-2 pl-4">
                    <dt className="text-ink font-semibold">{title}</dt>
                    <dd className="text-muted mt-1 text-[0.95rem]">{text}</dd>
                  </div>
                ))}
              </dl>
              {/* Not on the stores yet: badges are informative, not links. */}
              <div className="mt-9 flex flex-wrap gap-3">
                <StoreBadge icon={IconBrandApple} store="App Store" />
                <StoreBadge icon={IconBrandAndroid} store="Google Play" />
              </div>
            </div>
            <PhonePreview />
          </div>
        </section>

        {/* Passos: a real sequence, so the numbers carry meaning. */}
        <section className="bg-surface py-20 sm:py-24">
          <div className={SITE_WRAP}>
            <h2 className={H2}>Comece em três passos</h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-ink border-t-2 pt-6">
                  <span className="figure text-brand-700 text-[2.6rem] leading-none font-bold">{i + 1}</span>
                  <h3 className="text-ink mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted mt-2">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="scroll-mt-16 py-20 sm:py-28">
          <div className={SITE_WRAP}>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <h2 className={`${H2} max-w-2xl`}>Comece grátis e assine quando fizer sentido</h2>
              <Link
                href="/planos"
                className="text-ink decoration-brand-500 hover:text-brand-700 font-semibold underline decoration-2 underline-offset-4"
              >
                Comparar os planos
              </Link>
            </div>
            <Pricing plans={plans} />
          </div>
        </section>

        {/* Perguntas */}
        <section id="perguntas" className="bg-surface scroll-mt-16 py-20 sm:py-28">
          <div className={`${SITE_WRAP} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16`}>
            <div>
              <h2 className={H2}>Perguntas frequentes</h2>
              <p className="text-muted mt-5 text-lg">
                Não achou a resposta? Escreva para{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-brand-700 font-semibold [overflow-wrap:anywhere] underline-offset-4 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
            <div className="border-line border-t">
              {FAQ.map((item) => (
                <details key={item.q} className="border-line group border-b">
                  <summary className="text-ink hover:text-brand-700 flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold transition-colors sm:text-xl">
                    {item.q}
                    <IconPlus
                      size="1.3rem"
                      className="text-brand-700 shrink-0 transition-transform group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <p className="text-muted -mt-2 max-w-2xl pb-6 text-lg leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA: flat ember band, graphite text (AA on #f58a3c). */}
        <section className="bg-brand-500 text-[#1b1916]">
          <div
            className={`${SITE_WRAP} flex flex-col items-start justify-between gap-8 py-16 sm:py-20 lg:flex-row lg:items-end`}
          >
            <h2 className="max-w-3xl text-[2.3rem] leading-[1.02] font-bold sm:text-[3.6rem]">
              Pronto para organizar seu dinheiro?
            </h2>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/cadastro"
                className="inline-flex h-13 items-center rounded-xl bg-[#1b1916] px-7 font-semibold text-white transition-[background-color,transform] hover:bg-[#2e2a25] active:translate-y-px"
              >
                Criar conta grátis
              </Link>
              <p className="text-[0.95rem] font-medium">Leva menos de um minuto.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* ---------------------------------------------------------------------------------------------------------
 * Product previews: the real MiCash screens rebuilt in HTML with sample values (not real data), hidden from
 * screen readers. They follow the app's own components, so the site shows what the user will get.
 * ------------------------------------------------------------------------------------------------------- */

function FeatureTile({
  title,
  text,
  className,
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={clsx(
        "bg-surface shadow-card flex min-w-0 flex-col rounded-[var(--radius-card)] p-5 sm:p-8",
        className,
      )}
    >
      <h3 className="text-ink text-[1.4rem] font-bold">{title}</h3>
      <p className="text-muted mt-2 max-w-md">{text}</p>
      <div className="bg-cream mt-7 flex-1 rounded-xl p-4 sm:p-5" aria-hidden>
        {children}
      </div>
    </article>
  );
}

const SAMPLE_ROWS = [
  { name: "Mercado", meta: "Alimentação · Pix", value: "− R$ 284,90", color: "#c9674e", income: false },
  { name: "Salário", meta: "Receita · Recorrente", value: "+ R$ 6.500,00", color: "#2f7d50", income: true },
  {
    name: "Aluguel",
    meta: "Moradia · Transferência",
    value: "− R$ 1.850,00",
    color: "#5b8ec4",
    income: false,
  },
  {
    name: "Uber",
    meta: "Transporte · Cartão de crédito",
    value: "− R$ 32,40",
    color: "#e8a23c",
    income: false,
  },
];

function TransactionsFragment() {
  return (
    <ul className="bg-surface shadow-card rounded-lg px-4">
      {SAMPLE_ROWS.map((row) => (
        <li key={row.name} className="border-line flex items-center gap-3 border-b py-3 last:border-b-0">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: row.color }} />
          <span className="min-w-0 flex-1">
            <span className="text-ink block truncate text-[0.95rem] font-medium">{row.name}</span>
            <span className="text-muted block truncate text-xs">{row.meta}</span>
          </span>
          <span
            className={clsx(
              "text-[0.95rem] font-semibold whitespace-nowrap tabular-nums",
              row.income ? "text-income" : "text-ink",
            )}
          >
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LimitsFragment() {
  const limits = [
    { name: "Alimentação", spent: "R$ 742", limit: "R$ 900", pct: 82, warn: true },
    { name: "Transporte", spent: "R$ 210", limit: "R$ 400", pct: 52, warn: false },
    { name: "Lazer", spent: "R$ 95", limit: "R$ 300", pct: 32, warn: false },
    { name: "Saúde", spent: "R$ 180", limit: "R$ 250", pct: 72, warn: false },
  ];
  return (
    <ul className="flex h-full flex-col justify-between gap-5 py-1">
      {limits.map((l) => (
        <li key={l.name}>
          <div className="flex items-baseline justify-between gap-3 text-[0.95rem]">
            <span className="text-ink font-medium">{l.name}</span>
            <span className="text-muted tabular-nums">
              <span className="text-ink font-semibold">{l.spent}</span> de {l.limit}
            </span>
          </div>
          <div className="bg-line mt-2 h-2 overflow-hidden rounded-full">
            <div
              className={clsx("h-full rounded-full", l.warn ? "bg-warning" : "bg-income")}
              style={{ width: `${l.pct}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function GoalFragment() {
  return (
    <div className="bg-surface shadow-card rounded-lg p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink font-semibold">Viagem para Lisboa</span>
        <span className="figure text-brand-700 text-xl font-bold">62%</span>
      </div>
      <p className="figure text-ink mt-3 text-[2rem] leading-none font-bold">
        R$ 7.400{" "}
        <span className="text-muted font-sans text-base font-normal tracking-normal">de R$ 12.000</span>
      </p>
      <div className="bg-brand-50 mt-4 h-2 overflow-hidden rounded-full">
        <div className="bg-brand-500 h-full w-[62%] rounded-full" />
      </div>
      <div className="text-muted mt-3 flex justify-between text-sm">
        <span>Até jul/2027</span>
        <span>Guardar R$ 511/mês</span>
      </div>
    </div>
  );
}

const SAMPLE_MONTHS = [
  { m: "Jun", i: 78, e: 52 },
  { m: "Jul", i: 78, e: 61 },
  { m: "Ago", i: 92, e: 49 },
  { m: "Set", i: 78, e: 57 },
  { m: "Out", i: 86, e: 44 },
  { m: "Nov", i: 78, e: 47 },
];

function ReportFragment() {
  return (
    <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
      <div className="flex-1">
        <div className="flex h-36 items-end gap-3 sm:gap-4">
          {SAMPLE_MONTHS.map((month) => (
            <div key={month.m} className="flex h-full flex-1 flex-col justify-end">
              <div className="flex flex-1 items-end justify-center gap-1">
                <span
                  className="bg-income-bar w-full max-w-3 rounded-t-sm"
                  style={{ height: `${month.i}%` }}
                />
                <span
                  className="bg-expense-bar w-full max-w-3 rounded-t-sm"
                  style={{ height: `${month.e}%` }}
                />
              </div>
              <span className="text-muted mt-2 text-center text-xs">{month.m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface shadow-card rounded-lg p-4 sm:w-52">
        <p className="text-muted text-xs">Maior categoria em novembro</p>
        <p className="text-ink mt-1 font-semibold">Moradia</p>
        <p className="figure text-ink mt-2 text-[1.75rem] leading-none font-bold">41%</p>
        <p className="text-muted mt-1 text-xs">das despesas do mês</p>
      </div>
    </div>
  );
}

/** The dashboard as it is in the app: graphite sidebar, balance panel, chart and latest expenses. */
function AppPreview() {
  const nav: [Icon, string][] = [
    [IconLayoutDashboard, "Dashboard"],
    [IconArrowsLeftRight, "Transações"],
    [IconLayoutGrid, "Categorias"],
    [IconTargetArrow, "Metas"],
    [IconChartPie, "Relatórios"],
    [IconSparkles, "Mi Assistente"],
  ];
  return (
    <div
      className="border-rail-line bg-cream relative -mb-px h-[25rem] overflow-hidden rounded-t-2xl border border-b-0 sm:h-[31rem] lg:h-[36rem]"
      aria-hidden
    >
      <div className="flex h-full">
        <div className="bg-rail-raised hidden w-52 shrink-0 flex-col gap-1 px-3 py-5 md:flex">
          <span className="text-rail-ink mb-5 flex items-center gap-2 px-2 font-bold">
            <span className="bg-brand-500 grid size-7 place-items-center rounded-md text-white">
              <IconChartBar size="0.95rem" />
            </span>
            MiCash
          </span>
          {nav.map(([NavIcon, label], i) => (
            <span
              key={label}
              className={clsx(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                i === 0 ? "bg-rail-line text-rail-ink font-semibold" : "text-rail-muted",
              )}
            >
              {i === 0 && <span className="bg-brand-500 absolute inset-y-2 left-0 w-[3px] rounded-r-full" />}
              <NavIcon size="1rem" className={i === 0 ? "text-brand-500" : undefined} />
              {label}
            </span>
          ))}
        </div>

        <div className="text-ink min-w-0 flex-1 p-4 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">Olá, Ana</p>
              <p className="text-muted text-xs sm:text-sm">Veja como estão suas finanças este mês</p>
            </div>
            <span className="bg-brand-600 hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white sm:flex">
              <IconPlus size="0.95rem" /> Nova transação
            </span>
          </div>

          <div className="bg-rail text-rail-ink mt-5 grid rounded-xl sm:grid-cols-[1.5fr_1fr]">
            <div className="p-5">
              <p className="text-rail-muted text-xs">Saldo de novembro</p>
              <p className="figure mt-1 text-[2rem] leading-none font-bold sm:text-[2.6rem]">R$ 4.280,50</p>
              <p className="mt-2 text-xs font-medium text-[#7fd3a1]">▲ 12% vs. mês anterior</p>
              <div className="bg-rail-raised mt-5 h-1.5 rounded-full">
                <div className="bg-brand-500 h-full w-[66%] rounded-full" />
              </div>
            </div>
            <div className="border-rail-line grid grid-cols-2 border-t sm:grid-cols-1 sm:border-t-0 sm:border-l">
              <div className="px-5 py-3.5">
                <p className="text-rail-muted text-xs">Receitas</p>
                <p className="figure text-lg font-bold">R$ 6.500,00</p>
              </div>
              <div className="border-rail-line border-l px-5 py-3.5 sm:border-t sm:border-l-0">
                <p className="text-rail-muted text-xs">Despesas</p>
                <p className="figure text-lg font-bold">R$ 2.219,50</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="bg-surface shadow-card hidden rounded-xl p-5 sm:block">
              <p className="font-display font-bold">Receitas x Despesas</p>
              <div className="mt-4 flex h-40 items-end gap-5">
                {SAMPLE_MONTHS.map((month) => (
                  <div key={month.m} className="flex h-full flex-1 flex-col justify-end">
                    <div className="flex flex-1 items-end justify-center gap-1">
                      <span
                        className="bg-income-bar w-full max-w-3.5 rounded-t-sm"
                        style={{ height: `${month.i}%` }}
                      />
                      <span
                        className="bg-expense-bar w-full max-w-3.5 rounded-t-sm"
                        style={{ height: `${month.e}%` }}
                      />
                    </div>
                    <span className="text-muted mt-2 text-center text-xs">{month.m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface shadow-card rounded-xl px-5 pt-4">
              <p className="font-display font-bold">Últimas despesas</p>
              <ul className="mt-1">
                {SAMPLE_ROWS.filter((r) => !r.income).map((row) => (
                  <li key={row.name} className="border-line flex items-center gap-3 border-b py-3 text-sm">
                    <span className="size-2 rounded-full" style={{ background: row.color }} />
                    <span className="flex-1 font-medium">{row.name}</span>
                    <span className="font-semibold tabular-nums">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="bg-rail-raised border-rail-line rounded-2xl border p-5 sm:p-7" aria-hidden>
      <p className="bg-brand-600 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-white">
        Quanto gastei com mercado em outubro?
      </p>
      <div className="mt-5 flex items-start gap-3">
        <span className="bg-brand-500 grid size-8 shrink-0 place-items-center rounded-lg text-white">
          <IconSparkles size="1rem" />
        </span>
        <div className="bg-rail border-rail-line min-w-0 flex-1 rounded-2xl rounded-tl-md border px-4 py-4">
          <p className="leading-relaxed">
            Em outubro você gastou <strong className="text-white">R$ 842,30</strong> com Mercado, 6% a menos
            que em setembro.
          </p>
          <div className="border-rail-line mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border">
            <div className="bg-rail-raised p-3">
              <p className="text-rail-muted text-xs">Setembro</p>
              <p className="figure mt-0.5 text-lg font-bold">R$ 896,10</p>
            </div>
            <div className="bg-rail-raised p-3">
              <p className="text-rail-muted text-xs">Outubro</p>
              <p className="figure mt-0.5 text-lg font-bold text-[#7fd3a1]">R$ 842,30</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Onde posso economizar?", "Resumo do mês"].map((chip) => (
          <span key={chip} className="border-rail-line text-rail-ink rounded-full border px-4 py-2 text-sm">
            {chip}
          </span>
        ))}
      </div>
      <div className="border-rail-line bg-rail mt-5 flex items-center gap-3 rounded-xl border py-2 pr-2 pl-4">
        <span className="text-rail-muted flex-1 text-sm">Pergunte sobre suas finanças…</span>
        <span className="bg-brand-600 grid size-9 place-items-center rounded-lg text-white">
          <IconSend2 size="1rem" />
        </span>
      </div>
    </div>
  );
}

/** Phone shell: tall frame with a notch. */
function PhoneFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("shadow-float w-[13.5rem] rounded-[2.4rem] bg-[#1b1916] p-2 sm:w-60", className)}>
      <div className="bg-cream relative flex aspect-[9/18.5] flex-col overflow-hidden rounded-[1.95rem] px-4 pt-10 pb-5">
        <span className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1b1916]" />
        {children}
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="flex justify-center gap-4 sm:gap-6 lg:order-1 lg:justify-start" aria-hidden>
      {/* Dashboard */}
      <PhoneFrame>
        <p className="text-muted text-xs">Olá, Ana</p>
        <div className="bg-rail text-rail-ink mt-3 rounded-xl p-3">
          <p className="text-rail-muted text-[0.65rem]">Saldo do mês</p>
          <p className="figure text-xl font-bold">R$ 4.280,50</p>
          <div className="mt-2 flex justify-between text-[0.65rem]">
            <span className="text-[#7fd3a1]">+ R$ 6.500</span>
            <span className="text-[#f4a08a]">− R$ 2.219</span>
          </div>
        </div>
        <div className="bg-surface shadow-card mt-3 rounded-xl p-3 text-xs">
          <p className="text-ink flex justify-between font-semibold">
            Viagem <span className="text-brand-700">62%</span>
          </p>
          <div className="bg-brand-50 mt-2 h-1.5 rounded-full">
            <div className="bg-brand-500 h-full w-[62%] rounded-full" />
          </div>
        </div>
        <ul className="bg-surface shadow-card mt-3 rounded-xl px-3 text-xs">
          {SAMPLE_ROWS.slice(0, 3).map((row) => (
            <li
              key={row.name}
              className="border-line flex items-center gap-2 border-b py-2.5 last:border-b-0"
            >
              <span className="size-1.5 rounded-full" style={{ background: row.color }} />
              <span className="text-ink flex-1 font-medium">{row.name}</span>
              <span className={clsx("font-semibold tabular-nums", row.income ? "text-income" : "text-ink")}>
                {row.value.replace("R$ ", "").replace(",00", "")}
              </span>
            </li>
          ))}
        </ul>
      </PhoneFrame>

      {/* Mi Assistente */}
      <PhoneFrame className="mt-16 hidden min-[420px]:block">
        <p className="text-ink flex items-center gap-2 text-sm font-semibold">
          <span className="bg-brand-500 grid size-6 place-items-center rounded-md text-white">
            <IconSparkles size="0.85rem" />
          </span>
          Mi Assistente
        </p>
        <p className="bg-brand-600 mt-5 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-xs text-white">
          Quanto gastei com mercado?
        </p>
        <p className="bg-surface shadow-card text-ink mt-3 max-w-[90%] rounded-2xl rounded-tl-md px-3 py-2 text-xs leading-relaxed">
          Em outubro: <strong>R$ 842,30</strong>, 6% a menos que em setembro.
        </p>
        <span className="border-line text-ink mt-3 w-fit rounded-full border px-3 py-1.5 text-xs">
          Resumo do mês
        </span>
      </PhoneFrame>
    </div>
  );
}

function StoreBadge({ icon: StoreIcon, store }: { icon: Icon; store: string }) {
  return (
    <span className="flex items-center gap-3 rounded-xl bg-[#1b1916] px-4 py-2.5 text-white">
      <StoreIcon size="1.5rem" aria-hidden />
      <span className="leading-tight">
        <span className="block text-xs text-[#b0a9a1]">Em breve na</span>
        <span className="font-semibold">{store}</span>
      </span>
    </span>
  );
}
