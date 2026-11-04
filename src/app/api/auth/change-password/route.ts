import type { NextRequest } from "next/server";
import { sessionFromApi } from "@/lib/server/auth-response";
import { apiUnavailable, callApi, errorJson, postJson, relay } from "@/lib/server/micash-api";
import { isAccessTokenUsable, isSameOrigin, readSession } from "@/lib/server/session";

/**
 * Changing the password revokes every session opened before it (the API stops renewing them). So, like
 * the mobile app, this logs in again with the new password right away and swaps the cookies — the user
 * stays signed in here, and only the other devices are signed out.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { accessToken, remember } = readSession(request);
  if (!isAccessTokenUsable(accessToken)) return errorJson(401, "Sessão expirada.", "SESSION_EXPIRED");

  const { email, password, newPassword } = (await request.json()) as {
    email?: string;
    password?: string;
    newPassword?: string;
  };

  try {
    const changed = await callApi("/api/user/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, newPassword }),
      accessToken,
    });
    if (!changed.ok) return await relay(changed);

    return await sessionFromApi(await postJson("/login", { email, password: newPassword }), remember);
  } catch {
    return apiUnavailable();
  }
}
