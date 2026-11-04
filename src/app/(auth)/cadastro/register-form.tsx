"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceMobile, IconLock, IconMail, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { authApi, errorMessage } from "@/lib/api";
import { isStrongPassword, PASSWORD_ERROR } from "@/lib/password";
import { formatPhone, isValidMobile, phoneDigits } from "@/lib/phone";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  phone: z
    .string()
    .min(1, "Informe seu celular.")
    .refine(isValidMobile, "Informe um celular válido com DDD, ex.: (11) 98765-4321."),
  password: z.string().refine(isStrongPassword, PASSWORD_ERROR),
  terms: z.boolean().refine(Boolean, "Aceite os Termos de Uso e a Política de Privacidade para continuar."),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", terms: false },
  });
  const password = useWatch({ control, name: "password" });

  const onSubmit = handleSubmit(async ({ name, email, phone, password }) => {
    setServerError(undefined);
    try {
      // The API stores the phone as sent (no validation there): digits only, e.g. "11987654321".
      await authApi("register", { name, email, phone: phoneDigits(phone), password });
      router.replace("/verificar-email?novo=1");
      router.refresh();
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-12 flex flex-col gap-6">
      {serverError && <Alert>{serverError}</Alert>}
      <Field
        label="Nome completo"
        icon={IconUser}
        placeholder="Seu nome"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Field
        label="E-mail"
        type="email"
        icon={IconMail}
        placeholder="voce@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, ...field } }) => (
          <Field
            label="Celular"
            type="tel"
            icon={IconDeviceMobile}
            placeholder="(11) 98765-4321"
            autoComplete="tel-national"
            inputMode="numeric"
            error={errors.phone?.message}
            value={formatPhone(value)}
            onChange={(e) => onChange(phoneDigits(e.target.value))}
            {...field}
          />
        )}
      />
      <Field
        label="Senha"
        type="password"
        icon={IconLock}
        placeholder="Mínimo de 8 caracteres"
        autoComplete="new-password"
        error={errors.password?.message}
        footer={<PasswordStrength password={password} />}
        {...register("password")}
      />
      <div>
        <label className="text-muted flex cursor-pointer items-start gap-3 text-lg leading-relaxed">
          <input type="checkbox" className="accent-brand-500 mt-1.5 size-5 shrink-0" {...register("terms")} />
          <span>
            Li e concordo com os{" "}
            <Link href="/termos" target="_blank" className="text-brand-700 font-semibold">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="text-brand-700 font-semibold">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.terms && <p className="text-expense mt-2 text-sm">{errors.terms.message}</p>}
      </div>
      <Button type="submit" block loading={isSubmitting} className="mt-2">
        Criar conta
      </Button>
      <p className="text-muted mt-4 text-center text-xl">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-brand-700 hover:text-brand-800 font-semibold">
          Entrar
        </Link>
      </p>
    </form>
  );
}
