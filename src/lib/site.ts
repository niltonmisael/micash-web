export const SUPPORT_EMAIL = "nilton_misael@hotmail.com";

/** Only same-site paths are accepted as a post-login destination (prevents open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
