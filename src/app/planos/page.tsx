import type { Metadata } from "next";
import { Pricing } from "@/components/site/pricing";
import { SITE_WRAP, SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PLAN_COMPARISON } from "@/lib/plans";
import { fetchPlans } from "@/lib/server/plans";

export const metadata: Metadata = {
  title: "Planos e preços",
  description:
    "Comece grátis. Com o Premium, Mi Assistente com mais perguntas, metas ilimitadas e histórico completo.",
};

export default async function PlansPage() {
  const plans = await fetchPlans();

  return (
    <>
      <SiteHeader active="planos" />
      <main>
        <div className={`${SITE_WRAP} pt-14 pb-20 sm:pt-20 sm:pb-28`}>
          <div
            className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16"
            data-enter
          >
            <h1 className="text-ink text-[2.8rem] leading-[1] font-bold tracking-[-0.035em] sm:text-[4.4rem]">
              Escolha o plano ideal
            </h1>
            <p className="text-muted max-w-md text-lg leading-relaxed lg:pb-2">
              Comece grátis, sem prazo. Evolua para o Premium quando quiser mais do Mi, metas ilimitadas e o
              histórico completo.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <Pricing plans={plans} />
          </div>

          <section aria-labelledby="comparativo" className="mt-20 sm:mt-28">
            <h2 id="comparativo" className="text-ink text-[2rem] leading-tight font-bold sm:text-[2.5rem]">
              Comparativo dos planos
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead>
                  <tr className="border-ink border-b-2">
                    <th scope="col" className="text-muted w-1/2 py-4 pr-6 text-sm font-semibold">
                      Recurso
                    </th>
                    <th scope="col" className="text-ink font-display px-6 py-4 text-lg font-bold">
                      Gratuito
                    </th>
                    <th scope="col" className="text-brand-700 font-display px-6 py-4 text-lg font-bold">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_COMPARISON.map(([feature, free, premium]) => (
                    <tr key={feature} className="border-line border-b">
                      <th scope="row" className="text-ink py-4 pr-6 font-medium">
                        {feature}
                      </th>
                      <td className="text-muted px-6 py-4">
                        {free === "—" ? <span aria-label="Não incluído">—</span> : free}
                      </td>
                      <td className="text-ink px-6 py-4 font-semibold">{premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
