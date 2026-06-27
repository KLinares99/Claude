// Decorative scattered playing-card suit pips for the deck cards.
// Pure inline SVG, no deps. Clustered on the right/bottom so it never sits
// behind the deck's title or blurb. Tinted with the card's ink colour.
const PIPS = [
  { x: 80, y: 16, s: 15, r: -12, g: '♥' },
  { x: 93, y: 38, s: 9, r: 10, g: '♦' },
  { x: 71, y: 50, s: 11, r: 8, g: '♠' },
  { x: 86, y: 66, s: 17, r: -8, g: '♣' },
  { x: 62, y: 80, s: 9, r: 14, g: '♦' },
  { x: 96, y: 84, s: 11, r: -16, g: '♥' },
];

export default function DeckArt({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {PIPS.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          fontSize={p.s}
          fill={color}
          opacity={0.16}
          transform={`rotate(${p.r} ${p.x} ${p.y})`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {p.g}
        </text>
      ))}
    </svg>
  );
}
