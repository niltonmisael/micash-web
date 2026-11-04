import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "@/lib/jwt";

/**
 * Session = the API tokens kept in httpOnly cookies, so page JavaScript never sees them.
 * The API refresh token lives 7 days and rotates on every use (the old one is revoked).
 */
export const ACCESS_COOKIE = "micash_at";
export const REFRESH_COOKIE = "micash_rt";
/** "1" = "Manter conectado": cookies survive the browser closing; otherwise they are session cookies. */
export const REMEMBER_COOKIE = "micash_remember";

const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type ApiTokens = { token: string; refreshToken: string };

function baseCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setSession(response: NextResponse, tokens: ApiTokens, remember: boolean) {
  const exp = decodeJwt(tokens.token)?.exp;
  const accessMaxAge = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : undefined;

  response.cookies.set(ACCESS_COOKIE, tokens.token, {
    ...baseCookie(),
    // Without "remember", a session cookie: gone when the browser closes, like the refresh token.
    maxAge: remember ? accessMaxAge : undefined,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookie(),
    maxAge: remember ? REFRESH_MAX_AGE_SECONDS : undefined,
  });
  response.cookies.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    ...baseCookie(),
    maxAge: remember ? REFRESH_MAX_AGE_SECONDS : undefined,
  });
}

export function clearSession(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, REMEMBER_COOKIE]) {
    response.cookies.set(name, "", { ...baseCookie(), maxAge: 0 });
  }
}

export function readSession(request: NextRequest) {
  return {
    accessToken: request.cookies.get(ACCESS_COOKIE)?.value,
    refreshToken: request.cookies.get(REFRESH_COOKIE)?.value,
    remember: request.cookies.get(REMEMBER_COOKIE)?.value !== "0",
  };
}

/** The access token cookie can outlive the JWT when "remember" is off (session cookie). */
export function isAccessTokenUsable(accessToken: string | undefined) {
  if (!accessToken) return false;
  const exp = decodeJwt(accessToken)?.exp;
  // 30s margin so a token does not expire between this check and the API call.
  return exp === undefined || exp - 30 > Date.now() / 1000;
}

/**
 * Blocks cross-site requests that change state. SameSite=Lax already keeps the cookies out of
 * cross-site POSTs; this is a second layer.
 */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
