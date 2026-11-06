import { type NextRequest } from "next/server";
import { sessionFromApi } from "@/lib/server/auth-response";
import { apiUnavailable, clientIp, errorJson, postJson } from "@/lib/server/micash-api";
import { isSameOrigin, readSession } from "@/lib/server/session";

/**
 * Swaps the refresh token for a new pair. The browser serializes these calls (see lib/api.ts):
 * the API revokes the old refresh token, so two parallel refreshes would end the session.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { refreshToken, remember } = readSession(request);
  if (!refreshToken) return errorJson(401, "Sessão expirada.", "SESSION_EXPIRED");

  try {
    const apiResponse = await postJson("/refresh", { refreshToken }, { clientIp: clientIp(request) });
    return await sessionFromApi(apiResponse, remember, { clearOnError: true });
  } catch {
    return apiUnavailable();
  }
}
