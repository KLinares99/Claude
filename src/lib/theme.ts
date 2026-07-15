/**
 * Accent theming. The whole UI's "brand" color is driven by three CSS custom
 * properties (--brand / --brand-dark / --brand-soft) written as space-separated
 * RGB channels, so Tailwind's `rgb(var(--brand) / <alpha-value>)` colors keep
 * their opacity modifiers (bg-brand/10, ring-brand/15, …). Changing the accent
 * is just rewriting those three variables — no rebuild, applies everywhere.
 */

export interface Accent {
  id: string;
  label: string;
  hex: string;   // solid accent (buttons, route lines, canvas exports)
  dark: string;  // hover / pressed
  soft: string;  // light tint background (chips)
}

export const ACCENTS: Accent[] = [
  { id: 'orange', label: 'Ember',  hex: '#FC4C02', dark: '#DE4302', soft: '#FFF0E8' },
  { id: 'green',  label: 'Forest', hex: '#16A34A', dark: '#15803D', soft: '#DCFCE7' },
  { id: 'blue',   label: 'Ocean',  hex: '#2563EB', dark: '#1D4ED8', soft: '#DBEAFE' },
  { id: 'violet', label: 'Violet', hex: '#7C3AED', dark: '#6D28D9', soft: '#EDE9FE' },
  { id: 'rose',   label: 'Rose',   hex: '#E11D48', dark: '#BE123C', soft: '#FFE4E6' },
  { id: 'slate',  label: 'Slate',  hex: '#334155', dark: '#1E293B', soft: '#E2E8F0' }
];

export const DEFAULT_ACCENT = ACCENTS[0];

export function getAccent(id: string | undefined): Accent {
  return ACCENTS.find((a) => a.id === id) ?? DEFAULT_ACCENT;
}

/** Solid accent hex for the given id — for canvas/leaflet that can't use classes. */
export function accentHex(id: string | undefined): string {
  return getAccent(id).hex;
}

/** "#FC4C02" → "252 76 2" (space-separated channels for the CSS var). */
function hexToChannels(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Write the accent's channels onto :root so every `brand` color follows it. */
export function applyAccent(id: string | undefined) {
  const a = getAccent(id);
  const root = document.documentElement.style;
  root.setProperty('--brand', hexToChannels(a.hex));
  root.setProperty('--brand-dark', hexToChannels(a.dark));
  root.setProperty('--brand-soft', hexToChannels(a.soft));
}
