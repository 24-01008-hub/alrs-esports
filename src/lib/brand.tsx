/* ==========================================================================
   ALRS · brand.tsx — procedural SVG marks (helmet + full lockup)
   ========================================================================== */

const HELM_PLUME_D =
  "M32 12 A30 30 0 0 1 60.19 31.74 L52.67 34.48 A22 22 0 0 0 32 20 Z";
const HELM_SHELL_D =
  "M10 42 A22 22 0 0 1 54 42 V57 L51 63 H44 V51 H35.5 V63 H28.5 V51 H20 V63 H13 L10 57 Z M19 43.6 V49.4 H27.6 V43.6 Z M36.4 43.6 V49.4 H45 V43.6 Z";

export function LogoMark({
  className,
  title = "Alangilan Red Spartans helmet mark",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <path fill="var(--mark-plume, #FF2138)" d={HELM_PLUME_D} />
      <path
        fill="var(--mark-shell, #F2F3F7)"
        fillRule="evenodd"
        d={HELM_SHELL_D}
      />
    </svg>
  );
}

export function LogoLockup({
  className,
  title = "Alangilan Red Spartans Esports logo",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 132"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <g transform="translate(6 8) scale(1.72)">
        <path fill="var(--mark-plume, #FF2138)" d={HELM_PLUME_D} />
        <path
          fill="var(--mark-shell, #F2F3F7)"
          fillRule="evenodd"
          d={HELM_SHELL_D}
        />
      </g>
      <g fontFamily="Chakra Petch, Segoe UI, sans-serif">
        <text
          x="132"
          y="58"
          fontSize="47"
          fontWeight="700"
          letterSpacing="4"
          fill="var(--mark-shell, #F2F3F7)"
        >
          ALANGILAN
        </text>
        <text
          x="132"
          y="102"
          fontSize="47"
          fontWeight="700"
          letterSpacing="4"
          fill="var(--mark-plume, #FF2138)"
        >
          RED SPARTANS
        </text>
        <rect
          x="132"
          y="114"
          width="330"
          height="2"
          fill="var(--mark-plume, #FF2138)"
          opacity=".65"
        />
        <text
          x="472"
          y="120"
          fontSize="17"
          fontWeight="600"
          letterSpacing="7"
          fill="var(--mark-shell, #F2F3F7)"
          opacity=".8"
        >
          ESPORTS
        </text>
      </g>
    </svg>
  );
}

/**
 * Brand mark used across the shell: prefers the staff-uploaded logo
 * (public/uploads/logo/logo.*) and falls back to the built-in helmet SVG.
 */
export function BrandMark({
  logo,
  className,
  style,
}: {
  logo?: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (logo) {
    return (
      <img
        className={`logo-img ${className ?? ""}`}
        src={logo}
        alt="Alangilan Red Spartans Esports logo"
        style={style}
      />
    );
  }
  return <LogoMark className={className} />;
}
