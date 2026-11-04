import type { NextRequest } from "next/server";
import { sessionFromApi } from "@/lib/server/auth-response";
import { apiUnavailable, errorJson, postJson } from "@/lib/server/micash-api";
import { isSameOrigin } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorJson(403, "Origem não permitida.");

  const { email, password, remember } = (await request.json()) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };

  try {
    const apiResponse = await postJson("/login", { email, password });
    return await sessionFromApi(apiResponse, remember === true);
  } catch {
    return apiUnavailable();
  }
}
