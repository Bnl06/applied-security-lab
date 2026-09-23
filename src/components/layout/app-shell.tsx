import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NAV } from "@/lib/data/nav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDeck = pathname.startsWith("/presentatie");
  const [open, setOpen] = useState(false);

  if (isDeck) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Naar inhoud
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="font-display text-xl tracking-tight">PERIMETER</span>
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-subtle sm:inline">
              3ITCSC · Identity Lab
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-warn md:inline">
              Onderwijs · eigen lab
            </span>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-fg md:hidden"
              aria-label={open ? "Menu sluiten" : "Menu openen"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border py-6 md:block">
          <NavList pathname={pathname} />
        </aside>

        {open ? (
          <div className="fixed inset-0 top-14 z-30 bg-bg/95 p-4 md:hidden">
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}

        <div id="inhoud" className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Hoofdnavigatie" className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active =
          item.to === "/"
            ? pathname === "/"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
              active ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg",
            )}
          >
            <span className="font-mono text-[10px] text-subtle">{item.code}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
