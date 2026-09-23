import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SLIDES } from "@/lib/data/presentation";

export const Route = createFileRoute("/presentatie")({ component: Deck });

function Deck() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const go = useCallback((n: number) => {
    setI(Math.max(0, Math.min(SLIDES.length - 1, n)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(i + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(SLIDES.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
          {slide.kicker}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-subtle">
            {i + 1} / {SLIDES.length}
          </span>
          <Button asChild variant="ghost" size="icon" aria-label="Sluiten">
            <Link to="/">
              <X className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-8 sm:px-10">
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          {slide.title}
        </h1>
        <ul className="mt-8 space-y-4">
          {slide.points.map((p) => (
            <li key={p} className="text-base leading-relaxed text-muted sm:text-lg">
              {p}
            </li>
          ))}
        </ul>
        {slide.note ? (
          <p className="mt-8 font-mono text-xs uppercase tracking-wider text-warn">{slide.note}</p>
        ) : null}
      </main>

      <footer className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Button variant="secondary" onClick={() => go(i - 1)} disabled={i === 0}>
          <ChevronLeft className="size-4" />
          Vorige
        </Button>
        <div className="flex flex-1 justify-center gap-1">
          {SLIDES.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => go(idx)}
              className={`h-1.5 w-6 rounded-full ${idx === i ? "bg-accent" : "bg-raised"}`}
            />
          ))}
        </div>
        <Button onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>
          Volgende
          <ChevronRight className="size-4" />
        </Button>
      </footer>
    </div>
  );
}
