import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PinLab } from "@/components/pin-lab";
import { WHFB_CLAIMS } from "@/lib/data/whfb";

export const Route = createFileRoute("/onderzoek-whfb")({ component: WhfbPage });

function WhfbPage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="04"
        title="Is een PIN van 4 tekens veiliger dan een wachtwoord van 12?"
        lede="Onderzoeksvraag WHFB. We bevestigen de stelling — met een strikte scope: Entra ID, TPM 2.0, Windows Hello for Business. We weerleggen de folk-versie: ‘4 cijfers zijn sterker dan 12 tekens entropy’."
        badge="Bevestigd, met voorwaarden"
      />

      <blockquote className="mt-10 max-w-3xl border-l-2 border-accent pl-5 font-display text-2xl leading-snug text-fg">
        Een PIN is sterker dan een wachtwoord omdat het entropy levert aan een
        niet-exporteerbare asymmetrische key, niet omdat 10⁴ groter is dan 94¹².
      </blockquote>
      <p className="mt-3 max-w-3xl text-xs text-subtle">
        Microsoft Learn, Windows Hello for Business FAQ — parafrase in het labrapport.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {WHFB_CLAIMS.map((c) => (
          <article key={c.title} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-medium">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <PinLab />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">Eigen testresultaten</h2>
        <p>
          Op de Entra-joined Windows 11-VM met vTPM: acht foute PIN’s triggeren de
          A1B2C3-challenge; daarna lockout. We hebben geen PIN geraden. Dezelfde user
          met een 12-teken wachtwoord (lokaal gegenereerd, niet hergebruikt) gaf op de
          Evilginx-lure in één poging een ESTSAUTH-cookie af — MFA-push stond aan,
          number matching stond aan.
        </p>
        <p>
          Remote spray tegen het wachtwoord is een cloudaanval. Remote spray tegen de
          PIN bestaat niet: er is geen endpoint. Dat alleen al beantwoordt de vraag
          voor Entra ID.
        </p>
        <p>
          Weerlegd wordt de variant zonder TPM (software-backed Hello) en de variant
          waarin de laptop fysiek in handen van de aanvaller is én de user de PIN
          schouder-surft. BitLocker + pre-boot PIN + WHFB is de volledige keten; WHFB
          alleen beschermt de cloud-identiteit, niet de disk.
        </p>
      </section>
    </main>
  );
}
