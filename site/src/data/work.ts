import type { Category, Photo } from './photos';
import { photos } from './photos';

export type TileRole = 'hero' | 'tall' | 'stack' | 'side' | 'feature' | 'quad' | 'runway' | 'small';

export interface WorkTile {
  photo: Photo;
  role: TileRole;
  href: string;
  filter: string;
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

const categoryRank: Record<Category, number> = {
  'fashion-editorial': 0,
  runway: 1,
  portraits: 2,
  bridal: 3,
  couples: 4,
  edmonton: 5,
};

/** Fashion leads, and the red-gown truck opens the grid the way layout 02 does. */
const lead = [
  'fb_013_signature',
  'fb_046_signature',
  'fb_114_signature',
  'fb_116_signature',
  'fb_141_signature',
  'fb_011_fashion',
  'fb_018_fashion',
  'fb_033_fashion',
  'fb_009_fashion',
  'fb_016_signature',
  'fb_024_fashion',
];

const fashionPattern: TileRole[] = [
  'hero',
  'hero',
  'hero',
  'tall',
  'stack',
  'stack',
  'stack',
  'stack',
  'side',
  'feature',
  'side',
  'quad',
  'quad',
  'quad',
  'quad',
];

export function workHref(photo: Photo): string {
  if (photo.series) return `/series/${photo.series}/`;
  if (photo.category === 'fashion-editorial') return '/fashion-editorial/';
  if (photo.category === 'runway') return '/runway/';
  if (photo.category === 'edmonton') return '/about/';
  return '/portraits-bridal-couples/';
}

export function workTiles(): WorkTile[] {
  const leadIndex = new Map(lead.map((id, index) => [id, index]));
  const sorted = [...photos].sort((a, b) => {
    const la = leadIndex.get(a.id) ?? 1000;
    const lb = leadIndex.get(b.id) ?? 1000;
    if (la !== lb) return la - lb;
    const byCategory = categoryRank[a.category] - categoryRank[b.category];
    if (byCategory !== 0) return byCategory;
    return a.id.localeCompare(b.id);
  });

  const seen: Partial<Record<Category, number>> = {};
  return sorted.map((photo) => {
    const index = seen[photo.category] ?? 0;
    seen[photo.category] = index + 1;
    let role: TileRole = 'small';
    if (photo.category === 'fashion-editorial') role = fashionPattern[index % fashionPattern.length];
    else if (photo.category === 'runway') role = 'runway';
    return {
      photo,
      role,
      href: workHref(photo),
      filter: filterOf[photo.category],
    };
  });
}

export function sizesFor(role: TileRole): string {
  if (role === 'feature') return '(max-width: 800px) 50vw, 52vw';
  if (role === 'hero' || role === 'tall' || role === 'stack' || role === 'runway') {
    return '(max-width: 800px) 50vw, 34vw';
  }
  return '(max-width: 800px) 50vw, 26vw';
}
