import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Demo } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const OUTCOME_TONE = {
  gelukt: "danger",
  geblokkeerd: "success",
  gedeeltelijk: "warn",
  theoretisch: "info",
} as const;

const ACTOR_TONE: Record<string, string> = {
  aanvaller: "text-danger",
  slachtoffer: "text-warn",
  proxy: "text-info",
  idp: "text-success",
  apparaat: "text-accent",
  lab: "text-muted",
};

export function AttackSim({ demo }: { demo: Demo }) {
  const [i, setI] = useState(0);
  const step = demo.steps[i];
  const done = i === demo.steps.length - 1;

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Lab-demo
          </p>
          <h2 className="mt-1 font-display text-2xl">Aanval, stap voor stap</h2>
        </div>
        <Badge tone={OUTCOME_TONE[demo.outcome]}>{demo.outcome}</Badge>
      </div>

      <p className="text-sm leading-relaxed text-muted">{demo.start}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {demo.tools.map((t) => (
          <li key={t}>
            <span className="rounded-full bg-raised px-2.5 py-1 font-mono text-[11px] text-muted">
              {t}
            </span>
          </li>
        ))}
      </ul>

      <ol className="mt-6 flex gap-1">
        {demo.steps.map((s, idx) => (
          <li key={s.n} className="flex-1">
            <button
              type="button"
              onClick={() => setI(idx)}
              className={cn(
                "h-1.5 w-full rounded-full transition-colors duration-150",
                idx <= i ? "bg-accent" : "bg-raised",
              )}
              aria-label={`Stap ${s.n}`}
            />
          </li>
        ))}
      </ol>

      {step ? (
        <div className="mt-5 rounded-lg bg-inset p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-subtle">
              Stap {step.n} / {demo.steps.length}
            </p>
            <p className={cn("font-mono text-[11px] uppercase", ACTOR_TONE[step.actor])}>
              {step.actor}
            </p>
          </div>
          <h3 className="text-lg font-medium">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          {step.terminal ? (
            <pre className="mt-4 overflow-x-auto rounded-md bg-bg p-3 font-mono text-xs leading-relaxed text-accent">
              {step.terminal}
            </pre>
          ) : null}
          {step.note ? (
            <p className="mt-3 text-xs text-subtle">{step.note}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
        >
          <ChevronLeft className="size-4" />
          Vorige
        </Button>
        <Button
          size="sm"
          onClick={() => setI((v) => Math.min(demo.steps.length - 1, v + 1))}
          disabled={done}
        >
          Volgende
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setI(0)}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      {done ? (
        <div
          className={cn(
            "mt-5 rounded-lg p-4 text-sm leading-relaxed",
            demo.outcome === "gelukt" && "bg-danger-dim text-fg",
            demo.outcome === "geblokkeerd" && "bg-success-dim text-fg",
            demo.outcome === "gedeeltelijk" && "bg-warn-dim text-fg",
            demo.outcome === "theoretisch" && "bg-info-dim text-fg",
          )}
        >
          <p className="font-medium">Bevinding</p>
          <p className="mt-1 text-muted">{demo.result}</p>
          {demo.blockers ? (
            <p className="mt-2 text-xs text-muted">Geblokkeerd door: {demo.blockers}</p>
          ) : null}
          {demo.theory ? (
            <p className="mt-2 text-xs text-subtle">{demo.theory}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
