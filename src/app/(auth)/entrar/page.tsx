import type { Metadata } from "next";
import { Suspense } from "react";
import { SplitAuthLayout } from "@/components/auth/auth-layouts";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <SplitAuthLayout
      asideTitle="Tudo em um só lugar"
      asideText="Seu painel financeiro sincronizado com o app, onde você estiver."
    >
      <h1 className="text-ink text-[2.4rem] leading-[1.05] font-bold sm:text-[2.9rem]">Bem-vindo de volta</h1>
      <p className="text-muted mt-3 text-lg">Entre para acompanhar suas finanças.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </SplitAuthLayout>
  );
}
