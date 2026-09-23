# Identity is the new perimeter — Applied Security Lab

A fully technical lab report and interactive web app for the **3ITCSC Applied Security Project** (Bachelor Cybersecurity & Cloud, 12-week project). The project investigates the identity attack surface: protocol flaws, token replay, per-method MFA workarounds, defense (token binding, CAE, authentication strength), and quantum resilience.

## Topics covered

- **Protocols** — CBA, SAML, OAuth 2.0, OIDC, PRT theft
- **Token theft** — session cookies, bearer tokens, replay attacks
- **MFA methods** — 9 methods analyzed (phishable, phishing-resistant, hybrid)
- **WHfB research** — Windows Hello for Business research question
- **Defense** — token binding, CAE, authentication strength policies
- **Quantum** — post-quantum resilience assessment per method
- **Scorecard** — weighted scoring (phishing, token risk, binding, quantum, operational reality) per protocol × MFA combination

## Tech stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router)
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) primitives
- [better-auth](https://www.better-auth.com/) for authentication
- [PGlite](https://pglite.dev/) (in-browser Postgres) for local database
- [Recharts](https://recharts.org/) for data visualization

## Getting started

```bash
# Install dependencies
npm install

# Run the dev server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project structure

```
src/
├── components/     UI components (attack sims, lab maps, score bars, shadcn/ui)
├── routes/         File-based routes (TanStack Router)
├── lib/
│   ├── auth/       Authentication (better-auth, gates, sessions)
│   ├── data/       Domain data (MFA methods, protocols, scorecard, etc.)
│   ├── app-data/   Connector/app data layer
│   ├── multiplayer/ P2P multiplayer support
│   └── db.ts       Database setup (PGlite)
├── styles.css      Global styles (Tailwind)
migrations/         SQL migrations (auth)
scripts/            Build, test, and utility scripts
server/             Server middleware
public/             Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build (SSR + Nitro, for Vercel) |
| `npm run build:pages` | SPA build for GitHub Pages (outputs to `dist/`) |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run test suite |
| `npm run lint` | ESLint |
| `npm run format` | Prettier formatting |

## GitHub Pages deployment

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.

To enable it:

1. Go to **Settings > Pages** on the GitHub repo
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow builds the SPA and deploys it

The site will be live at `https://<username>.github.io/applied-security-lab/`.

To build locally for GitHub Pages:

```bash
VITE_AUTH_ENABLED=false VITE_PAGES_BASE="/applied-security-lab/" npm run build:pages
```

The `dist/` folder is ready to serve on any static host.

## License

This project is for educational purposes as part of the Bachelor Cybersecurity & Cloud program.
