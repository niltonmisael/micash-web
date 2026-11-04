/**
 * What each plan includes, for the public pages (/planos, landing). Mirrors PlanLimits.Free / PlanLimits.Premium
 * in micash-api (MiCash.Domain/Services/Plans): change both together. Signed-in screens read the live values
 * from GET /api/subscription/limits instead.
 */
export const FREE_FEATURES = [
  "Receitas e despesas ilimitadas",
  "Dashboard, categorias e relatórios",
  "1 meta de economia",
  "3 limites de gasto por mês",
  "5 perguntas por mês ao Mi Assistente",
  "Histórico do mês atual e dos 3 anteriores",
];

export const PREMIUM_FEATURES = [
  "Tudo do plano Gratuito",
  "Mi Assistente com até 30 perguntas por dia",
  "Metas de economia e limites de gasto ilimitados",
  "Histórico completo no dashboard e nos relatórios",
  "Previsão do fim do mês e dicas completas do Mi",
  "Aviso quando um limite chega a 80%",
];

/** [feature, Gratuito, Premium] */
export const PLAN_COMPARISON: [string, string, string][] = [
  ["Receitas e despesas", "Ilimitadas", "Ilimitadas"],
  ["Metas de economia", "1", "Ilimitadas"],
  ["Limites de gasto por mês", "3", "Ilimitados"],
  ["Perguntas ao Mi Assistente", "5 por mês", "Até 30 por dia"],
  ["Histórico no dashboard e relatórios", "Mês atual + 3 anteriores", "Completo"],
  ["Dicas do Mi", "Prévia", "Completas"],
  ["Previsão do fim do mês", "—", "Incluída"],
  ["Aviso aos 80% de um limite", "—", "Incluído"],
  ["Copiar limites de um mês para outro", "—", "Incluído"],
];
