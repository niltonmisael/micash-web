import type { NextRequest } from "next/server";
import { apiUnavailable, callApi, clientIp, errorJson, relay } from "@/lib/server/micash-api";
import { isAccessTokenUsable, isSameOrigin, readSession } from "@/lib/server/session";

/**
 * Forwards /api/proxy/<path> to micash-api /<path>, adding the access token from the cookie.
 * It does not refresh: on 401 the browser refreshes once (lib/api.ts) and retries.
 * Routes that hand out tokens (login, register, refresh, verify-email) have their own handlers
 * under /api/auth and are refused here, so tokens never reach the browser.
 */
// change-password also goes through /api/auth: it must log in again (the API revokes the old sessions).
const TOKEN_ROUTES = new Set([
  "login",
  "refresh",
  "verify-email",
  "api/user/register",
  "api/user/change-password",
]);

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const apiPath = path.join("/");

  if (TOKEN_ROUTES.has(apiPath.toLowerCase())) return errorJson(404, "Rota não encontrada.");
  if (request.method !== "GET" && !isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { accessToken, refreshToken } = readSession(request);
  const usableToken = isAccessTokenUsable(accessToken) ? accessToken : undefined;
  // Expired token but a session exists: 401 right away so the browser refreshes. With no session at
  // all the call goes through anonymously (forgot-password...); protected routes answer 401 themselves.
  if (!usableToken && refreshToken) return errorJson(401, "Sessão expirada.", "SESSION_EXPIRED");

  const target = "/" + path.map(encodeURIComponent).join("/") + request.nextUrl.search;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const apiResponse = await callApi(target, {
      method: request.method,
      headers: hasBody ? { "Content-Type": request.headers.get("Content-Type") ?? "application/json" } : {},
      body: hasBody ? await request.text() : undefined,
      accessToken: usableToken,
      clientIp: clientIp(request),
    });
    return await relay(apiResponse);
  } catch {
    return apiUnavailable();
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE, forward as PATCH };
