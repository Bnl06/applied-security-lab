import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MFA_METHODS } from "@/lib/data/mfa";
import { PROTOCOLS } from "@/lib/data/protocols";
import { SCORE_CELLS } from "@/lib/data/scorecard";
import { cn } from "@/lib/utils";

export function ScoreMatrix() {
  const [proto, setProto] = useState<string>("all");
  const [mfa, setMfa] = useState<string>("all");

  const rows = useMemo(() => {
    return SCORE_CELLS.filter(
      (c) => (proto === "all" || c.protocolId === proto) && (mfa === "all" || c.mfaId === mfa),
    );
  }, [proto, mfa]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-11 flex-1 flex-col gap-1 text-xs text-subtle">
          Protocol
          <select
            value={proto}
            onChange={(e) => setProto(e.target.value)}
            className="h-11 rounded-md bg-raised px-3 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            <option value="all">Alle protocollen</option>
            {PROTOCOLS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 flex-1 flex-col gap-1 text-xs text-subtle">
          MFA-methode
          <select
            value={mfa}
            onChange={(e) => setMfa(e.target.value)}
            className="h-11 rounded-md bg-raised px-3 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            <option value="all">Alle methoden</option>
            {MFA_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle">
              <th className="px-4 py-3 font-medium">Protocol</th>
              <th className="px-4 py-3 font-medium">MFA</th>
              <th className="px-4 py-3 font-medium">Bevinding</th>
              <th className="px-4 py-3 font-medium">Aanval</th>
              <th className="px-4 py-3 font-medium">Quantum</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const p = PROTOCOLS.find((x) => x.id === c.protocolId)!;
              const m = MFA_METHODS.find((x) => x.id === c.mfaId)!;
              return (
                <tr key={`${c.protocolId}-${c.mfaId}`} className="border-b border-line align-top">
                  <td className="px-4 py-3">
                    <Link to="/protocollen/$id" params={{ id: p.id }} className="hover:text-accent">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to="/mfa/$id" params={{ id: m.id }} className="hover:text-accent">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.finding}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-mono text-[11px] uppercase",
                        c.blocked === true && "text-success",
                        c.blocked === false && "text-danger",
                        c.blocked === "deels" && "text-warn",
                      )}
                    >
                      {c.blocked === true ? "geblokkeerd" : c.blocked === "deels" ? "deels" : "niet"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.quantum}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono tabular-nums">{c.score.toFixed(1)}</span>
                    <span className="ml-2 font-mono text-[10px] text-subtle">{c.ref}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
