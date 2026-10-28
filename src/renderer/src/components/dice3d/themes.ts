/** Hendelse når 3D-terningene har lagt seg (RollToast venter på denne før resultatet vises) */
export const DICE_SETTLED = 'dice3d:settled'

/** Fargetemaer for terningene (brukes både av 3D-scenen og SVG-ikonene) */
export const DICE_THEMES: Record<string, { body: string; text: string; edge: string; name: string }> = {
  obsidian: { name: 'Obsidian', body: '#1c1714', text: '#f0cd7a', edge: '#b8893a' },
  ruby: { name: 'Rubin', body: '#8e1b26', text: '#fbe9c0', edge: '#e7a35a' },
  sapphire: { name: 'Safir', body: '#1d4b8f', text: '#f4f7ff', edge: '#9cc2ff' },
  emerald: { name: 'Smaragd', body: '#17603f', text: '#f0dc8a', edge: '#8fd6a8' },
  amethyst: { name: 'Ametyst', body: '#56287f', text: '#f3e6ff', edge: '#c9a2f0' },
  ivory: { name: 'Elfenben', body: '#eee3cc', text: '#3b1d10', edge: '#a7835a' },
  gold: { name: 'Gull', body: '#c9952f', text: '#2a1606', edge: '#fff0b8' }
}
