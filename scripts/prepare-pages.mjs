/**
 * Post-build script for GitHub Pages deployment.
 * - Copies index.html to 404.html for SPA routing fallback
 * - Creates .nojekyll to disable Jekyll processing
 */
import { copyFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

// SPA fallback: GitHub Pages serves 404.html for unmatched routes
copyFileSync(join(distDir, "index.html"), join(distDir, "404.html"));

// Disable Jekyll processing on GitHub Pages
writeFileSync(join(distDir, ".nojekyll"), "");

console.log("[pages] Prepared dist/ for GitHub Pages (404.html + .nojekyll)");
