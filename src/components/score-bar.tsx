import { cn } from "@/lib/utils";
import type { ScoreBreakdown } from "@/lib/data/types";

const ROWS: { key: keyof Omit<ScoreBreakdown, "totaal">; label: string }[] = [
  { key: "phishing", label: "Phishing" },
  { key: "token", label: "Token" },
  { key: "binding", label: "Binding" },
  { key: "quantum", label: "Quantum" },
  { key: "operationeel", label: "Operationeel" },
];

export function ScoreBar({ scores }: { scores: ScoreBreakdown }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Weighted score
          </p>
          <p className="mt-1 font-display text-4xl tabular-nums tracking-tight">
            {scores.totaal.toFixed(1)}
            <span className="text-xl text-subtle"> / 10</span>
          </p>
        </div>
        <p className="max-w-[14rem] text-right text-xs leading-relaxed text-subtle">
          30% phishing · 25% token · 20% binding · 15% quantum · 10% operationeel
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {ROWS.map((r) => {
          const value = scores[r.key];
          return (
            <li key={r.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">{r.label}</span>
                <span className="tabular-nums text-fg">{value.toFixed(0)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className={cn(
                    "h-full rounded-full",
                    value >= 7 ? "bg-success" : value >= 4 ? "bg-warn" : "bg-danger",
                  )}
                  style={{ width: `${value * 10}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
