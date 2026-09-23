import { useMemo, useState } from "react";
import { passwordBits, pinSpace, WHFB_TESTS } from "@/lib/data/whfb";
import { cn } from "@/lib/utils";

export function PinLab() {
  const [pinLen, setPinLen] = useState(4);
  const [alpha, setAlpha] = useState(false);
  const [pwLen, setPwLen] = useState(12);
  const [classes, setClasses] = useState(4);

  const pin = useMemo(() => pinSpace(pinLen, alpha), [pinLen, alpha]);
  const bits = useMemo(() => passwordBits(pwLen, classes), [pwLen, classes]);
  const triesBeforeLock = 8;
  const pinWin = triesBeforeLock / Math.max(1, pin.effective);
  const pwPhishWin = 1;

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        Lab-rekenaar
      </p>
      <h2 className="mt-1 font-display text-2xl">PIN versus wachtwoord, in getallen</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Verander lengte en alfabet. De conclusie verschuift niet: remote successkans van
        een gestolen of gefishte PIN is 0, van een wachtwoord 1.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <fieldset className="rounded-lg bg-inset p-4">
          <legend className="px-1 text-sm font-medium">WHFB-PIN</legend>
          <label className="mt-3 flex flex-col gap-2 text-xs text-muted">
            Lengte ({pinLen})
            <input
              type="range"
              min={4}
              max={8}
              value={pinLen}
              onChange={(e) => setPinLen(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alpha}
              onChange={(e) => setAlpha(e.target.checked)}
              className="size-4 accent-accent"
            />
            Alfanumeriek
          </label>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat k="Ruimte" v={pin.effective.toLocaleString("nl-BE")} />
            <Stat k="Lockout na" v={`${triesBeforeLock} misses`} />
            <Stat k="Kans vóór lockout" v={pct(pinWin)} />
            <Stat k="Remote bruikbaar" v="nee" />
          </dl>
        </fieldset>

        <fieldset className="rounded-lg bg-inset p-4">
          <legend className="px-1 text-sm font-medium">Entra-wachtwoord</legend>
          <label className="mt-3 flex flex-col gap-2 text-xs text-muted">
            Lengte ({pwLen})
            <input
              type="range"
              min={8}
              max={20}
              value={pwLen}
              onChange={(e) => setPwLen(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>
          <label className="mt-3 flex flex-col gap-2 text-xs text-muted">
            Tekensets ({classes}: cijfers → all)
            <input
              type="range"
              min={1}
              max={4}
              value={classes}
              onChange={(e) => setClasses(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat k="Entropy" v={`${bits.toFixed(0)} bits`} />
            <Stat k="Phish-pogingen nodig" v={`${pwPhishWin}`} />
            <Stat k="Kans bij AiTM" v="100%" />
            <Stat k="Remote bruikbaar" v="ja" />
          </dl>
        </fieldset>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-subtle">
              <th className="py-2 pr-3 font-medium">Aanval</th>
              <th className="py-2 pr-3 font-medium">12-teken wachtwoord</th>
              <th className="py-2 font-medium">4-cijfer WHFB-PIN</th>
            </tr>
          </thead>
          <tbody>
            {WHFB_TESTS.map((t) => (
              <tr key={t.id} className="border-b border-line align-top">
                <td className="py-3 pr-3 font-medium">{t.name}</td>
                <td className="py-3 pr-3">
                  <Verdict result={t.password.result} detail={t.password.detail} />
                </td>
                <td className="py-3">
                  <Verdict result={t.pin.result} detail={t.pin.detail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{k}</dt>
      <dd className="mt-0.5 font-mono tabular-nums text-fg">{v}</dd>
    </div>
  );
}

function pct(n: number) {
  if (n < 0.0001) return "< 0,01%";
  return `${(n * 100).toFixed(2).replace(".", ",")}%`;
}

function Verdict({ result, detail }: { result: string; detail: string }) {
  return (
    <div>
      <span
        className={cn(
          "font-mono text-[11px] uppercase tracking-wider",
          result === "pass" && "text-success",
          result === "fail" && "text-danger",
          result === "n/a" && "text-subtle",
        )}
      >
        {result === "pass" ? "houdt" : result === "fail" ? "breekt" : "n.v.t."}
      </span>
      <p className="mt-1 text-xs leading-relaxed text-muted">{detail}</p>
    </div>
  );
}
