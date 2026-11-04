/**
 * Reads a JWT payload WITHOUT verifying the signature. Only for routing decisions (expiry,
 * e-mail verified); the API is the one that validates the token.
 */
export type JwtPayload = { exp?: number; email_verified?: string; [claim: string]: unknown };

export function decodeJwt(token: string): JwtPayload | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** A missing claim (tokens issued before e-mail verification existed) counts as verified, like the API. */
export function isEmailVerified(token: string | undefined) {
  if (!token) return true;
  return decodeJwt(token)?.email_verified !== "false";
}
