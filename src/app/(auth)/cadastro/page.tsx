import type { Metadata } from "next";
import { SplitAuthLayout } from "@/components/auth/auth-layouts";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <SplitAuthLayout
      asideTitle="Comece em um minuto"
      asideText="Cadastre-se e registre sua primeira receita ou despesa hoje mesmo."
    >
      <h1 className="text-ink text-5xl font-bold tracking-tight">Crie sua conta</h1>
      <p className="text-muted mt-4 text-xl">Grátis, sem cartão de crédito.</p>
      <RegisterForm />
    </SplitAuthLayout>
  );
}
