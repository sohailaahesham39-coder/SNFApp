/** Light mood palette — Pear / Tomato / Crema / Mint */
export const LIGHT_PALETTE = {
  pear: '#EEBF43',
  tomato: '#C54F2D',
  crema: '#F2E7CB',
  mint: '#94B38A',
} as const;

export type LightPaletteKey = keyof typeof LIGHT_PALETTE;
