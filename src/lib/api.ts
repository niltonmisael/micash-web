/**
 * Browser-side client. Every call goes to this app's own server (/api/proxy, /api/auth), which keeps
 * the tokens in httpOnly cookies and talks to micash-api.
 */

export type ApiErrorBody = { errorMessages?: string[]; errorCode?: string; retryAt?: string };

export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly retryAt?: Date;
  readonly messages: string[];

  constructor(status: number, body: ApiErrorBody | null) {
    const messages = body?.errorMessages?.length ? body.errorMessages : [defaultMessage(status)];
    super(messages[0]);
    this.status = status;
    this.errorCode = body?.errorCode;
    this.retryAt = body?.retryAt ? new Date(body.retryAt) : undefined;
    this.messages = messages;
  }

  get isPlanLimit() {
    return this.errorCode === "PLAN_LIMIT_REACHED";
  }
}

function defaultMessage(status: number) {
  if (status >= 500) return "Algo deu errado do nosso lado. Tente novamente em instantes.";
  if (status === 429) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  return "Não foi possível concluir a ação.";
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * One refresh at a time: the API revokes the old refresh token when it issues a new one, so two
 * parallel refreshes would log the user out. A Web Lock also serializes the tabs; since the cookies
 * are shared, a tab waiting on the lock refreshes with the token the previous tab just saved.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const run = async () => (await fetch("/api/auth/refresh", { method: "POST" })).ok;
    try {
      return typeof navigator !== "undefined" && navigator.locks
        ? await navigator.locks.request("micash-refresh", run)
        : await run();
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

function goTo(path: string) {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(path === "/entrar" ? `${path}?next=${next}` : path);
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

async function send(url: string, { method = "GET", body }: RequestOptions) {
  return fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Calls a micash-api route through the proxy, e.g. api("api/Dashboard/monthly-summary", { query }).
 * 401 → one refresh and one retry, then the login page. 403 EMAIL_NOT_VERIFIED → verification page.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const url = `/api/proxy/${path.replace(/^\//, "")}${params.size ? `?${params}` : ""}`;

  let response = await send(url, options);
  if (response.status === 401 && (await refreshSession())) {
    response = await send(url, options);
  }

  try {
    return await parse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) goTo("/entrar");
      if (error.errorCode === "EMAIL_NOT_VERIFIED") goTo("/verificar-email");
    }
    throw error;
  }
}

/** Calls this app's own auth routes (/api/auth/*). No automatic redirect: the page shows the error. */
export async function authApi<T>(route: string, body?: unknown, retryOn401 = false): Promise<T> {
  const url = `/api/auth/${route}`;
  let response = await send(url, { method: "POST", body });
  if (retryOn401 && response.status === 401 && (await refreshSession())) {
    response = await send(url, { method: "POST", body });
  }
  return parse<T>(response);
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.messages.join(" ");
  return "Não foi possível conectar. Verifique sua internet e tente novamente.";
}
