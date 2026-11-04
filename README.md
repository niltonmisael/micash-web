# micash-web

Versão web do MiCash: área logada e, nas próximas fases, o site público e a venda do Premium (checkout Pagar.me).

## Rodando

```bash
cp .env.example .env.local   # MICASH_API_URL=http://localhost:5203
yarn
yarn dev                     # http://localhost:3000
```

A `micash-api` precisa estar rodando. O CORS dela não é usado: o navegador só conversa com este app.

| Script                                   | O que faz                                  |
| ---------------------------------------- | ------------------------------------------ |
| `yarn dev` / `yarn build` / `yarn start` | Next.js                                    |
| `yarn typecheck`                         | `tsc --noEmit`                             |
| `yarn lint`                              | ESLint                                     |
| `yarn format` / `yarn format:check`      | Prettier (+ ordenação de classes Tailwind) |

## Arquitetura

- **Next.js App Router + TypeScript + Tailwind v4**, TanStack Query, react-hook-form + zod, Recharts e ícones Tabler.
- **BFF de sessão:** os tokens da API ficam em cookies `httpOnly`, nunca no JavaScript da página.
  - `src/app/api/auth/*`: login, cadastro, verificação de e-mail, refresh e logout. Recebem os tokens da API e gravam nos cookies.
  - `src/app/api/proxy/[...path]`: repassa `/api/proxy/<rota>` para a API com o `Bearer` do cookie. Recusa as rotas que devolvem tokens.
  - O refresh token da API é rotativo (o anterior é revogado). Por isso o navegador faz um refresh por vez, com promise única por aba e Web Lock entre abas (`src/lib/api.ts`). O middleware só cuida de redirecionar.
- **Middleware** (`src/middleware.ts`): sem sessão, as páginas do app vão para `/entrar`; e-mail não verificado vai para `/verificar-email`.
- **Erros:** os mesmos contratos da API (`errorMessages`, `errorCode`, `retryAt`). `PLAN_LIMIT_REACHED` é tratado na web, porque os textos da API são neutros e não vendem nada.
- **Brasil apenas:** pt-BR, BRL e horário de Brasília fixos (`src/lib/format.ts`).

## Estado

Pronto:

- **Fase 1:** login, cadastro (com celular), verificação de e-mail (com correção de e-mail), recuperação de senha por **código** e dashboard.
- **Fase 2:** Transações (filtros por mês, tipo, categoria e busca; edição e exclusão), modal Nova despesa/receita (também no dashboard) e Categorias (criar, editar e excluir as de despesa).
  - A lista usa `GET /api/transactions`, criado na API para esta tela. A API precisa estar atualizada.
  - Os ícones e as cores de categoria são os mesmos do app (`src/components/app/category-icon.tsx`).
  - As categorias de receita são uma lista fixa da API.

- **Fase 3:**
  - Metas, com duas abas:
    - "Metas de economia": guardar, retirar, histórico, editar e excluir.
    - "Limites de gasto" por categoria e mês: copiar do mês anterior é recurso Premium.
  - Relatórios: mês atual, mês anterior, 3, 6 e 12 meses, com receitas, despesas, saldo, taxa de poupança, evolução e maiores categorias.
  - Os limites do plano vêm de `GET /api/subscription/limits`. O que o plano bloqueia aparece com cadeado e o link "Conhecer Premium".

- **Fase 4:**
  - Mi Assistente: chat com histórico paginado, "Nova conversa", contador do plano, sugestões e dicas do mês. As respostas usam um subconjunto de Markdown, renderizado sem HTML.
  - Configurações:
    - Perfil: nome e troca de e-mail em 2 passos.
    - Segurança: troca de senha. A rota `/api/auth/change-password` refaz o login, porque a API derruba as sessões antigas.
    - Privacidade: termos, contato do DPO e exclusão de conta, bloqueada enquanto houver assinatura renovando.

As demais telas do menu mostram "em breve".

Os protótipos ficam em `Docs/MiCash-Web-Telas` e servem só como referência visual. Os textos de planos neles estão desatualizados; os limites reais vêm de `GET /api/subscription/limits`.

### Diferenças intencionais em relação aos protótipos

- O laranja de botões e textos é um pouco mais escuro (`brand-600`/`brand-700`), para atingir contraste AA. O `#F58A3C` continua nos ícones e destaques.
- As barras de receita e despesa usam um par validado para daltonismo (`#2f7d50` / `#e8957f`).
- "Contas" (Conta Principal, Cartão Nubank) não existe na API e foi removido.
- A lista do dashboard é de "Últimas despesas", porque a API só expõe as últimas despesas.

### Pendências antes do lançamento

- Textos de **Termos de Uso** e **Política de Privacidade** (`/termos` e `/privacidade` são placeholders).
- A origem de produção em `Cors:AllowedOrigins` não é necessária, já que o navegador não chama a API diretamente.
