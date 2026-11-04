import type { NextRequest } from "next/server";
import { sessionFromApi } from "@/lib/server/auth-response";
import { apiUnavailable, errorJson, postJson } from "@/lib/server/micash-api";
import { isAccessTokenUsable, isSameOrigin, readSession } from "@/lib/server/session";

/** Confirms the sign-up code. The API returns new tokens (email_verified = true), which replace the cookies. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { accessToken, remember } = readSession(request);
  if (!isAccessTokenUsable(accessToken)) return errorJson(401, "Sessão expirada.", "SESSION_EXPIRED");

  const { code } = (await request.json()) as { code?: string };

  try {
    const apiResponse = await postJson("/verify-email", { code }, accessToken);
    return await sessionFromApi(apiResponse, remember);
  } catch {
    return apiUnavailable();
  }
}
