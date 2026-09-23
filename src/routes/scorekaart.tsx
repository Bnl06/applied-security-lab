import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ScoreMatrix } from "@/components/score-matrix";
import { MFA_METHODS } from "@/lib/data/mfa";

export const Route = createFileRoute("/scorekaart")({ component: ScorePage });

function ScorePage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="07"
        title="Security scorekaart"
        lede="Elke cel is een combinatie authenticatieprotocol × MFA-methode. Score op 10, primaire bevinding, of de aanval geblokkeerd wordt, quantumstatus, verwijzing naar de onderbouwing."
      />

      <section className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
        <p>
          Weging: phishing-resistance 30%, tokenrisico 25%, binding 20%, quantum 15%,
          operationeel 10%. Protocol-modifiers: CBA +0.4, OIDC −0.3, OAuth −0.5,
          SAML −0.6 — omdat Golden/Silver SAML en device-code boven de factor zitten.
        </p>
      </section>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-9">
        {MFA_METHODS.map((m) => (
          <div key={m.id} className="bg-surface px-2 py-3 text-center">
            <p className="font-display text-xl tabular-nums">{m.score.totaal.toFixed(1)}</p>
            <p className="mt-1 truncate text-[10px] text-subtle">{m.name.replace("Passkey · ", "")}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ScoreMatrix />
      </div>
    </main>
  );
}
