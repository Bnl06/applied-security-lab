import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PQC_TIMELINE, QUANTUM_ADVICE, QUANTUM_ROWS } from "@/lib/data/quantum";

export const Route = createFileRoute("/quantum")({ component: QuantumPage });

function QuantumPage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="06"
        title="Quantumbestendigheid"
        lede="Q-day kraakt geen TOTP-code van dertig seconden. Q-day kraakt de ECDSA-passkey die we net als ‘phishing-resistant’ hebben uitgeroepen. Dat minpunt staat op elke FIDO-score — expres."
      />

      <ol className="mt-10 space-y-0">
        {PQC_TIMELINE.map((e, i) => (
          <li key={e.year} className="grid grid-cols-[7rem_1fr] gap-4 border-l border-border py-3 pl-5 sm:grid-cols-[9rem_1fr]">
            <span className="font-mono text-xs text-subtle">{e.year}</span>
            <span className="text-sm leading-relaxed text-muted">
              {i === PQC_TIMELINE.length - 1 ? <span className="text-fg">{e.event}</span> : e.event}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-12 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle">
              <th className="px-4 py-3 font-medium">Methode</th>
              <th className="px-4 py-3 font-medium">Credential</th>
              <th className="px-4 py-3 font-medium">Algo nu</th>
              <th className="px-4 py-3 font-medium">Q-day-effect</th>
              <th className="px-4 py-3 font-medium">Oordeel</th>
            </tr>
          </thead>
          <tbody>
            {QUANTUM_ROWS.map((r) => (
              <tr key={r.method} className="border-b border-line align-top">
                <td className="px-4 py-3 font-medium">{r.method}</td>
                <td className="px-4 py-3 text-muted">{r.credential}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.algo}</td>
                <td className="px-4 py-3 text-muted">{r.qday}</td>
                <td className="px-4 py-3 font-mono text-xs uppercase text-warn">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl">Roadmap voor de tenant</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {QUANTUM_ADVICE.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Passkeys verdienen het minpunt én de toekomst. TOTP ‘wint’ quantum omdat HMAC
          Grover-only is, en verliest alles wat ertoe doet tot Q-day. We migreren naar
          FIDO, niet terug naar OTP, en we kopen keys die ML-DSA aankunnen.
        </p>
      </section>
    </main>
  );
}
