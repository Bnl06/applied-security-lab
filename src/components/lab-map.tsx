import { LAB_EDGES, LAB_NODES } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

const POS: Record<string, { x: number; y: number }> = {
  attacker: { x: 18, y: 28 },
  proxy: { x: 42, y: 28 },
  victim: { x: 42, y: 72 },
  phone: { x: 18, y: 72 },
  entra: { x: 70, y: 50 },
  m365: { x: 88, y: 32 },
  sp: { x: 88, y: 68 },
};

const ZONE: Record<string, string> = {
  rood: "text-danger",
  oranje: "text-warn",
  blauw: "text-info",
};

export function LabMap() {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        Topologie
      </p>
      <h2 className="mt-1 font-display text-2xl">Lab-omgeving</h2>
      <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-lg bg-inset">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
          {LAB_EDGES.map(([a, b]) => {
            const p1 = POS[a];
            const p2 = POS[b];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
        {LAB_NODES.map((n) => {
          const p = POS[n.id];
          return (
            <div
              key={n.id}
              className="absolute w-28 -translate-x-1/2 -translate-y-1/2 rounded-md bg-raised px-2 py-1.5 text-center shadow-[var(--shadow-border)] sm:w-36"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <p className={cn("font-mono text-[9px] uppercase tracking-wider", ZONE[n.zone])}>
                {n.zone}
              </p>
              <p className="text-[11px] font-medium leading-tight sm:text-xs">{n.label}</p>
              <p className="hidden text-[10px] text-subtle sm:block">{n.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
