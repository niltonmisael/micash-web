"use client";

import { IconLock } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatPercent, monthLabel, shortMonthLabel } from "@/lib/format";
import type { DailySummary, ExpenseCategorySummary } from "@/lib/types";
import type { MonthBar } from "@/lib/summary";
import { cssColor, useTheme } from "@/lib/theme";

/**
 * Chart colors of the current theme. Recharts writes SVG attributes, which ignore var(), so the values are
 * read from the CSS variables and re-read when the theme changes. Bar pairs were validated for CVD.
 */
function useChartColors() {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  return {
    income: cssColor("--mc-income-bar", dark ? "#4aab76" : "#2f7d50"),
    expense: cssColor("--mc-expense-bar", dark ? "#b9553f" : "#e8957f"),
    grid: cssColor("--mc-line", dark ? "#3a312a" : "#f1e6dc"),
    muted: cssColor("--mc-muted", dark ? "#b3a89e" : "#7a716a"),
    cursor: cssColor("--mc-chart-cursor", dark ? "#2a1f17" : "#fef6ef"),
    surface: cssColor("--mc-surface", dark ? "#211b17" : "#ffffff"),
    others: cssColor("--mc-chart-others", dark ? "#6b6058" : "#cfc6bd"),
  };
}

type Row = {
  key: string;
  label: string;
  title: string;
  income: number | null;
  expense: number | null;
  locked: boolean;
};

function TooltipBox({
  title,
  lines,
}: {
  title: string;
  lines: { color: string; label: string; value: string }[];
}) {
  return (
    <div className="border-line bg-surface rounded-xl border px-4 py-3 shadow-lg">
      <p className="text-ink font-semibold">{title}</p>
      {lines.map((line) => (
        <p key={line.label} className="text-muted mt-1 flex items-center gap-2 text-sm">
          <span className="size-2.5 rounded-sm" style={{ background: line.color }} aria-hidden />
          {line.label}: <span className="text-ink font-medium">{line.value}</span>
        </p>
      ))}
    </div>
  );
}

/** Income × expenses of the last 6 months. Months blocked by the plan show a lock instead of bars. */
export function IncomeExpenseChart({ months }: { months: MonthBar[] }) {
  const c = useChartColors();
  const rows: Row[] = months.map((m) => ({
    key: `${m.year}-${m.month}`,
    label: shortMonthLabel(m),
    title: monthLabel(m),
    income: m.summary?.totalIncome ?? null,
    expense: m.summary?.totalExpense ?? null,
    locked: m.locked,
  }));
  const lockedCount = rows.filter((r) => r.locked).length;

  return (
    <figure>
      <div className="mb-2 flex justify-end gap-5 text-sm" aria-hidden>
        <span className="text-muted flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: c.income }} /> Receitas
        </span>
        <span className="text-muted flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: c.expense }} /> Despesas
        </span>
      </div>
      <div className="h-72" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            barGap={2}
            barCategoryGap="28%"
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={c.grid} />
            <YAxis
              width={56}
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${new Intl.NumberFormat("pt-BR").format(v / 1000)} mil` : String(v)
              }
            />
            <XAxis
              dataKey="key"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const row = rows.find((r) => r.key === payload.value);
                return (
                  <g transform={`translate(${x},${Number(y) + 14})`}>
                    <text textAnchor="middle" fill={c.muted} fontSize={14}>
                      {row?.locked ? "🔒 " : ""}
                      {row?.label}
                    </text>
                  </g>
                );
              }}
            />
            <Tooltip
              cursor={{ fill: c.cursor }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Row | undefined;
                if (!active || !row) return null;
                if (row.locked)
                  return (
                    <TooltipBox
                      title={row.title}
                      lines={[{ color: c.grid, label: "Histórico", value: "no Premium" }]}
                    />
                  );
                return (
                  <TooltipBox
                    title={row.title}
                    lines={[
                      { color: c.income, label: "Receitas", value: formatMoney(row.income ?? 0) },
                      { color: c.expense, label: "Despesas", value: formatMoney(row.expense ?? 0) },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="income" name="Receitas" fill={c.income} radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="expense" name="Despesas" fill={c.expense} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {lockedCount > 0 && (
        <p className="text-muted mt-3 flex items-center gap-2 text-sm">
          <IconLock size="1rem" aria-hidden /> Meses anteriores ficam disponíveis no Premium.
        </p>
      )}
      {/* Same data as a table for screen readers (the chart is aria-hidden). */}
      <table className="sr-only">
        <caption>Receitas e despesas por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Receitas</th>
            <th scope="col">Despesas</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.title}</th>
              <td>{row.locked ? "Disponível no Premium" : formatMoney(row.income ?? 0)}</td>
              <td>{row.locked ? "Disponível no Premium" : formatMoney(row.expense ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const FALLBACK_COLORS = ["#c9674e", "#f58a3c", "#e8a23c", "#4e9e6d", "#5b8ec4", "#9a7bc0"];
const MAX_SLICES = 5;

/** Top categories + "Outros". Colors come from the user's own categories. */
export function CategoryDonut({ data, total }: { data: ExpenseCategorySummary[]; total: number }) {
  const c = useChartColors();
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const top = sorted.slice(0, sorted.length > MAX_SLICES ? MAX_SLICES - 1 : MAX_SLICES);
  const rest = sorted.slice(top.length);
  const slices = [
    ...top.map((c, i) => ({
      name: c.categoryName,
      amount: c.amount,
      percentage: c.percentage,
      color: c.categoryColor || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    })),
    ...(rest.length
      ? [
          {
            name: "Outros",
            amount: rest.reduce((sum, c) => sum + c.amount, 0),
            percentage: rest.reduce((sum, c) => sum + c.percentage, 0),
            color: c.others,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div className="relative size-64 shrink-0" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke={c.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const slice = payload?.[0]?.payload as (typeof slices)[number] | undefined;
                if (!active || !slice) return null;
                return (
                  <TooltipBox
                    title={slice.name}
                    lines={[
                      {
                        color: slice.color,
                        label: formatPercent(slice.percentage),
                        value: formatMoney(slice.amount),
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-muted">Despesas</span>
          <span className="text-ink text-2xl font-bold">{formatMoney(total, { cents: false })}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-4" aria-label="Despesas por categoria">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center gap-3 text-lg">
            <span className="size-3.5 shrink-0 rounded" style={{ background: s.color }} aria-hidden />
            <span className="text-ink flex-1 truncate">{s.name}</span>
            <span className="text-ink font-semibold tabular-nums">
              {formatPercent(Math.round(s.percentage))}
            </span>
            <span className="sr-only">, {formatMoney(s.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const axisMoney = (v: number) =>
  v >= 1000 ? `${new Intl.NumberFormat("pt-BR").format(v / 1000)} mil` : String(v);

/** Income × expenses per day of one month (reports, single-month periods). */
export function DailyIncomeExpenseChart({ summary, title }: { summary: DailySummary; title: string }) {
  const c = useChartColors();
  const rows = summary.days.map((d) => ({ ...d, label: String(d.day) }));
  return (
    <figure>
      <div className="mb-2 flex justify-end gap-5 text-sm" aria-hidden>
        <span className="text-muted flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: c.income }} /> Receitas
        </span>
        <span className="text-muted flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: c.expense }} /> Despesas
        </span>
      </div>
      <div className="h-80" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            barGap={1}
            barCategoryGap="18%"
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={c.grid} />
            <YAxis
              width={56}
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
              tickFormatter={axisMoney}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: c.muted, fontSize: 12 }}
              tickFormatter={(day: string) => (Number(day) === 1 || Number(day) % 5 === 0 ? day : "")}
            />
            <Tooltip
              cursor={{ fill: c.cursor }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as (typeof rows)[number] | undefined;
                if (!active || !row) return null;
                return (
                  <TooltipBox
                    title={`Dia ${row.day}`}
                    lines={[
                      { color: c.income, label: "Receitas", value: formatMoney(row.income) },
                      { color: c.expense, label: "Despesas", value: formatMoney(row.expense) },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="income" name="Receitas" fill={c.income} radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="expense" name="Despesas" fill={c.expense} radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{title}: receitas e despesas por dia</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Receitas</th>
            <th scope="col">Despesas</th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter((r) => r.income > 0 || r.expense > 0)
            .map((r) => (
              <tr key={r.day}>
                <th scope="row">{r.day}</th>
                <td>{formatMoney(r.income)}</td>
                <td>{formatMoney(r.expense)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
