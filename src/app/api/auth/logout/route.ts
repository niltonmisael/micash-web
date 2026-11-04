import { NextResponse, type NextRequest } from "next/server";
import { errorJson, postJson } from "@/lib/server/micash-api";
import { clearSession, isSameOrigin, readSession } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { accessToken, refreshToken } = readSession(request);
  if (refreshToken) {
    // Best effort: revokes the refresh token at the API. The cookies are cleared either way.
    await postJson("/logout", { refreshToken }, accessToken).catch(() => undefined);
  }

  const response = new NextResponse(null, { status: 204 });
  clearSession(response);
  return response;
}
