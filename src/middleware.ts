import { NextResponse, type NextRequest } from "next/server";
import { isEmailVerified } from "@/lib/jwt";

/**
 * Routing only (no token refresh here: parallel prefetches would race on the rotating refresh token;
 * the browser refreshes on its first 401, see lib/api.ts).
 * - App pages need a session (refresh cookie).
 * - Unverified e-mail → /verificar-email.
 * - Signed-in users are sent from the auth pages to the dashboard.
 */
const ACCESS_COOKIE = "micash_at";
const REFRESH_COOKIE = "micash_rt";

const AUTH_PAGES = ["/entrar", "/cadastro"];
const VERIFY_PAGE = "/verificar-email";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  // Unknown (undefined) while the access token is missing/expired: the API then answers 403
  // EMAIL_NOT_VERIFIED and the browser goes to the verification page. Avoids redirect loops.
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const verified = accessToken ? isEmailVerified(accessToken) : undefined;
  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/") return redirect(hasSession ? "/dashboard" : "/entrar");

  if (AUTH_PAGES.includes(pathname)) {
    if (!hasSession) return NextResponse.next();
    return redirect(verified === false ? VERIFY_PAGE : "/dashboard");
  }

  if (pathname === VERIFY_PAGE) {
    if (!hasSession) return redirect("/entrar");
    return verified === true ? redirect("/dashboard") : NextResponse.next();
  }

  // Everything else matched below is an app page.
  if (!hasSession) return redirect(`/entrar?next=${encodeURIComponent(pathname + search)}`);
  if (verified === false) return redirect(VERIFY_PAGE);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/entrar",
    "/cadastro",
    "/verificar-email",
    "/dashboard/:path*",
    "/transacoes/:path*",
    "/categorias/:path*",
    "/metas/:path*",
    "/relatorios/:path*",
    "/assistente/:path*",
    "/assinatura/:path*",
    "/configuracoes/:path*",
  ],
};
