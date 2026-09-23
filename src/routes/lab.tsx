import { createFileRoute } from "@tanstack/react-router";
import { LabMap } from "@/components/lab-map";
import { PageHeader } from "@/components/page-header";
import { LAB_POLICIES, LAB_STEPS, LAB_USERS } from "@/lib/data/lab";

export const Route = createFileRoute("/lab")({ component: LabPage });

function LabPage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="08"
        title="Lab-documentatie"
        lede="Opbouw van de omgeving, Entra-configuratie, Conditional Access, en de proxy. Alles draait in een geïsoleerde P1-trial. Geen productie-identiteiten, geen echte telefoonnummers."
      />

      <div className="mt-10">
        <LabMap />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Stapsgewijze installatie</h2>
        <ol className="mt-4 space-y-4">
          {LAB_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="font-mono text-xs text-subtle">{i + 1}</span>
              <div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Lab-identiteiten</h2>
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle">
                <th className="px-4 py-3 font-medium">UPN</th>
                <th className="px-4 py-3 font-medium">Methode</th>
                <th className="px-4 py-3 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {LAB_USERS.map((u) => (
                <tr key={u.upn} className="border-b border-line">
                  <td className="px-4 py-3 font-mono text-xs">{u.upn}</td>
                  <td className="px-4 py-3">{u.method}</td>
                  <td className="px-4 py-3 text-muted">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Conditional Access</h2>
        <div className="mt-4 space-y-3">
          {LAB_POLICIES.map((p) => (
            <article key={p.name} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{p.name}</h3>
                <span className="font-mono text-[11px] text-subtle">{p.state}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{p.grant}</p>
              <p className="mt-1 text-xs text-subtle">{p.target}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl">Proxy-opstelling</h2>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-surface p-4 font-mono text-xs leading-relaxed text-accent shadow-[var(--shadow-border)]">{`# lab-only
# 1. DNS: login.lab-phish.local → attacker
# 2. TLS: lab-CA in de trust store van de victim-browser
# 3. Evilginx2 phishlet microsoft, lure voor alice…eve
# 4. Na CA02 (phishing-resistant) falen frank/grace/henry-lures
# 5. Token Protection report-only: unbound sign-ins in de logs
# 6. Enforce CA03: replay op attacker-VM → 1002/1003`}</pre>
      </section>
    </main>
  );
}
