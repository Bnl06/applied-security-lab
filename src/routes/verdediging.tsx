import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DEFENSE_MATRIX, DEFENSES } from "@/lib/data/defense";
import { MFA_METHODS } from "@/lib/data/mfa";

export const Route = createFileRoute("/verdediging")({ component: DefensePage });

function DefensePage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="05"
        title="Verdediging tegen tokendiefstal"
        lede="Token binding (Entra Token Protection) is de ontbrekende schakel tussen ‘MFA is gedaan’ en ‘de cookie is van het device’. We testen het, en zetten per MFA-methode wat wél en niet sterft."
      />

      <div className="mt-10 space-y-4">
        {DEFENSES.map((d) => (
          <article key={d.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{d.name}</h2>
              <p className="font-mono text-[11px] text-subtle">{d.status}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{d.how}</p>
            <p className="mt-3 text-sm leading-relaxed text-fg">
              <span className="text-subtle">Labtest. </span>
              {d.test}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-success">Blokkeert</p>
                <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                  {d.blocks.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-danger">Mist</p>
                <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                  {d.misses.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl">Per MFA-methode</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Zonder verdedigingsstack versus mét Token Protection + authentication
          strength + device-code block waar van toepassing.
        </p>
        <div className="mt-6 space-y-6">
          {DEFENSE_MATRIX.map((block) => {
            const m = MFA_METHODS.find((x) => x.id === block.mfaId);
            return (
              <div key={block.mfaId} className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
                <div className="border-b border-border px-4 py-3 text-sm font-medium">
                  {m?.name ?? block.mfaId}
                </div>
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-[11px] uppercase tracking-wider text-subtle">
                      <th className="px-4 py-2 font-medium">Aanval</th>
                      <th className="px-4 py-2 font-medium">Zonder stack</th>
                      <th className="px-4 py-2 font-medium">Met stack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r) => (
                      <tr key={r.attack} className="border-b border-line align-top">
                        <td className="px-4 py-3">{r.attack}</td>
                        <td className="px-4 py-3 text-muted">{r.without}</td>
                        <td className="px-4 py-3 text-muted">{r.with}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
