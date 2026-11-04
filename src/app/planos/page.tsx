import type { Metadata } from "next";
import { Pricing } from "@/components/site/pricing";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
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
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="text-center">
          <h1 className="text-ink text-[2.8rem] font-bold tracking-tight sm:text-[4rem]">
            Escolha o plano ideal
          </h1>
          <p className="text-muted mt-3 text-xl">Comece grátis. Evolua quando precisar.</p>
        </div>

        <div className="mt-12">
          <Pricing plans={plans} />
        </div>

        <section aria-labelledby="comparativo" className="mx-auto mt-20 max-w-5xl">
          <h2 id="comparativo" className="sr-only">
            Comparativo dos planos
          </h2>
          <div className="border-line bg-surface overflow-x-auto rounded-[1.5rem] border">
            <table className="w-full min-w-[36rem] border-collapse text-left text-lg">
              <thead className="bg-brand-50">
                <tr>
                  <th scope="col" className="text-muted px-8 py-5 font-semibold">
                    Comparativo
                  </th>
                  <th scope="col" className="text-muted px-6 py-5 font-semibold">
                    Gratuito
                  </th>
                  <th scope="col" className="text-brand-700 px-6 py-5 font-semibold">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISON.map(([feature, free, premium]) => (
                  <tr key={feature} className="border-line border-t">
                    <th scope="row" className="text-ink px-8 py-5 font-semibold">
                      {feature}
                    </th>
                    <td className="text-muted px-6 py-5">
                      {free === "—" ? <span aria-label="Não incluído">—</span> : free}
                    </td>
                    <td className="text-brand-700 px-6 py-5 font-semibold">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
