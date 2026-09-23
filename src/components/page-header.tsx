import { Badge } from "@/components/ui/badge";

export function PageHeader({
  code,
  title,
  lede,
  badge,
}: {
  code: string;
  title: string;
  lede: string;
  badge?: string;
}) {
  return (
    <header className="max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          {code}
        </span>
        {badge ? <Badge tone="info">{badge}</Badge> : null}
      </div>
      <h1 className="font-display text-4xl leading-[1.15] tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lede}</p>
    </header>
  );
}
