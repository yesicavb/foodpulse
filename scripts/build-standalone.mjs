/**
 * Creates standalone/foodpulse.html: the whole app in a single HTML file
 * (same components as the Next.js app), useful for sharing it as a link
 * or opening it without a server. Usage: npm run build:standalone
 */
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("standalone", { recursive: true });

execSync("npx tailwindcss -i src/app/globals.css -o standalone/app.css --minify", { stdio: "inherit" });

await build({
  entryPoints: ["src/standalone/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2019",
  jsx: "automatic",
  outfile: "standalone/app.js",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

const css = readFileSync("standalone/app.css", "utf8");
const js = readFileSync("standalone/app.js", "utf8").replace(/<\/script/gi, "<\\/script");

const html = `<title>FOODPULSE</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#1F7A43">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Figtree:wght@400;500;600;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync("standalone/foodpulse.html", html);
console.log(`standalone/foodpulse.html (${Math.round(html.length / 1024)} KB)`);
