/** RUNNER logomark — an ascending route line with an endpoint, on the
 *  brand-orange tile. Matches the generated PWA icons. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FC4C02" />
      <path
        d="M12 33 L21 24 L27 30 L36 15"
        stroke="#fff"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="15" r="3.4" fill="#fff" />
    </svg>
  );
}
