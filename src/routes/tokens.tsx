import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TOKEN_CHAIN, TOKEN_KINDS, TOKEN_TOOLING } from "@/lib/data/tokens";

export const Route = createFileRoute("/tokens")({ component: TokensPage });

function TokensPage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="02"
        title="Tokendiefstal en -misbruik"
        lede="MFA bewijst een moment. De token bewijst de rest van de week. We stelen PRT, refresh- en access-tokens in het lab en zetten er een werkende Graph-sessie mee op."
      />

      <ol className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {TOKEN_CHAIN.map((c, i) => (
          <li
            key={c.from}
            className="flex flex-1 items-center gap-3 rounded-lg bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
          >
            <span className="font-mono text-[11px] text-subtle">{i + 1}</span>
            <span>
              <span className="text-fg">{c.from}</span>
              <span className="text-subtle"> → {c.to}</span>
              <span className="mt-0.5 block text-xs text-muted">{c.via}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-4">
        {TOKEN_KINDS.map((t) => (
          <article key={t.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{t.name}</h2>
              <p className="font-mono text-[11px] text-subtle">{t.ttl}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.value}</p>
            <p className="mt-3 text-xs text-subtle">{t.where}</p>
            <h3 className="mt-5 text-sm font-medium">Stelen</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
              {t.steal.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-medium">Opnieuw inzetten</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.replay}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-warn">
              MFA-claim erft mee: {t.mfaInherited ? "ja" : "nee"}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Tooling (lab-only)</h2>
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle">
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Gebruik</th>
                <th className="px-4 py-3 font-medium">Lab-opstelling</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_TOOLING.map((t) => (
                <tr key={t.name} className="border-b border-line align-top">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.use}</td>
                  <td className="px-4 py-3 text-muted">{t.lab}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-subtle">
          Commando’s in dit rapport zijn voor de eigen tenant. AiTM, PRT-extractie
          en token-replay tegen systemen waar je geen schriftelijke toestemming voor
          hebt is een misdrijf.
        </p>
      </section>
    </main>
  );
}
