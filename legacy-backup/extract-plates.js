const fs = require("fs");
const path = require("path");

const root = "C:\\Users\\gkuri\\Projects\\alrs-esports";
const src = fs.readFileSync(path.join(root, "spartan_hologram_web (1).html"), "utf8");

const m = src.match(/const PLATES=(\[[\s\S]*?\]);\s*\r?\nTHREE\.ColorManagement/);
if (!m) throw new Error("PLATES array not found");

const arr = m[1];
const val = eval("(" + arr + ")");
console.log("plates parsed:", val.length);

const out =
  "/* Extracted verbatim from spartan_hologram_web (1).html\n" +
  "   Extruded plate outlines for the Three.js Spartan hologram. */\n" +
  "export interface Plate {\n" +
  "  b: number[];\n" +
  "  i: number[][];\n" +
  "  c: number[][];\n" +
  "  r: number[][];\n" +
  "  h?: number[][];\n" +
  "}\n\n" +
  "export const PLATES: Plate[] = " + arr + ";\n";

fs.writeFileSync(path.join(root, "src", "lib", "hologramPlates.ts"), out);
console.log("written:", out.length, "bytes");
