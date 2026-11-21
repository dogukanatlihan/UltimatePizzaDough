import neapolitanImg from '../assets/style-neapolitan.webp';
import newyorkImg from '../assets/style-newyork.webp';
import sicilianImg from '../assets/style-sicilian.webp';
import detroitImg from '../assets/style-detroit.webp';
import panImg from '../assets/style-pan.webp';
import focacciaImg from '../assets/style-focaccia.webp';

// 800x800 WebP, 60-120 KB each.
export const STYLE_IMAGE_SIZE = 800;

export const STYLE_IMAGES: Record<string, string> = {
  neapolitan: neapolitanImg,
  ny: newyorkImg,
  sicilian: sicilianImg,
  detroit: detroitImg,
  pan: panImg,
  focaccia: focacciaImg,
};

// Average colour of each photo: the ground it fades in over, so nothing pops.
export const STYLE_TINT: Record<string, string> = {
  neapolitan: '#8b603d',
  ny: '#8e603a',
  sicilian: '#936842',
  detroit: '#5f3e29',
  pan: '#6b472b',
  focaccia: '#a7835d',
};

// Oven and time per style, the same figures the baking steps give (checked in accuracy.check.ts).
// Neapolitan: AVPN floor 380-430 °C / dome 485 °C, EU 485 / 430. New York: Lehmann, deck at 525-550 °F.
// Sicilian: King Arthur, ATK 450 °F, 20-30 min. Detroit: Modernist Pizza 525 °F, Randazzo 500 °F, 12-15 min.
// Pan: López-Alt 550 °F, 12-15 min. Focaccia: King Arthur, Nosrat 450 °F, 20-25 min.
export const BAKE_TEMP: Record<string, string> = {
  neapolitan: '430–485°C / 805–905°F',
  ny: '290°C / 550°F',
  sicilian: '230°C / 450°F',
  detroit: '260–275°C / 500–525°F',
  pan: '290°C / 550°F',
  focaccia: '230°C / 450°F',
};

export const BAKE_TIME: Record<string, { from: number; to: number; unit: 'min' | 'sec' }> = {
  neapolitan: { from: 60, to: 90, unit: 'sec' },
  ny: { from: 5, to: 8, unit: 'min' },
  sicilian: { from: 20, to: 30, unit: 'min' },
  detroit: { from: 12, to: 15, unit: 'min' },
  pan: { from: 12, to: 15, unit: 'min' },
  focaccia: { from: 20, to: 25, unit: 'min' },
};
