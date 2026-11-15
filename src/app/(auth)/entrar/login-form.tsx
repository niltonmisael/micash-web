"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLock, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { authApi, errorMessage } from "@/lib/api";
import { safeNextPath } from "@/lib/site";

const schema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type LoginResult = { name: string; emailVerified: boolean };

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { remember: false } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined);
    try {
      const result = await authApi<LoginResult>("login", values);
      router.replace(result.emailVerified ? next : "/verificar-email");
      router.refresh();
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-9 flex flex-col gap-5">
      {serverError && <Alert>{serverError}</Alert>}
      <Field
        label="E-mail"
        type="email"
        icon={IconMail}
        placeholder="voce@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="flex flex-col gap-4">
        <Field
          label="Senha"
          type="password"
          icon={IconLock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex items-center justify-between gap-4">
          <label className="text-ink flex cursor-pointer items-center gap-3 text-[0.95rem]">
            <input type="checkbox" className="accent-brand-500 size-4.5" {...register("remember")} />
            Manter conectado
          </label>
          <Link
            href="/recuperar-senha"
            className="text-brand-700 hover:text-brand-800 text-[0.95rem] font-semibold"
          >
            Esqueci a senha
          </Link>
        </div>
      </div>
      <Button type="submit" block loading={isSubmitting} className="mt-4">
        Entrar
      </Button>
      <p className="text-muted mt-4 text-center text-base">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-brand-700 hover:text-brand-800 font-semibold">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}
