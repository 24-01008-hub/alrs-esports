/* Minimal static preview server for the `out/` export — zero dependencies.
   Usage: node scripts/preview.mjs  (or `npm run preview`) */

import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { exec } from "node:child_process";

const ROOT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PORT = Number(process.env.PORT || 4173);
const URL_BASE = `http://localhost:${PORT}`;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function resolve(pathname) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (rel.startsWith("..")) return null;
  const file = join(ROOT, rel);
  const candidates = [file, `${file}.html`, join(file, "index.html")];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

if (!existsSync(join(ROOT, "index.html"))) {
  console.error("out/index.html not found — run `npm run build` first.");
  process.exit(1);
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, URL_BASE);
  const file = pathname === "/" ? join(ROOT, "index.html") : resolve(pathname);
  if (!file) {
    const notFound = join(ROOT, "404.html");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (existsSync(notFound)) createReadStream(notFound).pipe(res);
    else res.end("404");
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Preview: ${URL_BASE}`);
  if (process.env.NO_OPEN !== "1") {
    const cmd =
      process.platform === "win32" ? `start "" "${URL_BASE}"` : `xdg-open "${URL_BASE}"`;
    exec(cmd).unref?.();
  }
});
