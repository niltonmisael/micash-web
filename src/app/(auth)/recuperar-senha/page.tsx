import type { Metadata } from "next";
import { PasswordReset } from "./password-reset";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function PasswordResetPage() {
  return <PasswordReset />;
}
