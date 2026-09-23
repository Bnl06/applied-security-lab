import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { protocolById, PROTOCOLS } from "@/lib/data/protocols";

export const Route = createFileRoute("/protocollen/$id")({
  component: ProtocolDetail,
});

function ProtocolDetail() {
  const { id } = Route.useParams();
  const p = protocolById(id);
  if (!p) throw notFound();
  const idx = PROTOCOLS.findIndex((x) => x.id === p.id);
  const prev = PROTOCOLS[idx - 1];
  const next = PROTOCOLS[idx + 1];

  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader code={p.code} title={p.name} lede={p.summary} badge={p.fullName} />

      <section className="mt-10 max-w-3xl">
        <h2 className="font-display text-2xl">Hoe het werkt</h2>
        <ol className="mt-4 space-y-3">
          {p.how.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span className="font-mono text-xs text-subtle">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Zwaktes</h2>
        <div className="mt-4 grid gap-3">
          {p.weaknesses.map((w) => (
            <article key={w.title} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{w.title}</h3>
                {w.cve ? <Badge tone="danger">{w.cve}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Proof of concept</h2>
        <div className="mt-4 space-y-4">
          {p.poc.map((c) => (
            <article key={c.title} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-medium">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              {c.commands ? (
                <pre className="mt-4 overflow-x-auto rounded-md bg-inset p-3 font-mono text-xs leading-relaxed text-accent">
                  {c.commands}
                </pre>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl">Quantum</h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-warn">{p.quantum}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{p.quantumNote}</p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl">Mitigaties</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {p.mitigations.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <nav className="mt-14 flex justify-between gap-4 text-sm" aria-label="Protocolnavigatie">
        {prev ? (
          <Link to="/protocollen/$id" params={{ id: prev.id }} className="text-muted hover:text-fg">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/protocollen/$id" params={{ id: next.id }} className="text-muted hover:text-fg">
            {next.name} →
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
