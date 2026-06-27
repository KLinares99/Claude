// Two overlapping hearts — the "two of us" mark.
// One heart path, reused with transforms: a sunny one behind, a rose one in front.
const HEART =
  'M0 9 C -2 6 -8 3 -8 -2 C -8 -5 -6 -6.5 -4 -6.5 C -2 -6.5 -0.6 -5.2 0 -4 ' +
  'C 0.6 -5.2 2 -6.5 4 -6.5 C 6 -6.5 8 -5 8 -2 C 8 3 2 6 0 9 Z';

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d={HEART} transform="translate(31 18) scale(1.05)" fill="#FFC93C" />
      <path d={HEART} transform="translate(18 24) scale(1.25)" fill="#FF5D8F" />
    </svg>
  );
}
