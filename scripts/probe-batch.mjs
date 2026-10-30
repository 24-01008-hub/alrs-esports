/* ALRS batch probe — console errors + feature assertions on every route */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import puppeteer from "puppeteer-core";
import { PNG } from "pngjs";

const ROOT = join(process.cwd(), "out");
const PORT = 4173;
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
  ".json": "application/json", ".ico": "image/x-icon", ".txt": "text/plain",
};

const statSafe = async (p) => { try { return await stat(p); } catch { return null; } };
const server = createServer(async (req, res) => {
  let url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (url === "") url = "/index.html";
  let p = join(ROOT, url);
  if (!p.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  const st = await statSafe(p);
  const maybe = st && st.isFile() ? p : ((await statSafe(p + ".html"))?.isFile() ? p + ".html" : null);
  if (!maybe) { res.writeHead(404); res.end("not found"); return; }
  try {
    const data = await readFile(maybe);
    res.writeHead(200, { "content-type": MIME[extname(maybe).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const routes = ["/", "/about", "/roster", "/tournaments", "/membership", "/marketplace", "/community", "/dashboard"];
const all = [];

for (const r of routes) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const errs = [];
  page.on("console", (m) => {
    if (m.type() === "error" && m.text().indexOf("Failed to load resource") === -1) errs.push("CONSOLE:" + m.text());
  });
  page.on("pageerror", (e) => errs.push("PAGEERR:" + e.message));
  page.on("response", (res) => {
    const u = res.url().replace("http://localhost:" + PORT, "");
    if (res.status() >= 400 && u.indexOf("__next.") === -1) errs.push(`HTTP ${res.status()}: ${u}`);
  });
  let check = null, shot = null;
  try {
    await page.goto(`http://localhost:${PORT}${r}`, { waitUntil: "networkidle2", timeout: 25000 });
    await new Promise((r2) => setTimeout(r2, 900));
    check = await page.evaluate(() => {
      const n = (sel) => document.querySelectorAll(sel).length;
      const bodyText = document.body.innerText;
      const t = (s) => bodyText.toLowerCase().indexOf(s) !== -1;
      const plates = [];
      for (const el of document.querySelectorAll(".offer__logo img, .sponsor__logo img, .strat__logo img, .logo img")) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        plates.push(`${(el.closest(".offer__logo,.sponsor__logo,.strat__logo,.logo")?.className || "").split(" ")[0]}|${cs.backgroundColor}|${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return {
        mcard: n(".mcard"), offer: n(".offer"), logo: n(".logo"), tab: n(".tab"),
        achv: n(".achv"), jersey: n(".jersey"), strat: n(".strat"),
        hasFueling: t("fueling victory"),
        hasEventBoard: t("bullet") || t("event board"),
        hasRosterSections: t("spartan achievements") && t("kit room"),
        logoImgs: n(".logo img"), offerImgs: n(".offer__logo img"), stratImgs: n(".strat__logo img"),
        plates,
      };
    });
    if (["/", "/tournaments", "/membership", "/marketplace", "/community"].includes(r)) shot = await page.screenshot({ type: "png" });
  } catch (e) {
    errs.push("NAV:" + e.message);
  }
  console.log(`# ${r} done errs=${errs.length}`);
  all.push({ r, check, errs, shot });
  await page.close().catch(() => {});
}
await browser.close().catch(() => {});

function scan(buf) {
  const png = PNG.sync.read(buf);
  const { data, width, height } = png;
  let red = 0, dark = 0, white = 0, total = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      total++;
      if (r > 120 && r > g * 1.6 && r > b * 1.6) red++;
      if (r < 60 && g < 60 && b < 60) dark++;
      if (r > 238 && g > 238 && b > 238) white++;
    }
  }
  return { red, dark, white, total };
}

const A = Object.fromEntries(all.map((x) => [x.r, x]));
console.log("\n================ SUMMARY ================");
for (const a of all) {
  console.log(`# ${a.r}`, a.check ? JSON.stringify(a.check) : "(nav failed)", a.errs.length ? "ERRORS:" + JSON.stringify(a.errs) : "");
  if (a.shot) {
    const s = scan(a.shot);
    console.log(`   pixel red=${s.red} white=${s.white} dark=${s.dark} redPct=${(100 * s.red / s.total).toFixed(1)}%`);
  }
}

const fails = [];
if (!A["/about"]?.check?.hasFueling) fails.push("about: Fueling Victory missing");
if ((A["/about"]?.check?.tab || 0) < 8) fails.push("about: fewer than 8 officer tabs");
if (!A["/tournaments"]?.check?.hasEventBoard) fails.push("events: bulletin copy missing");
if ((A["/tournaments"]?.check?.strat || 0) === 0) fails.push("events: strategy cards missing");
if ((A["/marketplace"]?.check?.offer || 0) === 0) fails.push("marketplace: offer tiles missing");
if ((A["/marketplace"]?.check?.offerImgs || 0) === 0) fails.push("marketplace: sponsor logos not loaded");
if ((A["/community"]?.check?.logo || 0) === 0) fails.push("community: partner logos missing");
if (A["/roster"]?.check && !A["/roster"].check.hasRosterSections) fails.push("roster: achievements/kit-room sections missing");
const anyRed = all.filter((x) => x.shot).map((x) => scan(x.shot).red).some((n) => n > 500);
if (!anyRed) fails.push("cap: no red content on membership/marketplace");
for (const a of all) if (a.errs.length) fails.push(`${a.r}: console/page errors`);
if (!A["/membership"]?.check?.mcard) fails.push("membership: member card not rendered");

console.log("================ RESULT ================");
console.log(fails.length ? "FAILURES:\n" + fails.map((f) => " - " + f).join("\n") : "ALL CHECKS PASSED");
server.closeAllConnections();
server.close();
process.exit(fails.length ? 1 : 0);