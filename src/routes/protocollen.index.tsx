import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PROTOCOLS } from "@/lib/data/protocols";

export const Route = createFileRoute("/protocollen/")({ component: ProtocolsPage });

function ProtocolsPage() {
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-12">
      <PageHeader
        code="01"
        title="Authenticatieprotocollen"
        lede="Vier enterprise-protocollen, vier manieren waarop ‘MFA stond aan’ toch een lege belofte is. De PoC’s draaien tegen de eigen lab-tenant en een opzettelijk kwetsbare SP — niet tegen productie."
      />
      <div className="mt-10 grid gap-4">
        {PROTOCOLS.map((p) => (
          <Link
            key={p.id}
            to="/protocollen/$id"
            params={{ id: p.id }}
            className="block rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{p.name}</h2>
              <span className="font-mono text-[11px] uppercase text-subtle">{p.quantum}</span>
            </div>
            <p className="mt-1 text-xs text-subtle">{p.fullName}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
