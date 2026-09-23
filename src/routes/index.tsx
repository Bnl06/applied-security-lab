import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MFA_METHODS } from "@/lib/data/mfa";
import { PROTOCOLS } from "@/lib/data/protocols";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ranked = [...MFA_METHODS].sort((a, b) => b.score.totaal - a.score.totaal);

  return (
    <main className="px-4 py-10 sm:px-8 sm:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
        3ITCSC Applied Security Project · 12 weken
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl">
        Identity is the new perimeter. Wij breken hem.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
        Volledig technisch eindrapport van het lab: CBA, SAML, OAuth 2.0, OIDC,
        PRT-diefstal, negen MFA-methoden, de WHFB-onderzoeksvraag, token binding,
        quantumweerstand en een scorekaart per combinatie. Elke aanval is een
        stapsgewijze lab-demo — of gedocumenteerd waarom hij faalt.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/scorekaart">
            Open de scorekaart
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/mfa">MFA-methoden</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/presentatie">Presentatie (30 min)</Link>
        </Button>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-4">
        {[
          ["Opleiding", "Bachelor Cybersecurity & Cloud"],
          ["Jaar", "3e · groep ±4"],
          ["Duur", "12 weken"],
          ["Scope", "Entra ID lab-tenant"],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface px-4 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-subtle">{k}</dt>
            <dd className="mt-1 text-sm">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl">Achtergrond</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
          <p>
            Zero Trust verschuift het kasteel van het netwerk naar de identiteit.
            Microsoft Entra ID, Google Workspace en AWS IAM zijn de poort. Groepen
            als Lapsus$, Midnight Blizzard en Scattered Spider vallen die poort aan:
            tokens stelen, MFA omzeilen, misconfigureerde OAuth-apps. MFA is
            ingeschakeld — en toch komen ze binnen, omdat de factor een phishable
            geheim is of omdat de sessie erna een bearer cookie is.
          </p>
          <p>
            Dit lab onderzoekt het volledige aanvalsoppervlak: protocolfouten,
            token-replay, per-methode workarounds, verdediging (token binding, CAE,
            authentication strength) en of de methode Q-day overleeft. Scores zijn
            geen demo-theatertjes: phishing, tokenrisico, binding, quantum en
            operationele realiteit, gewogen.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Leerdoelen</h2>
        </div>
        <ol className="grid gap-3 md:grid-cols-2">
          {[
            "Zwaktes van cert-based, SAML, OAuth 2.0 en OIDC aantonen met eigen PoC.",
            "PRT, refresh- en access-tokens stelen en een werkende sessie opzetten.",
            "Per MFA-methode een gerichte aanval: wat wordt geblokkeerd, wat slaagt.",
            "Onderbouwen waarom een aanval in een specifieke CA-configuratie faalt.",
            "Quantumbestendigheid koppelen aan de post-quantum roadmap (ML-DSA, FIDO).",
            "Security scorekaart per combinatie protocol × MFA, met motivatie.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
              <span className="font-mono text-xs text-subtle">0{i + 1}</span>
              <span className="text-sm leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl">Rangschikking MFA</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Zonder protocol-modifier. Hardware-passkeys winnen vandaag; SMS verliest
          van een residential proxy. Quantum trekt elke FIDO-score omlaag.
        </p>
        <ol className="mt-6 divide-y divide-line overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {ranked.map((m, i) => (
            <li key={m.id}>
              <Link
                to="/mfa/$id"
                params={{ id: m.id }}
                className="flex min-h-14 items-center gap-4 px-4 py-3 hover:bg-raised"
              >
                <span className="w-6 font-mono text-xs text-subtle">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{m.name}</span>
                  <span className="mt-0.5 hidden truncate text-xs text-muted sm:block">
                    {m.primaryFinding}
                  </span>
                </span>
                <span className="font-mono tabular-nums text-sm">{m.score.totaal.toFixed(1)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl">Protocollen</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {PROTOCOLS.map((p) => (
            <Link
              key={p.id}
              to="/protocollen/$id"
              params={{ id: p.id }}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <p className="font-mono text-[11px] text-subtle">{p.code}</p>
              <h3 className="mt-2 font-display text-2xl">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
