"use client";

import { IconMail, IconMailCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CenteredAuthLayout } from "@/components/auth/auth-layouts";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { Alert } from "@/components/ui/misc";
import { api, ApiError, authApi, errorMessage } from "@/lib/api";
import { maskEmail } from "@/lib/format";
import type { CodeSent, UserProfile } from "@/lib/types";
import { formatCountdown, useCountdown } from "@/lib/use-countdown";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export function VerifyEmail() {
  const router = useRouter();
  // Right after sign-up the API has just sent a code, so resending waits the same 60s it enforces.
  const justRegistered = useSearchParams().get("novo") === "1";
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => api<UserProfile>("api/user/profile") });

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const { secondsLeft, start, startUntil } = useCountdown(justRegistered ? RESEND_SECONDS : 0);

  const handleRateLimit = (err: unknown) => {
    if (err instanceof ApiError && err.retryAt) startUntil(err.retryAt);
    setError(errorMessage(err));
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setError(`Digite os ${CODE_LENGTH} dígitos do código.`);
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await authApi("verify-email", { code }, true);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setCode("");
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(undefined);
    setNotice(undefined);
    setResending(true);
    try {
      const sent = await api<CodeSent>("resend-email-verification-code", { method: "POST" });
      start(sent.resendAvailableInSeconds || RESEND_SECONDS);
      setNotice("Enviamos um novo código. Confira sua caixa de entrada e o spam.");
    } catch (err) {
      handleRateLimit(err);
    } finally {
      setResending(false);
    }
  };

  const email = profile.data?.email;

  return (
    <CenteredAuthLayout
      icon={IconMailCheck}
      title="Verifique seu e-mail"
      description={
        <>
          Enviamos um código de 6 dígitos para{" "}
          <strong className="text-ink font-semibold">{email ? maskEmail(email) : "seu e-mail"}</strong>. Ele
          vale por 15 minutos.
        </>
      }
    >
      {editingEmail ? (
        <ChangeEmailForm
          current={email}
          onCancel={() => setEditingEmail(false)}
          onChanged={(sent) => {
            profile.refetch();
            setEditingEmail(false);
            setCode("");
            setError(undefined);
            start(sent.resendAvailableInSeconds || RESEND_SECONDS);
            setNotice(`Enviamos um novo código para ${maskEmail(sent.email)}.`);
          }}
          onRateLimited={handleRateLimit}
        />
      ) : (
        <form onSubmit={confirm} noValidate className="flex flex-col gap-8">
          {error && <Alert>{error}</Alert>}
          {notice && !error && <Alert tone="success">{notice}</Alert>}
          <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} invalid={Boolean(error)} autoFocus />
          <Button type="submit" block loading={submitting} disabled={code.length !== CODE_LENGTH}>
            Confirmar e-mail
          </Button>
          <div className="text-muted flex flex-col items-center gap-3 text-base">
            <p>
              Não recebeu?{" "}
              {secondsLeft > 0 ? (
                <span>
                  <span className="text-brand-700 font-semibold">Reenviar código</span> em{" "}
                  {formatCountdown(secondsLeft)}
                </span>
              ) : (
                <Button type="button" variant="link" onClick={resend} disabled={resending}>
                  Reenviar código
                </Button>
              )}
            </p>
            <p className="text-base">
              E-mail errado?{" "}
              <Button type="button" variant="link" onClick={() => setEditingEmail(true)}>
                Corrigir e-mail
              </Button>
              {" · "}
              <Button
                type="button"
                variant="link"
                onClick={async () => {
                  await authApi("logout").catch(() => undefined);
                  router.replace("/entrar");
                  router.refresh();
                }}
              >
                Sair
              </Button>
            </p>
          </div>
        </form>
      )}
    </CenteredAuthLayout>
  );
}

function ChangeEmailForm({
  current,
  onCancel,
  onChanged,
  onRateLimited,
}: {
  current?: string;
  onCancel: () => void;
  onChanged: (sent: CodeSent) => void;
  onRateLimited: (error: unknown) => void;
}) {
  const [email, setEmail] = useState(current ?? "");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSaving(true);
    try {
      onChanged(
        await api<CodeSent>("email-verification/email", { method: "PUT", body: { email: email.trim() } }),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) onRateLimited(err);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {error && <Alert>{error}</Alert>}
      <Field
        label="E-mail correto"
        type="email"
        icon={IconMail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        autoFocus
      />
      <Button type="submit" block loading={saving}>
        Enviar código para este e-mail
      </Button>
      <Button type="button" variant="link" onClick={onCancel} className="self-center text-base">
        Voltar
      </Button>
    </form>
  );
}
