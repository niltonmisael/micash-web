import "server-only";
import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";

function apiBaseUrl() {
  const url = process.env.MICASH_API_URL;
  if (!url) throw new Error("MICASH_API_URL is not set (see .env.example).");
  return url;
}

/**
 * The visitor's IP, so the API rate limits count each user (not this server) per IP.
 * It comes from X-Real-Ip, which Traefik overwrites with the real TCP peer; the browser's own
 * X-Forwarded-For is never trusted (anyone can forge it). Without Traefik in front (local dev)
 * there is no header and the API just sees this server's IP.
 */
export function clientIp(request: NextRequest) {
  const ip = request.headers.get("x-real-ip")?.trim();
  return ip && isIP(ip) ? ip : undefined;
}

type ApiInit = RequestInit & { accessToken?: string; clientIp?: string };

/** Calls micash-api from the server. `path` is the API path, e.g. "/login" or "/api/dashboard/monthly-summary". */
export function callApi(path: string, init: ApiInit = {}) {
  const { accessToken, clientIp: ip, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  finalHeaders.set("Accept-Language", "pt-BR");
  if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  // The API only trusts this header from the private Docker network (ForwardedHeaders): call it
  // directly (http://api:8080), never through Traefik, or Traefik's own entry wins.
  if (ip) finalHeaders.set("X-Forwarded-For", ip);

  return fetch(new URL(path, apiBaseUrl()), { ...rest, headers: finalHeaders, cache: "no-store" });
}

export function postJson(
  path: string,
  body: unknown,
  options: { accessToken?: string; clientIp?: string } = {},
) {
  return callApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...options,
  });
}

/** Copies an API answer (status + body) to the browser, keeping the error contract (errorMessages, errorCode, retryAt). */
export async function relay(response: Response) {
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  const body = await response.text();
  const headers = new Headers({ "Content-Type": response.headers.get("Content-Type") ?? "application/json" });
  // 429: the browser needs to know when it can try again.
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) headers.set("Retry-After", retryAfter);
  return new NextResponse(body || null, { status: response.status, headers });
}

export function errorJson(status: number, message: string, errorCode?: string) {
  return NextResponse.json({ errorMessages: [message], ...(errorCode ? { errorCode } : {}) }, { status });
}

export function apiUnavailable() {
  return errorJson(503, "Não foi possível conectar ao MiCash. Tente novamente em instantes.");
}
