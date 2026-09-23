import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/layout/app-shell";
import appCss from "../styles.css?url";

const APP_NAME = "PERIMETER";
const BASE = import.meta.env.BASE_URL;

function AppContent() {
  return (
    <AuthProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthProvider>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "3ITCSC Applied Security Lab — authenticatieprotocollen, tokendiefstal, MFA-bypass en post-quantum scorekaart.",
      },
      { name: "theme-color", content: "#0a0a0b" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: `${BASE}favicon.svg` },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: `${BASE}__grok/manifest.webmanifest` },
      { rel: "apple-touch-icon", href: `${BASE}__grok/icon-180.png` },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="px-6 py-20">
      <p className="font-mono text-[11px] uppercase tracking-widest text-subtle">404</p>
      <h1 className="mt-2 font-display text-4xl">Pagina niet gevonden</h1>
      <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
        Terug naar de briefing
      </Link>
    </main>
  ),
  component: () =>
    import.meta.env.SSR ? (
      <html lang="nl" className="antialiased" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body>
          <PreviewHostBridge />
          <AppContent />
          <Scripts />
        </body>
      </html>
    ) : (
      <AppContent />
    ),
});
