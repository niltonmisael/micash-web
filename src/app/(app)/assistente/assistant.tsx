"use client";

import { IconMessagePlus, IconSend, IconSparkles } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { ActionError, PremiumLink } from "@/components/app/premium-notice";
import { RichText } from "@/components/app/rich-text";
import { Button } from "@/components/ui/button";
import { Alert, Card, ProgressBar, Skeleton } from "@/components/ui/misc";
import { errorMessage } from "@/lib/api";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  getChatHistory,
  sendChatMessage,
  startConversation,
  type ChatMessage,
} from "@/lib/assistant";
import { currentYearMonth, firstName } from "@/lib/format";
import { useSavingsGoals } from "@/lib/goals";
import { usePlanLimits, useProfile } from "@/lib/queries";
import { useInsights } from "../dashboard/use-dashboard";

export function Assistant() {
  const client = useQueryClient();
  const profile = useProfile();
  const plan = usePlanLimits();
  const goals = useSavingsGoals();
  const history = useQuery({
    queryKey: ["chat", "history"],
    queryFn: () => getChatHistory(),
    staleTime: Infinity,
  });

  // Local copy: grows with sent/received messages and older pages without refetching everything.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<unknown>();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    if (!history.data) return;
    setMessages(history.data.messages);
    setHasMore(history.data.hasMore);
  }, [history.data]);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages, sending]);

  const send = async (question: string) => {
    const message = question.trim();
    if (!message || sending) return;
    setSendError(undefined);
    setSending(true);
    setText("");
    stickToBottom.current = true;
    const pending: ChatMessage = {
      id: -Date.now(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, pending]);

    try {
      const answer = await sendChatMessage(message);
      setMessages((current) => [
        ...current.filter((m) => m.id !== pending.id),
        { ...pending, id: answer.userMessageId },
        { id: answer.id, role: "assistant", content: answer.message, createdAt: answer.createdAt },
      ]);
      // Coming back to the page reloads the history; this screen keeps its local copy.
      client.invalidateQueries({ queryKey: ["chat", "history"], refetchType: "none" });
    } catch (err) {
      // Not sent: drop the bubble and give the text back to the input.
      setMessages((current) => current.filter((m) => m.id !== pending.id));
      setText(message);
      setSendError(err);
    } finally {
      setSending(false);
      client.invalidateQueries({ queryKey: ["subscription", "limits"] });
      inputRef.current?.focus();
    }
  };

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    stickToBottom.current = false;
    try {
      const older = await getChatHistory(messages[0].id);
      setMessages((current) => [...older.messages, ...current]);
      setHasMore(older.hasMore);
    } catch (err) {
      setSendError(err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const newConversation = async () => {
    setSendError(undefined);
    try {
      await startConversation();
      setMessages([]);
      setHasMore(false);
      client.invalidateQueries({ queryKey: ["chat", "history"], refetchType: "none" });
      inputRef.current?.focus();
    } catch (err) {
      setSendError(err);
    }
  };

  const chat = plan.data?.chat;
  const goal = goals.data?.find((g) => !g.isCompleted);
  const suggestions = [
    "Resumo do mês",
    "Maiores despesas da semana",
    "Onde posso economizar?",
    ...(goal ? [`Quanto falta para a meta ${goal.name}?`] : []),
  ];
  const outOfQuestions = chat !== undefined && chat.remaining <= 0;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Mi Assistente"
        subtitle="Converse com suas finanças"
        actions={
          messages.length > 0 && (
            <Button variant="outline" onClick={newConversation} disabled={sending} className="h-12">
              <IconMessagePlus size="1.3rem" aria-hidden /> Nova conversa
            </Button>
          )
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card className="flex h-[calc(100dvh-12rem)] min-h-[32rem] flex-col">
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-5 py-6 sm:px-10"
            onScroll={(e) => {
              const el = e.currentTarget;
              stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
          >
            {history.isPending ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="ml-auto h-12 w-2/3" />
                <Skeleton className="h-24 w-3/4" />
              </div>
            ) : history.isError ? (
              <Alert>{errorMessage(history.error)}</Alert>
            ) : messages.length === 0 && !sending ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <span className="bg-brand-100 text-brand-700 grid size-12 place-items-center rounded-2xl">
                  <IconSparkles size="2rem" aria-hidden />
                </span>
                <p className="text-ink text-xl font-bold">
                  Oi{firstName(profile.data?.name) ? `, ${firstName(profile.data?.name)}` : ""}! Como posso
                  ajudar?
                </p>
                <p className="text-muted max-w-md text-base">
                  Pergunte sobre seus gastos, receitas e metas. O Mi analisa seus lançamentos e responde sem
                  jargão.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.slice(0, 3).map((s) => (
                    <SuggestionChip key={s} text={s} onPick={send} disabled={sending || outOfQuestions} />
                  ))}
                </div>
              </div>
            ) : (
              <ol className="flex flex-col gap-5" aria-label="Conversa com o Mi">
                {hasMore && (
                  <li className="self-center">
                    <Button variant="link" onClick={loadOlder} disabled={loadingOlder}>
                      {loadingOlder ? "Carregando..." : "Ver mensagens anteriores"}
                    </Button>
                  </li>
                )}
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {sending && (
                  <li className="flex items-start gap-3" aria-live="polite">
                    <MiAvatar />
                    <span className="bg-brand-50 text-muted rounded-2xl px-5 py-4">
                      <span className="sr-only">O Mi está escrevendo</span>
                      <span aria-hidden className="inline-flex gap-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce [animation-delay:150ms]">•</span>
                        <span className="animate-bounce [animation-delay:300ms]">•</span>
                      </span>
                    </span>
                  </li>
                )}
              </ol>
            )}
          </div>

          <form
            className="border-line flex flex-col gap-3 border-t px-5 py-5 sm:px-8"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <ActionError error={sendError} />
            <div className="flex items-end gap-3">
              <label className="border-line focus-within:border-brand-500 focus-within:ring-brand-100 bg-surface flex flex-1 rounded-2xl border px-5 py-3 focus-within:ring-4">
                <span className="sr-only">Pergunta para o Mi</span>
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter sends; Shift+Enter breaks the line.
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(text);
                    }
                  }}
                  rows={1}
                  maxLength={CHAT_MESSAGE_MAX_LENGTH}
                  placeholder={
                    outOfQuestions
                      ? "Você usou todas as perguntas do período"
                      : "Pergunte sobre suas finanças..."
                  }
                  disabled={sending}
                  className="text-ink placeholder:text-subtle max-h-40 min-h-8 w-full resize-none bg-transparent text-base leading-8 outline-none focus-visible:outline-none"
                />
              </label>
              <Button
                type="submit"
                loading={sending}
                disabled={!text.trim()}
                className="w-16 px-0"
                aria-label="Enviar"
              >
                {!sending && <IconSend size="1.4rem" aria-hidden />}
              </Button>
            </div>
            {text.length > CHAT_MESSAGE_MAX_LENGTH * 0.9 && (
              <p className="text-muted text-sm">
                {text.length}/{CHAT_MESSAGE_MAX_LENGTH} caracteres
              </p>
            )}
          </form>
        </Card>

        <aside className="flex flex-col gap-6">
          {chat && (
            <Card className="p-7">
              <p className="text-muted text-base">
                {chat.period === "day" ? "Perguntas hoje" : "Perguntas este mês"}
              </p>
              <p className="text-ink mt-1 text-base">
                <span className="text-2xl font-bold">{chat.used}</span> de {chat.limit}
              </p>
              <ProgressBar
                value={chat.limit ? (chat.used / chat.limit) * 100 : 0}
                className="mt-4"
                label="Perguntas usadas"
              />
              {plan.data?.isPremium ? (
                <p className="text-muted mt-4">Até {chat.perMinute ?? 5} perguntas por minuto.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-muted">No Premium você tem até 30 perguntas por dia.</p>
                  <PremiumLink />
                </div>
              )}
            </Card>
          )}

          <Card className="p-7">
            <h2 className="text-ink text-lg font-bold">Sugestões</h2>
            <div className="mt-4 flex flex-col gap-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={sending || outOfQuestions}
                  className="border-line text-ink hover:border-brand-500 hover:bg-brand-50 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <TipsCard />

          <p className="text-muted px-2">O Mi pode errar e não substitui um consultor financeiro.</p>
        </aside>
      </div>
    </div>
  );
}

function MiAvatar() {
  return (
    <span
      className="bg-brand-100 text-brand-700 grid size-11 shrink-0 place-items-center rounded-xl"
      aria-hidden
    >
      <IconSparkles size="1.3rem" />
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <li className="flex justify-end">
        <p className="bg-brand-600 max-w-[80%] rounded-2xl rounded-br-md px-5 py-3.5 text-base whitespace-pre-wrap text-white">
          <span className="sr-only">Você: </span>
          {message.content}
        </p>
      </li>
    );
  }
  return (
    <li className="flex items-start gap-3">
      <MiAvatar />
      <div className="bg-brand-50 text-ink max-w-[85%] rounded-2xl rounded-tl-md px-5 py-4 text-base leading-relaxed">
        <span className="sr-only">Mi: </span>
        <RichText text={message.content} />
      </div>
    </li>
  );
}

function SuggestionChip({
  text,
  onPick,
  disabled,
}: {
  text: string;
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(text)}
      disabled={disabled}
      className="border-line bg-surface text-ink hover:border-brand-500 hover:text-brand-700 rounded-full border px-4 py-2 text-[0.95rem] font-medium transition-colors disabled:opacity-50"
    >
      {text}
    </button>
  );
}

/** Tips of the month (FinancialInsights). Free gets a preview: first tip, the rest locked. */
function TipsCard() {
  const insights = useInsights(currentYearMonth());
  const data = insights.data;
  const tips = data?.insights ?? [];

  if (insights.isPending) return <Skeleton className="h-40" />;
  if (insights.isError || (tips.length === 0 && !data?.artificialInsight)) return null;

  return (
    <Card className="p-7">
      <h2 className="text-ink text-lg font-bold">Dicas do mês</h2>
      {data?.artificialInsight && (
        <div className="bg-brand-50 mt-4 rounded-2xl p-4">
          <p className="text-ink font-semibold">{data.artificialInsight.title}</p>
          <p className="text-muted mt-1">{data.artificialInsight.message}</p>
        </div>
      )}
      <ul className="mt-4 flex flex-col gap-4">
        {tips.map((tip, i) => (
          <li key={i} className={clsx(i > 0 && "border-line border-t pt-4")}>
            <p className="text-ink font-semibold">{tip.title}</p>
            <p className="text-muted mt-1">{tip.message}</p>
          </li>
        ))}
      </ul>
      {data?.isPreview && data.lockedInsightsCount > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-muted">
            +{data.lockedInsightsCount} {data.lockedInsightsCount === 1 ? "dica" : "dicas"} e a análise
            completa no Premium.
          </p>
          <PremiumLink />
        </div>
      )}
    </Card>
  );
}
