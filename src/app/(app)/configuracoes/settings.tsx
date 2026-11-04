"use client";

import {
  IconChevronRight,
  IconFileText,
  IconLock,
  IconLogout,
  IconMail,
  IconShieldCheck,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert, Card, Skeleton } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/overlay";
import { OtpInput } from "@/components/ui/otp-input";
import { api, ApiError, authApi, errorMessage } from "@/lib/api";
import { maskEmail } from "@/lib/format";
import { isStrongPassword, PASSWORD_ERROR } from "@/lib/password";
import { useProfile, useSubscription } from "@/lib/queries";
import { SUPPORT_EMAIL } from "@/lib/site";
import type { CodeSent, UserProfile } from "@/lib/types";
import { formatCountdown, useCountdown } from "@/lib/use-countdown";

type Tab = "perfil" | "seguranca" | "privacidade";

const TABS: { value: Tab; label: string }[] = [
  { value: "perfil", label: "Perfil" },
  { value: "seguranca", label: "Segurança" },
  { value: "privacidade", label: "Privacidade e dados" },
];

export function Settings() {
  const pathname = usePathname();
  const param = useSearchParams().get("tab");
  const tab: Tab = TABS.some((t) => t.value === param) ? (param as Tab) : "perfil";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Configurações" subtitle="Perfil, segurança e privacidade" />
      <nav aria-label="Seções" className="border-line flex gap-8 overflow-x-auto border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "perfil" ? pathname : `${pathname}?tab=${t.value}`}
            replace
            aria-current={tab === t.value ? "page" : undefined}
            className={clsx(
              "-mb-px border-b-2 px-1 pb-4 text-xl whitespace-nowrap transition-colors",
              tab === t.value
                ? "border-brand-600 text-brand-700 font-semibold"
                : "text-muted hover:text-ink border-transparent",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "perfil" && <ProfileTab />}
      {tab === "seguranca" && <SecurityTab />}
      {tab === "privacidade" && <PrivacyTab />}
    </div>
  );
}

/* ---------------- Perfil ---------------- */

function ProfileTab() {
  const client = useQueryClient();
  const profile = useProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();
  const [changingEmail, setChangingEmail] = useState(false);

  useEffect(() => {
    if (profile.data) setName(profile.data.name);
  }, [profile.data]);

  if (profile.isPending) return <Skeleton className="h-72 max-w-3xl" />;
  if (profile.isError) return <Alert>{errorMessage(profile.error)}</Alert>;

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setMessage({ tone: "error", text: "Informe seu nome completo." });
    setSaving(true);
    setMessage(undefined);
    try {
      // PUT /api/user/update only changes the name; the e-mail must be sent unchanged (it has its own flow).
      await api("api/user/update", { method: "PUT", body: { name: name.trim(), email: profile.data.email } });
      await client.invalidateQueries({ queryKey: ["profile"] });
      setMessage({ tone: "success", text: "Nome atualizado." });
    } catch (err) {
      setMessage({ tone: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-8">
        <h2 className="text-ink text-2xl font-bold">Dados pessoais</h2>
        <form onSubmit={saveName} noValidate className="mt-6 flex flex-col gap-6">
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          <Field
            label="Nome completo"
            icon={IconUser}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={100}
          />
          <div className="flex flex-col gap-2">
            <span className="text-muted text-base font-medium">E-mail</span>
            <div className="border-line flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
              <span className="text-ink flex items-center gap-3 text-lg">
                <IconMail size="1.3rem" className="text-subtle" aria-hidden />
                {profile.data.email}
              </span>
              <Button type="button" variant="link" onClick={() => setChangingEmail(true)}>
                Alterar e-mail
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            loading={saving}
            disabled={name.trim() === profile.data.name}
            className="self-start"
          >
            Salvar alterações
          </Button>
        </form>
      </Card>
      <PlanCard />
      <EmailChangeDialog
        open={changingEmail}
        onClose={() => setChangingEmail(false)}
        current={profile.data.email}
      />
    </div>
  );
}

function PlanCard() {
  const subscription = useSubscription();
  return (
    <Card className="self-start p-8">
      <h2 className="text-ink text-2xl font-bold">Seu plano</h2>
      {subscription.isPending ? (
        <Skeleton className="mt-4 h-10 w-32" />
      ) : (
        <p className="text-ink mt-3 text-3xl font-bold">
          {subscription.data?.isPremium ? "Premium" : "Gratuito"}
        </p>
      )}
      <Link
        href="/assinatura"
        className="text-brand-700 hover:text-brand-800 mt-4 inline-block font-semibold"
      >
        Ver assinatura
      </Link>
    </Card>
  );
}

/**
 * Two steps (API): the current password + new address send a code to the NEW address; the code applies the
 * change. The account keeps the current e-mail until then.
 */
function EmailChangeDialog({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Alterar e-mail" size="sm">
      {open && <EmailChangeForm current={current} onClose={onClose} />}
    </Dialog>
  );
}

function EmailChangeForm({ current, onClose }: { current: string; onClose: () => void }) {
  const client = useQueryClient();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { secondsLeft, start, startUntil } = useCountdown();

  const requestCode = async () => {
    setError(undefined);
    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) return setError("Informe um e-mail válido.");
    if (newEmail.trim().toLowerCase() === current.toLowerCase())
      return setError("O novo e-mail deve ser diferente do atual.");
    if (!password) return setError("Informe sua senha atual.");
    setLoading(true);
    try {
      const sent = await api<CodeSent>("api/user/email-change", {
        method: "POST",
        body: { newEmail: newEmail.trim(), password },
      });
      start(sent.resendAvailableInSeconds || 60);
      setCode("");
      setStep("confirm");
    } catch (err) {
      if (err instanceof ApiError && err.retryAt) startUntil(err.retryAt);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const profile = await api<UserProfile>("api/user/email-change/confirm", {
        method: "POST",
        body: { code },
      });
      client.setQueryData(["profile"], profile);
      onClose();
    } catch (err) {
      setCode("");
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  if (step === "request") {
    return (
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
      >
        <p className="text-muted text-lg">
          Enviaremos um código para o novo e-mail. Até você confirmar, sua conta continua com {current}.
        </p>
        {error && <Alert>{error}</Alert>}
        <Field
          label="Novo e-mail"
          type="email"
          icon={IconMail}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          autoComplete="email"
          autoFocus
        />
        <Field
          label="Senha atual"
          type="password"
          icon={IconLock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button type="submit" block loading={loading}>
          Enviar código
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={confirm} noValidate className="flex flex-col gap-6">
      <p className="text-muted text-lg">
        Digite o código de 6 dígitos enviado para{" "}
        <strong className="text-ink">{maskEmail(newEmail.trim())}</strong>. Ele vale por 15 minutos.
      </p>
      {error && <Alert>{error}</Alert>}
      <OtpInput value={code} onChange={setCode} invalid={Boolean(error)} autoFocus />
      <Button type="submit" block loading={loading} disabled={code.length !== 6}>
        Confirmar novo e-mail
      </Button>
      <p className="text-muted text-center">
        Não recebeu?{" "}
        {secondsLeft > 0 ? (
          <span>Reenviar em {formatCountdown(secondsLeft)}</span>
        ) : (
          <Button type="button" variant="link" onClick={requestCode} disabled={loading}>
            Reenviar código
          </Button>
        )}
      </p>
    </form>
  );
}

/* ---------------- Segurança ---------------- */

function SecurityTab() {
  const router = useRouter();
  const profile = useProfile();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(undefined);
    // Same rules as the API: current required, new = PasswordValidator and different from the current one.
    if (!current) return setMessage({ tone: "error", text: "Informe a senha atual." });
    if (!isStrongPassword(next)) return setMessage({ tone: "error", text: PASSWORD_ERROR });
    if (next === current)
      return setMessage({ tone: "error", text: "A nova senha deve ser diferente da senha atual." });
    if (next !== confirm) return setMessage({ tone: "error", text: "As senhas não coincidem." });
    if (!profile.data) return;

    setSaving(true);
    try {
      await authApi(
        "change-password",
        { email: profile.data.email, password: current, newPassword: next },
        true,
      );
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({
        tone: "success",
        text: "Senha alterada. Os outros aparelhos conectados foram desconectados.",
      });
    } catch (err) {
      setMessage({ tone: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await authApi("logout").catch(() => undefined);
    router.replace("/entrar");
    router.refresh();
  };

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-8">
        <h2 className="text-ink text-2xl font-bold">Alterar senha</h2>
        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-6">
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          <Field
            label="Senha atual"
            type="password"
            icon={IconLock}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
          <Field
            label="Nova senha"
            type="password"
            icon={IconLock}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            footer={<PasswordStrength password={next} />}
          />
          <Field
            label="Confirmar nova senha"
            type="password"
            icon={IconLock}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" loading={saving} className="self-start">
            Alterar senha
          </Button>
        </form>
      </Card>
      <Card className="self-start p-8">
        <h2 className="text-ink text-2xl font-bold">Sessão</h2>
        <p className="text-muted mt-2 text-lg">Sair encerra a sessão neste navegador.</p>
        <Button variant="outline" onClick={logout} className="mt-5">
          <IconLogout size="1.3rem" aria-hidden /> Sair da conta
        </Button>
      </Card>
    </div>
  );
}

/* ---------------- Privacidade e dados ---------------- */

function PrivacyTab() {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="px-6 py-2 sm:px-8">
        <ul>
          <PrivacyRow
            icon={IconFileText}
            title="Termos de Uso"
            description="Leia as regras de uso do MiCash"
            href="/termos"
          />
          <PrivacyRow
            icon={IconShieldCheck}
            title="Política de Privacidade"
            description="Como tratamos seus dados pessoais (LGPD)"
            href="/privacidade"
          />
          <PrivacyRow
            icon={IconTrash}
            title="Excluir minha conta"
            description="Remove permanentemente sua conta e seus dados"
            danger
            onClick={() => setDeleting(true)}
          />
        </ul>
      </Card>
      <Card className="self-start p-8">
        <h2 className="text-ink text-xl font-bold">Contato do encarregado (DPO)</h2>
        <p className="text-ink mt-4 text-lg">Nilton Misael da Costa</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-brand-700 hover:text-brand-800 text-lg font-semibold"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="text-muted mt-3">Responderemos em até 15 dias.</p>
      </Card>
      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} />
    </div>
  );
}

function PrivacyRow({
  icon: RowIcon,
  title,
  description,
  href,
  onClick,
  danger,
}: {
  icon: typeof IconTrash;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <span
        className={clsx(
          "grid size-14 shrink-0 place-items-center rounded-2xl",
          danger ? "bg-expense-soft text-expense" : "bg-brand-100 text-brand-700",
        )}
        aria-hidden
      >
        <RowIcon size="1.5rem" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={clsx("block text-xl font-semibold", danger ? "text-expense" : "text-ink")}>
          {title}
        </span>
        <span className="text-muted block text-base">{description}</span>
      </span>
      <IconChevronRight size="1.3rem" className="text-subtle" aria-hidden />
    </>
  );
  const className =
    "hover:bg-brand-50 -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-5 rounded-2xl px-3 py-5";
  return (
    <li className="border-line border-b last:border-b-0">
      {href ? (
        <Link href={href} target="_blank" className={className}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}

const CONFIRM_WORD = "EXCLUIR";

function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const subscription = useSubscription();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // The API deletes the account without cancelling the Pagar.me subscription: a renewing subscription
  // must be cancelled first, or it would keep charging the card.
  const renewing = Boolean(
    subscription.data?.isPremium && subscription.data.autoRenew && !subscription.data.cancelAtPeriodEnd,
  );

  const remove = async () => {
    setError(undefined);
    setLoading(true);
    try {
      await api("api/user/delete", { method: "DELETE" });
      await authApi("logout").catch(() => undefined);
      router.replace("/entrar");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Excluir minha conta" size="sm">
      {subscription.isPending ? (
        <Skeleton className="h-32" />
      ) : renewing ? (
        <div className="flex flex-col gap-5">
          <Alert tone="info">
            Você tem uma assinatura Premium com renovação automática. Cancele a assinatura antes de excluir a
            conta, para não haver novas cobranças.
          </Alert>
          <Link
            href="/assinatura"
            className="text-brand-700 hover:text-brand-800 self-start text-lg font-semibold"
          >
            Ir para Assinatura
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-muted text-lg leading-relaxed">
            Sua conta e todos os seus dados (transações, categorias, metas e conversas com o Mi) serão
            apagados definitivamente. Essa ação não pode ser desfeita.
          </p>
          <Field
            label={`Para confirmar, digite ${CONFIRM_WORD}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {error && <Alert>{error}</Alert>}
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={remove}
              loading={loading}
              disabled={typed.trim().toUpperCase() !== CONFIRM_WORD}
              className="bg-expense hover:bg-expense/90"
            >
              Excluir conta
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
