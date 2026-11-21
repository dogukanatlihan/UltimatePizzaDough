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

export const BAKE_TEMP: Record<string, string> = {
  neapolitan: '500°C / 932°F',
  ny: '290°C / 550°F',
  sicilian: '250°C / 480°F',
  detroit: '260°C / 500°F',
  pan: '240°C / 465°F',
  focaccia: '230°C / 445°F',
};

export const BAKE_TIME: Record<string, { from: number; to: number; unit: 'min' | 'sec' }> = {
  neapolitan: { from: 60, to: 90, unit: 'sec' },
  ny: { from: 8, to: 10, unit: 'min' },
  sicilian: { from: 15, to: 20, unit: 'min' },
  detroit: { from: 12, to: 14, unit: 'min' },
  pan: { from: 12, to: 15, unit: 'min' },
  focaccia: { from: 18, to: 22, unit: 'min' },
};
