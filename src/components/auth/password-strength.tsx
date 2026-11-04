import { IconCheck } from "@tabler/icons-react";
import clsx from "clsx";
import { PASSWORD_RULES, passwordScore } from "@/lib/password";

const SEGMENTS = 4;

/** Four-segment bar from the prototype plus the checklist of the API's rules. */
export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const filled = Math.round((score / PASSWORD_RULES.length) * SEGMENTS);
  const color = score === PASSWORD_RULES.length ? "bg-income" : score >= 3 ? "bg-warning" : "bg-expense";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2" aria-hidden>
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={clsx("h-1.5 rounded-full", password && i < filled ? color : "bg-line")} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Requisitos da senha">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.label}
              className={clsx("flex items-center gap-1", ok ? "text-income" : "text-subtle")}
            >
              <IconCheck size="0.875rem" aria-hidden className={ok ? "" : "opacity-40"} />
              {rule.label}
              <span className="sr-only">{ok ? "(atendido)" : "(pendente)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
