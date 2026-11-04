import "server-only";
import { NextResponse } from "next/server";

function apiBaseUrl() {
  const url = process.env.MICASH_API_URL;
  if (!url) throw new Error("MICASH_API_URL is not set (see .env.example).");
  return url;
}

/** Calls micash-api from the server. `path` is the API path, e.g. "/login" or "/api/Dashboard/monthly-summary". */
export function callApi(path: string, init: RequestInit & { accessToken?: string } = {}) {
  const { accessToken, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  finalHeaders.set("Accept-Language", "pt-BR");
  if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);

  return fetch(new URL(path, apiBaseUrl()), { ...rest, headers: finalHeaders, cache: "no-store" });
}

export function postJson(path: string, body: unknown, accessToken?: string) {
  return callApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    accessToken,
  });
}

/** Copies an API answer (status + body) to the browser, keeping the error contract (errorMessages, errorCode, retryAt). */
export async function relay(response: Response) {
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  const body = await response.text();
  return new NextResponse(body || null, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
  });
}

export function errorJson(status: number, message: string, errorCode?: string) {
  return NextResponse.json({ errorMessages: [message], ...(errorCode ? { errorCode } : {}) }, { status });
}

export function apiUnavailable() {
  return errorJson(503, "Não foi possível conectar ao MiCash. Tente novamente em instantes.");
}
