import type { Category, Photo } from './photos';
import { categories, photos, seriesList } from './photos';

export type TileRole =
  | 'lead-a'
  | 'lead-b'
  | 'lead-c'
  | 'lead-d'
  | 'lead-e'
  | 'lead-f'
  | 'lead-g'
  | 'lead-h'
  | 'port'
  | 'land'
  | 'tall'
  | 'wide'
  | 'small';

export interface WorkTile {
  photo: Photo;
  role: TileRole;
  href: string;
  filter: string;
  caption: string;
  hero: boolean;
  /** 1 shows the top of the frame, 0 the bottom. Matches object-position. */
  bias: number;
  focus: string;
}

export const workFilters = [
  { id: 'all', label: 'All', href: '/work/' },
  { id: 'fashion', label: 'Fashion & Editorial', href: '/work/?filter=fashion' },
  { id: 'runway', label: 'Runway', href: '/work/?filter=runway' },
  { id: 'portraits', label: 'Portraits', href: '/work/?filter=portraits' },
  { id: 'bridal', label: 'Bridal', href: '/work/?filter=bridal' },
  { id: 'couples', label: 'Couples', href: '/work/?filter=couples' },
  { id: 'edmonton', label: 'Edmonton', href: '/work/?filter=edmonton' },
] as const;

export type WorkFilterId = (typeof workFilters)[number]['id'];

const filterOf: Record<Category, WorkFilterId> = {
  'fashion-editorial': 'fashion',
  runway: 'runway',
  portraits: 'portraits',
  bridal: 'bridal',
  couples: 'couples',
  edmonton: 'edmonton',
};

/** Opening masonry. fb_013 stays in the first row so the desktop test can clip it. */
const opening: { id: string; role: TileRole; hero?: boolean; bias?: number }[] = [
  { id: 'fb_016_signature', role: 'lead-a', hero: true, bias: 0.4 },
  { id: 'fb_013_signature', role: 'lead-b', hero: true, bias: 0.5 },
  { id: 'fb_049_bridal', role: 'lead-c', bias: 0.74 },
  { id: 'fb_066_city', role: 'lead-d', bias: 0.46 },
  { id: 'fb_031_couples', role: 'lead-e', bias: 0.7 },
  { id: 'fb_029_runway', role: 'lead-f', bias: 0.4 },
  { id: 'fb_046_signature', role: 'lead-g', bias: 0.58 },
  { id: 'fb_577057434409234', role: 'lead-h', bias: 0.52 },
];

const mixOrder: Category[] = [
  'fashion-editorial',
  'bridal',
  'edmonton',
  'couples',
  'runway',
  'portraits',
];

export function workHref(photo: Photo): string {
  if (photo.series) return `/series/${photo.series}/`;
  if (photo.category === 'fashion-editorial') return '/fashion-editorial/';
  if (photo.category === 'runway') return '/runway/';
  if (photo.category === 'edmonton') return '/about/';
  return '/portraits-bridal-couples/';
}

export function captionFor(photo: Photo): string {
  if (photo.series) {
    const series = seriesList.find((item) => item.slug === photo.series);
    if (series) return series.title;
  }
  const category = categories.find((item) => item.id === photo.category);
  return category?.label ?? 'Work';
}

function focusFor(bias: number): string {
  const fromTop = Math.round((1 - bias) * 100);
  return `center ${fromTop}%`;
}

function roleFor(photo: Photo, index: number): TileRole {
  // 540px and 768px frames stay in the small tile, under 25vw.
  if (photo.id === 'fb_148_fashion' || photo.id === 'fb_140_portrait') return 'small';
  if (photo.orientation === 'landscape') return index % 2 === 0 ? 'land' : 'wide';
  const cycle: TileRole[] = ['port', 'tall', 'small', 'port', 'small'];
  return cycle[index % cycle.length];
}

function interleave(items: Photo[]): Photo[] {
  const buckets = new Map<Category, Photo[]>();
  items.forEach((photo) => {
    const list = buckets.get(photo.category) ?? [];
    list.push(photo);
    buckets.set(photo.category, list);
  });
  const mixed: Photo[] = [];
  let added = true;
  while (added) {
    added = false;
    mixOrder.forEach((category) => {
      const list = buckets.get(category);
      const next = list?.shift();
      if (next) {
        mixed.push(next);
        added = true;
      }
    });
  }
  return mixed;
}

export function workTiles(): WorkTile[] {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const used = new Set<string>();
  const tiles: WorkTile[] = [];

  opening.forEach((slot) => {
    const photo = byId.get(slot.id);
    if (!photo) return;
    used.add(photo.id);
    const bias = slot.bias ?? 0.58;
    tiles.push({
      photo,
      role: slot.role,
      href: workHref(photo),
      filter: filterOf[photo.category],
      caption: captionFor(photo),
      hero: Boolean(slot.hero),
      bias,
      focus: focusFor(bias),
    });
  });

  interleave(photos.filter((photo) => !used.has(photo.id))).forEach((photo, index) => {
    const bias = photo.orientation === 'landscape' ? 0.5 : 0.6;
    tiles.push({
      photo,
      role: roleFor(photo, index),
      href: workHref(photo),
      filter: filterOf[photo.category],
      caption: captionFor(photo),
      hero: false,
      bias,
      focus: focusFor(bias),
    });
  });

  return tiles;
}

export function sizesFor(role: TileRole): string {
  if (role === 'lead-b') return '(max-width: 800px) 50vw, 46vw';
  if (role === 'wide' || role === 'lead-h') return '(max-width: 800px) 100vw, 40vw';
  if (role === 'land' || role === 'lead-a') return '(max-width: 800px) 100vw, 34vw';
  if (role === 'small') return '(max-width: 800px) 50vw, 24vw';
  return '(max-width: 800px) 50vw, 34vw';
}
