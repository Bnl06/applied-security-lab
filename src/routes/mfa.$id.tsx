import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AttackSim } from "@/components/attack-sim";
import { PageHeader } from "@/components/page-header";
import { ScoreBar } from "@/components/score-bar";
import { Badge } from "@/components/ui/badge";
import { mfaById, MFA_METHODS } from "@/lib/data/mfa";

export const Route = createFileRoute("/mfa/$id")({ component: MfaDetail });

function MfaDetail() {
  const { id } = Route.useParams();
  const m = mfaById(id);
  if (!m) throw notFound();
  const idx = MFA_METHODS.findIndex((x) => x.id === m.id);
  const prev = MFA_METHODS[idx - 1];
  const next = MFA_METHODS[idx + 1];

  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader code={m.code} title={m.name} lede={m.summary} badge={m.aka} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="font-display text-2xl">Theoretische onderbouwing</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
              {m.theory.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Aanvalsvectoren</h2>
            <div className="mt-4 space-y-3">
              {m.attacks.map((a) => (
                <article key={a.title} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
                </article>
              ))}
            </div>
          </section>

          <AttackSim demo={m.demo} />

          <section>
            <h2 className="font-display text-2xl">Verdediging versus deze methode</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-success-dim p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-success">Blokkeert</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {m.defenses.blocks.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-danger-dim p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-danger">Faalt nog</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {m.defenses.fails.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Quantumbestendigheid</h2>
            <Badge tone="warn" className="mt-3">
              {m.quantum}
            </Badge>
            <p className="mt-3 text-sm leading-relaxed text-muted">{m.quantumNote}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Motivatie van de score</h2>
            <p className="mt-2 text-sm text-muted">
              Minimaal de gevraagde pagina-onderbouwing: vijf assen, niet alleen de demo.
            </p>
            <ul className="mt-4 space-y-3">
              {m.motivation.map((x) => (
                <li key={x} className="text-sm leading-relaxed text-muted">
                  {x}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ScoreBar scores={m.score} />
          <p className="mt-4 text-sm leading-relaxed text-muted">{m.primaryFinding}</p>
        </aside>
      </div>

      <nav className="mt-14 flex justify-between gap-4 text-sm" aria-label="MFA-navigatie">
        {prev ? (
          <Link to="/mfa/$id" params={{ id: prev.id }} className="text-muted hover:text-fg">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/mfa/$id" params={{ id: next.id }} className="text-muted hover:text-fg">
            {next.name} →
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
