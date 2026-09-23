import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { MFA_METHODS } from "@/lib/data/mfa";
import { cn } from "@/lib/utils";

const TONE = {
  phishable: "danger",
  "phishing-resistant": "success",
  hybride: "warn",
} as const;

export const Route = createFileRoute("/mfa/")({ component: MfaIndex });

function MfaIndex() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="03"
        title="MFA-methoden"
        lede="Negen methoden, één AiTM-proxy, één scoremodel. Per methode: theorie, workaround, stapsgewijze demo, wat verdediging blokkeert, quantum, en minstens een pagina motivatie."
      />
      <div className="mt-10 grid gap-3">
        {MFA_METHODS.map((m) => (
          <Link
            key={m.id}
            to="/mfa/$id"
            params={{ id: m.id }}
            className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)] sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-subtle">{m.code}</span>
                <Badge tone={TONE[m.category]}>{m.category}</Badge>
              </div>
              <h2 className="mt-1 font-display text-2xl">{m.name}</h2>
              <p className="mt-1 text-sm text-muted">{m.primaryFinding}</p>
            </div>
            <div className="flex items-baseline gap-2 sm:flex-col sm:items-end">
              <span
                className={cn(
                  "font-display text-3xl tabular-nums",
                  m.score.totaal >= 7 && "text-success",
                  m.score.totaal < 4 && "text-danger",
                )}
              >
                {m.score.totaal.toFixed(1)}
              </span>
              <span className="text-xs text-subtle">/ 10</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
