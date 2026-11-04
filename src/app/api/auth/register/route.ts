import type { NextRequest } from "next/server";
import { sessionFromApi } from "@/lib/server/auth-response";
import { apiUnavailable, errorJson, postJson } from "@/lib/server/micash-api";
import { isSameOrigin } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { name, email, phone, password } = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  try {
    // The API opens a session right away (emailVerified: false) so the user can confirm the code.
    const apiResponse = await postJson("/api/user/register", { name, email, password, phone: phone ?? "" });
    return await sessionFromApi(apiResponse, true);
  } catch {
    return apiUnavailable();
  }
}
