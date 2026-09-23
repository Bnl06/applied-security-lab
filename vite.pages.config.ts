import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages build config — pure SPA, no Nitro/TanStack Start SSR.
 * Produces static files in dist/ ready for GitHub Pages.
 */
const pagesBase = process.env.VITE_PAGES_BASE ?? "/applied-security-lab/";

export default defineConfig({
  base: pagesBase,
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
