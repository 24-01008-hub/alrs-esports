/* ==========================================================================
   ALRS · qr.tsx — deterministic procedural "verification code" on the
   membership card (decorative — matches the original design 1:1)
   ========================================================================== */

export function qrSVG(seed: string | undefined, px = 62) {
  const n = 21;
  let h = 2166136261;
  const str = String(seed || "ALRS");
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };

  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  let cells = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      if (rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  const eye = (ox: number, oy: number) =>
    `<rect x="${ox}" y="${oy}" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>` +
    `<rect x="${ox + 2}" y="${oy + 2}" width="3" height="3"/>`;

  const inner = cells + eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7);

  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      width={px}
      height={px}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Membership verification code"
    >
      <rect width={n} height={n} fill="#fff" />
      <g fill="#0B0B12" dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}
