"use client";

import {
  IconArrowLeft,
  IconLock,
  IconLockQuestion,
  IconMail,
  IconMailCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { CenteredAuthLayout } from "@/components/auth/auth-layouts";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { Alert } from "@/components/ui/misc";
import { api, ApiError, errorMessage } from "@/lib/api";
import { maskEmail } from "@/lib/format";
import { isStrongPassword, PASSWORD_ERROR } from "@/lib/password";
import type { ForgotPasswordSent, PasswordResetCodeVerified } from "@/lib/types";
import { formatCountdown, useCountdown } from "@/lib/use-countdown";

type Step = "email" | "code" | "password" | "done";
const CODE_LENGTH = 6;

/**
 * The API resets by CODE, not by link (the prototype says "link"):
 * forgot-password → verify-password-reset-code (returns a single-use resetToken) → reset-password.
 */
export function PasswordReset() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { secondsLeft, start, startUntil } = useCountdown();

  const run = async (action: () => Promise<void>) => {
    setError(undefined);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      if (err instanceof ApiError && err.retryAt) startUntil(err.retryAt);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (isResend = false) =>
    run(async () => {
      // Same 202 answer whether or not the address has an account (no account enumeration).
      const sent = await api<ForgotPasswordSent>("forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });
      start(sent?.resendAvailableInSeconds || 60);
      setCode("");
      setNotice(isResend ? "Enviamos um novo código." : undefined);
      setStep("code");
    });

  if (step === "email") {
    return (
      <CenteredAuthLayout
        icon={IconLockQuestion}
        title="Esqueceu a senha?"
        description="Informe o e-mail da sua conta e enviaremos um código para criar uma nova senha."
      >
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Informe um e-mail válido.");
            sendCode();
          }}
        >
          {error && <Alert>{error}</Alert>}
          <Field
            label="E-mail"
            type="email"
            icon={IconMail}
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit" block loading={loading}>
            Enviar código de recuperação
          </Button>
          <BackToLogin />
        </form>
      </CenteredAuthLayout>
    );
  }

  if (step === "code") {
    return (
      <CenteredAuthLayout
        icon={IconMailCheck}
        title="Digite o código"
        description={
          <>
            Se existir uma conta com{" "}
            <strong className="text-ink font-semibold">{maskEmail(email.trim())}</strong>, enviamos um código
            de 6 dígitos. Ele vale por 15 minutos.
          </>
        }
      >
        <form
          noValidate
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const verified = await api<PasswordResetCodeVerified>("verify-password-reset-code", {
                method: "POST",
                body: { email: email.trim(), code },
              });
              setResetToken(verified.resetToken);
              setStep("password");
            });
          }}
        >
          {error && <Alert>{error}</Alert>}
          {notice && !error && <Alert tone="success">{notice}</Alert>}
          <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} invalid={Boolean(error)} autoFocus />
          <Button type="submit" block loading={loading} disabled={code.length !== CODE_LENGTH}>
            Continuar
          </Button>
          <div className="text-muted flex flex-col items-center gap-3 text-lg">
            <p>
              Não recebeu?{" "}
              {secondsLeft > 0 ? (
                <span>
                  <span className="text-brand-700 font-semibold">Reenviar código</span> em{" "}
                  {formatCountdown(secondsLeft)}
                </span>
              ) : (
                <Button type="button" variant="link" onClick={() => sendCode(true)} disabled={loading}>
                  Reenviar código
                </Button>
              )}
            </p>
            <Button type="button" variant="link" onClick={() => setStep("email")}>
              Usar outro e-mail
            </Button>
          </div>
        </form>
      </CenteredAuthLayout>
    );
  }

  if (step === "password") {
    return (
      <CenteredAuthLayout
        icon={IconLock}
        title="Crie uma nova senha"
        description="Ela substitui a senha antiga."
      >
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isStrongPassword(password)) return setError(PASSWORD_ERROR);
            run(async () => {
              await api("reset-password", { method: "POST", body: { resetToken, newPassword: password } });
              setStep("done");
            });
          }}
        >
          {error && <Alert>{error}</Alert>}
          <Field
            label="Nova senha"
            type="password"
            icon={IconLock}
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            footer={<PasswordStrength password={password} />}
            autoFocus
          />
          <Button type="submit" block loading={loading}>
            Salvar nova senha
          </Button>
          {error && (
            <Button
              type="button"
              variant="link"
              className="self-center text-lg"
              onClick={() => setStep("email")}
            >
              Solicitar novo código
            </Button>
          )}
        </form>
      </CenteredAuthLayout>
    );
  }

  return (
    <CenteredAuthLayout
      icon={IconShieldCheck}
      title="Senha alterada"
      description="Sua senha foi redefinida. Por segurança, as sessões abertas em outros aparelhos serão encerradas."
    >
      <ButtonLink href="/entrar" block>
        Entrar com a nova senha
      </ButtonLink>
    </CenteredAuthLayout>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/entrar"
      className="text-brand-700 hover:text-brand-800 flex items-center justify-center gap-2 text-xl font-semibold"
    >
      <IconArrowLeft size="1.25rem" aria-hidden />
      Voltar para o login
    </Link>
  );
}
