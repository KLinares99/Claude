/**
 * Accent theming. The whole UI's "brand" color is driven by three CSS custom
 * properties (--brand / --brand-dark / --brand-soft) written as space-separated
 * RGB channels, so Tailwind's `rgb(var(--brand) / <alpha-value>)` colors keep
 * their opacity modifiers (bg-brand/10, ring-brand/15, …).
 *
 * Runner uses one fixed accent — blue. The old per-user color picker is gone;
 * any saved `settings.accent` value is kept in storage but ignored.
 */

export interface Accent {
  id: string;
  label: string;
  hex: string;   // solid accent (buttons, route lines, canvas exports)
  dark: string;  // hover / pressed
  soft: string;  // light tint background (chips)
}

export const BLUE: Accent = { id: 'blue', label: 'Ocean', hex: '#2563EB', dark: '#1D4ED8', soft: '#DBEAFE' };

/** Blue is the app's only accent. */
export const DEFAULT_ACCENT = BLUE;

/** Always blue — the id parameter is accepted for older call sites. */
export function getAccent(_id?: string): Accent {
  return BLUE;
}

/** Solid accent hex — for canvas/leaflet that can't use classes. */
export function accentHex(_id?: string): string {
  return BLUE.hex;
}

/** "#2563EB" → "37 99 235" (space-separated channels for the CSS var). */
function hexToChannels(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Write the accent's channels onto :root so every `brand` color follows it. */
export function applyAccent(_id?: string) {
  const a = BLUE;
  const root = document.documentElement.style;
  root.setProperty('--brand', hexToChannels(a.hex));
  root.setProperty('--brand-dark', hexToChannels(a.dark));
  root.setProperty('--brand-soft', hexToChannels(a.soft));
}
