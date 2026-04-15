/** DiceBear 7.x avataaars — options aligned with public schema (subset for UI). */

export const AVATAAARS_BASE = 'https://api.dicebear.com/7.x/avataaars/svg';

export interface AvataaarsState {
  seed: string;
  skinColor: string;
  top: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  facialHair: string;
  facialHairProbability: number;
  clothing: string;
  clothesColor: string;
  accessories: string;
  accessoriesProbability: number;
  backgroundColor: string;
}

export const SKIN_SWATCHES: { hex: string; label: string }[] = [
  { hex: '614335', label: 'Deep' },
  { hex: 'd08b5b', label: 'Brown' },
  { hex: 'ae5d29', label: 'Tan' },
  { hex: 'edb98a', label: 'Light' },
  { hex: 'ffdbb4', label: 'Fair' },
  { hex: 'fd9841', label: 'Warm' },
  { hex: 'f8d25c', label: 'Golden' }
];

export const HAIR_TOPS: { value: string; label: string }[] = [
  { value: 'longButNotTooLong', label: 'Long' },
  { value: 'bob', label: 'Bob' },
  { value: 'bun', label: 'Bun' },
  { value: 'curly', label: 'Curly' },
  { value: 'straight01', label: 'Straight' },
  { value: 'straight02', label: 'Straight 2' },
  { value: 'dreads', label: 'Dreads' },
  { value: 'fro', label: 'Fro' },
  { value: 'shavedSides', label: 'Shaved sides' },
  { value: 'shortCurly', label: 'Short curly' },
  { value: 'shortFlat', label: 'Short flat' },
  { value: 'theCaesar', label: 'Caesar' },
  { value: 'hat', label: 'Hat' },
  { value: 'hijab', label: 'Hijab' },
  { value: 'turban', label: 'Turban' },
  { value: 'winterHat1', label: 'Winter hat' }
];

export const HAIR_COLORS: string[] = [
  'a55728',
  '2c1b18',
  'b58143',
  'd6b370',
  '724133',
  '4a312c',
  'f59797',
  'ecdcbf',
  'e8e1e1',
  'c93305'
];

export const EYES: string[] = [
  'default',
  'happy',
  'hearts',
  'wink',
  'surprised',
  'side',
  'squint',
  'cry',
  'eyeRoll',
  'closed'
];

export const EYEBROWS: string[] = [
  'default',
  'defaultNatural',
  'raisedExcited',
  'angry',
  'sadConcerned',
  'flatNatural',
  'unibrowNatural'
];

export const MOUTHS: string[] = [
  'smile',
  'default',
  'serious',
  'twinkle',
  'tongue',
  'grimace',
  'sad',
  'concerned'
];

export const FACIAL_HAIR: string[] = [
  'beardLight',
  'beardMajestic',
  'beardMedium',
  'moustacheFancy',
  'moustacheMagnum'
];

export const CLOTHING: { value: string; label: string }[] = [
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'blazerAndShirt', label: 'Blazer' },
  { value: 'blazerAndSweater', label: 'Blazer + sweater' },
  { value: 'graphicShirt', label: 'Graphic tee' },
  { value: 'shirtCrewNeck', label: 'Crew neck' },
  { value: 'shirtVNeck', label: 'V-neck' },
  { value: 'overall', label: 'Overalls' },
  { value: 'collarAndSweater', label: 'Collar' }
];

export const CLOTHES_COLORS: string[] = [
  '262e33',
  '65c9ff',
  '5199e4',
  '25557c',
  'e6e6e6',
  '929598',
  'ff488e',
  'ff5c5c',
  'a7ffc4',
  'ffffb1'
];

export const ACCESSORIES: string[] = [
  'round',
  'kurt',
  'prescription01',
  'prescription02',
  'sunglasses',
  'wayfarers'
];

export const BG_COLORS: string[] = ['65c9ff', 'ffdbb4', 'c7f0ff', 'e0e7ff', 'fde68a', 'fecaca', 'bbf7d0', 'ddd6fe'];

export function defaultAvataaarsState(seed: string): AvataaarsState {
  return {
    seed,
    skinColor: 'edb98a',
    top: 'longButNotTooLong',
    hairColor: 'a55728',
    eyes: 'default',
    eyebrows: 'default',
    mouth: 'smile',
    facialHair: 'beardLight',
    facialHairProbability: 0,
    clothing: 'hoodie',
    clothesColor: '65c9ff',
    accessories: 'round',
    accessoriesProbability: 0,
    backgroundColor: '65c9ff'
  };
}

export function buildAvataaarsUrl(state: AvataaarsState): string {
  const s = sanitizeAvataaarsState(state);
  const p = new URLSearchParams();
  p.set('seed', s.seed);
  p.set('skinColor', s.skinColor);
  p.set('top', s.top);
  p.set('hairColor', s.hairColor);
  p.set('eyes', s.eyes);
  p.set('eyebrows', s.eyebrows);
  p.set('mouth', s.mouth);
  p.set('facialHair', s.facialHair);
  p.set('facialHairProbability', String(s.facialHairProbability));
  p.set('clothing', s.clothing);
  p.set('clothesColor', s.clothesColor);
  p.set('accessories', s.accessories);
  p.set('accessoriesProbability', String(s.accessoriesProbability));
  p.set('backgroundColor', s.backgroundColor);
  p.set('backgroundType', 'solid');
  return `${AVATAAARS_BASE}?${p.toString()}`;
}

export function parseAvataaarsUrl(url: string): Partial<AvataaarsState> | null {
  if (!url || !url.includes('/7.x/avataaars/')) {
    return null;
  }
  try {
    const u = new URL(url);
    const g = (k: string) => u.searchParams.get(k) || undefined;
    const seed = g('seed');
    if (!seed) {
      return null;
    }
    const num = (k: string, d: number) => {
      const v = u.searchParams.get(k);
      return v != null && v !== '' ? Number(v) : d;
    };
    return {
      seed,
      skinColor: g('skinColor'),
      top: g('top'),
      hairColor: g('hairColor'),
      eyes: g('eyes'),
      eyebrows: g('eyebrows'),
      mouth: g('mouth'),
      facialHair: g('facialHair'),
      facialHairProbability: num('facialHairProbability', 0),
      clothing: g('clothing'),
      clothesColor: g('clothesColor'),
      accessories: g('accessories'),
      accessoriesProbability: num('accessoriesProbability', 0),
      backgroundColor: g('backgroundColor')
    };
  } catch {
    return null;
  }
}

export function mergeAvataaarsState(seed: string, partial: Partial<AvataaarsState> | null): AvataaarsState {
  const d = defaultAvataaarsState(seed);
  if (!partial) {
    return d;
  }
  return {
    seed: partial.seed || d.seed,
    skinColor: partial.skinColor || d.skinColor,
    top: partial.top || d.top,
    hairColor: partial.hairColor || d.hairColor,
    eyes: partial.eyes || d.eyes,
    eyebrows: partial.eyebrows || d.eyebrows,
    mouth: partial.mouth || d.mouth,
    facialHair: partial.facialHair || d.facialHair,
    facialHairProbability:
      partial.facialHairProbability !== undefined ? partial.facialHairProbability : d.facialHairProbability,
    clothing: partial.clothing || d.clothing,
    clothesColor: partial.clothesColor || d.clothesColor,
    accessories: partial.accessories || d.accessories,
    accessoriesProbability:
      partial.accessoriesProbability !== undefined ? partial.accessoriesProbability : d.accessoriesProbability,
    backgroundColor: partial.backgroundColor || d.backgroundColor
  };
}

function sanitizeAvataaarsState(state: AvataaarsState): AvataaarsState {
  const d = defaultAvataaarsState(state.seed || 'stable_seed');
  const topSet = new Set(HAIR_TOPS.map((x) => x.value));
  const eyesSet = new Set(EYES);
  const eyebrowsSet = new Set(EYEBROWS);
  const mouthsSet = new Set(MOUTHS);
  const facialHairSet = new Set(FACIAL_HAIR);
  const clothingSet = new Set(CLOTHING.map((x) => x.value));
  const accessoriesSet = new Set(ACCESSORIES);

  return {
    seed: (state.seed || d.seed).trim() || d.seed,
    skinColor: sanitizeHex(state.skinColor, d.skinColor),
    top: topSet.has(state.top) ? state.top : d.top,
    hairColor: sanitizeHex(state.hairColor, d.hairColor),
    eyes: eyesSet.has(state.eyes) ? state.eyes : d.eyes,
    eyebrows: eyebrowsSet.has(state.eyebrows) ? state.eyebrows : d.eyebrows,
    mouth: mouthsSet.has(state.mouth) ? state.mouth : d.mouth,
    facialHair: facialHairSet.has(state.facialHair) ? state.facialHair : d.facialHair,
    facialHairProbability: clampInt(state.facialHairProbability, 0, 100),
    clothing: clothingSet.has(state.clothing) ? state.clothing : d.clothing,
    clothesColor: sanitizeHex(state.clothesColor, d.clothesColor),
    accessories: accessoriesSet.has(state.accessories) ? state.accessories : d.accessories,
    accessoriesProbability: clampInt(state.accessoriesProbability, 0, 100),
    backgroundColor: sanitizeHex(state.backgroundColor, d.backgroundColor)
  };
}

function sanitizeHex(v: string | null | undefined, fallback: string): string {
  const t = (v || '').trim().toLowerCase().replace(/^#/, '');
  return /^[a-f0-9]{6}$/.test(t) ? t : fallback;
}

function clampInt(v: number | null | undefined, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}
