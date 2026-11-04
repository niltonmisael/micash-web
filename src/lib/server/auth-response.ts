import "server-only";
import { NextResponse } from "next/server";
import { relay } from "./micash-api";
import { clearSession, setSession } from "./session";

/** Body of the API answers that open a session (login, register, refresh, verify-email). */
type ApiSessionJson = {
  name: string;
  token: string;
  refreshToken: string;
  emailVerified: boolean;
  showPremiumOffer?: boolean;
};

/**
 * Turns an API answer that carries tokens into cookies. The browser only receives
 * { name, emailVerified, showPremiumOffer? } — never the tokens.
 */
export async function sessionFromApi(
  apiResponse: Response,
  remember: boolean,
  options: { clearOnError?: boolean } = {},
) {
  if (!apiResponse.ok) {
    const response = await relay(apiResponse);
    if (options.clearOnError) clearSession(response);
    return response;
  }

  const { token, refreshToken, ...user } = (await apiResponse.json()) as ApiSessionJson;
  const response = NextResponse.json(user);
  setSession(response, { token, refreshToken }, remember);
  return response;
}
