import type { ImageMetadata } from 'astro';

export type Category =
  | 'fashion-editorial'
  | 'runway'
  | 'portraits'
  | 'bridal'
  | 'couples'
  | 'edmonton';

export type SeriesSlug =
  | 'the-red-gown'
  | 'legislature-in-black'
  | 'red-in-snow'
  | 'runway-nights'
  | 'blue-hour';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface Photo {
  id: string;
  file: string;
  src: ImageMetadata;
  category: Category;
  series: SeriesSlug | null;
  alt: string;
  location: string | null;
  orientation: Orientation;
  width: number;
  height: number;
}

export interface Series {
  slug: SeriesSlug;
  number: string;
  title: string;
  intro: string;
  location: string;
}

export const categories: { id: Category; label: string; filter: string }[] = [
  { id: 'fashion-editorial', label: 'Fashion & Editorial', filter: 'fashion' },
  { id: 'runway', label: 'Runway', filter: 'runway' },
  { id: 'portraits', label: 'Portraits', filter: 'portraits' },
  { id: 'bridal', label: 'Bridal', filter: 'bridal' },
  { id: 'couples', label: 'Couples', filter: 'couples' },
  { id: 'edmonton', label: 'Edmonton', filter: 'edmonton' },
];

export const seriesList: Series[] = [
  {
    slug: 'the-red-gown',
    number: '01',
    title: 'The Red Gown',
    intro:
      'A crimson ball gown against a teal 1960s Fargo pickup and a cloudless sky. Colour doing all the talking.',
    location: 'Edmonton, Alberta',
  },
  {
    slug: 'legislature-in-black',
    number: '02',
    title: 'Legislature in Black',
    intro:
      'Black satin on the Alberta Legislature steps and under the old lamp posts. Classic architecture, modern attitude.',
    location: 'Alberta Legislature, Edmonton',
  },
  {
    slug: 'red-in-snow',
    number: '03',
    title: 'Red in Snow',
    intro:
      "Winter does half the styling. Red fabric on fresh snow, shot in the cold so you don't have to be.",
    location: 'Edmonton river valley',
  },
  {
    slug: 'runway-nights',
    number: '04',
    title: 'Runway Nights',
    intro: 'Stage light, fast changes and a few seconds per look. Coverage from Edmonton fashion shows.',
    location: 'Edmonton',
  },
  {
    slug: 'blue-hour',
    number: '05',
    title: 'Blue Hour',
    intro: 'Bridges, glass and skyline, the city as the co-star.',
    location: 'Walterdale and High Level Bridge, Edmonton',
  },
];

const creditPlaceholder = 'Credit to come';

export const creditLabels = ['Model', 'Hair and makeup', 'Styling', 'Location'] as const;

export function seriesCredits(series: Series): { label: string; value: string }[] {
  return [
    { label: 'Model', value: creditPlaceholder },
    { label: 'Hair and makeup', value: creditPlaceholder },
    { label: 'Styling', value: creditPlaceholder },
    { label: 'Location', value: series.location },
  ];
}

interface PhotoRecord {
  file: string;
  category: Category;
  series: SeriesSlug | null;
  alt: string;
  location?: string;
}

const records: PhotoRecord[] = [
  {
    file: 'fb_000_landscape.jpg',
    category: 'edmonton',
    series: null,
    alt: 'Silhouette of a woman standing in the water at golden hour, the sun low behind her.',
  },
  {
    file: 'fb_001_city.jpg',
    category: 'edmonton',
    series: 'blue-hour',
    alt: 'Underside of the High Level Bridge in Edmonton at sunset, sun flaring through the steel.',
    location: 'High Level Bridge, Edmonton',
  },
  {
    file: 'fb_007_couples.jpg',
    category: 'couples',
    series: null,
    alt: 'A couple in a close embrace, her in a pale blue dress, warm light behind them.',
  },
  {
    file: 'fb_008_fashion.jpg',
    category: 'fashion-editorial',
    series: 'blue-hour',
    alt: 'Model in a gold sequined dress and boots on a glass balcony, the Edmonton skyline behind her.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_009_fashion.jpg',
    category: 'fashion-editorial',
    series: 'red-in-snow',
    alt: 'Model in a red two-piece standing in snow among bare winter trees.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_011_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Platinum blonde model in a black leather jacket and pants, full-length against a white wall.',
  },
  {
    file: 'fb_012_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Model walking a runway in an oversized red coat over black, stage lights behind her.',
    location: 'Edmonton',
  },
  {
    file: 'fb_013_signature.jpg',
    category: 'fashion-editorial',
    series: 'the-red-gown',
    alt: 'Model in a crimson ball gown on the hood of a vintage teal pickup under a clear blue sky.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_016_signature.jpg',
    category: 'fashion-editorial',
    series: 'the-red-gown',
    alt: 'Wide frame of a crimson gown spread across a vintage teal Fargo pickup, bright Alberta sky.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_018_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a navy gown with a high slit, standing on a winter road.',
  },
  {
    file: 'fb_021_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Close beauty portrait of a dark-haired woman in low light, a red rose near her cheek.',
  },
  {
    file: 'fb_024_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in denim and black beside a black Mercedes, bright high-key light.',
  },
  {
    file: 'fb_029_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway look, a red feathered gown under warm stage light.',
    location: 'Edmonton',
  },
  {
    file: 'fb_031_couples.jpg',
    category: 'couples',
    series: null,
    alt: 'Wedding couple under a glass atrium, her gown catching the light as they dance.',
  },
  {
    file: 'fb_033_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in a black satin dress with a sheer panel, bare winter trees behind her.',
  },
  {
    file: 'fb_034_fashion.jpg',
    category: 'fashion-editorial',
    series: 'red-in-snow',
    alt: 'Model in red, standing in front of snowy pines.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_035_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Woman in a black suit seated on a white sofa, quiet interior light.',
  },
  {
    file: 'fb_037_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Model in a red tiered gown on the runway at Western Canada Fashion Week.',
    location: 'Edmonton',
  },
  {
    file: 'fb_039_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Woman in a white head wrap and sunglasses seated by the sea, spray in the air.',
  },
  {
    file: 'fb_040_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Woman in a black jacket standing in a pale winter field.',
  },
  {
    file: 'fb_042_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a red top and white coat, snowy trees behind her.',
  },
  {
    file: 'fb_046_signature.jpg',
    category: 'fashion-editorial',
    series: 'legislature-in-black',
    alt: 'Model in a black ball gown on the steps of the Alberta Legislature.',
    location: 'Alberta Legislature, Edmonton',
  },
  {
    file: 'fb_047_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a white bodysuit and black boots, leaning beside a dark car.',
  },
  {
    file: 'fb_048_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Woman in a white head wrap reading a magazine, soft side light.',
  },
  {
    file: 'fb_049_bridal.jpg',
    category: 'bridal',
    series: null,
    alt: 'Bride in a white gown with flowing sleeves on a brick stairway, bouquet in hand.',
  },
  {
    file: 'fb_056_bridal.jpg',
    category: 'bridal',
    series: null,
    alt: 'Bride in a white gown under a bright curved glass ceiling.',
  },
  {
    file: 'fb_058_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in a leopard swimsuit standing in the water, arms lifted.',
  },
  {
    file: 'fb_059_bridal.jpg',
    category: 'bridal',
    series: null,
    alt: 'Bride seen from behind in a white gown with a large bow, standing on a balcony.',
  },
  {
    file: 'fb_060_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway look, a printed mini dress and visor on a fashion-show floor.',
    location: 'Edmonton',
  },
  {
    file: 'fb_064_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway look, an electric blue ruffled set and tall black boots.',
    location: 'Edmonton',
  },
  {
    file: 'fb_065_couples.jpg',
    category: 'couples',
    series: null,
    alt: 'Couple portrait outdoors, her in a red sweater, autumn light.',
  },
  {
    file: 'fb_066_city.jpg',
    category: 'edmonton',
    series: 'blue-hour',
    alt: 'Walterdale Bridge arch over the river, sun flaring through the steel.',
    location: 'Walterdale Bridge, Edmonton',
  },
  {
    file: 'fb_071_landscape.jpg',
    category: 'edmonton',
    series: null,
    alt: 'Silhouette with arms raised on rocks at sunset, water in the foreground.',
  },
  {
    file: 'fb_072_fashion.jpg',
    category: 'fashion-editorial',
    series: 'blue-hour',
    alt: 'Model in a mint two-piece against curved glass architecture.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_077_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in an emerald gown, bright high-key light.',
  },
  {
    file: 'fb_085_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway lineup, a red gown leading a row of white bridal dresses.',
    location: 'Edmonton',
  },
  {
    file: 'fb_089_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in black against a brick alley wall, hands in her hair.',
  },
  {
    file: 'fb_092_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in yellow sunglasses and a black leather jacket.',
  },
  {
    file: 'fb_093_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a leather jacket and ripped jeans, snowy woods behind her.',
  },
  {
    file: 'fb_100_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a black leather jacket over red, three-quarter portrait.',
  },
  {
    file: 'fb_102_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a leather jacket and jeans, standing in snow.',
  },
  {
    file: 'fb_105_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway look, a bright floral suit on a fashion-show floor.',
    location: 'Edmonton',
  },
  {
    file: 'fb_106_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Black and white portrait of a woman in lace, looking down, soft window light.',
  },
  {
    file: 'fb_107_landscape.jpg',
    category: 'edmonton',
    series: null,
    alt: 'Snow-covered Rocky Mountain peak under a blue sky, a small cabin in the trees.',
    location: 'Rocky Mountains, Alberta',
  },
  {
    file: 'fb_109_bridal.jpg',
    category: 'bridal',
    series: null,
    alt: 'Bride in white framed by a dark industrial window grid.',
  },
  {
    file: 'fb_114_signature.jpg',
    category: 'fashion-editorial',
    series: 'the-red-gown',
    alt: 'Model in a crimson ball gown beside a wooden fence and an open field.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_116_signature.jpg',
    category: 'fashion-editorial',
    series: 'the-red-gown',
    alt: 'Model in a crimson ball gown posed with a vintage teal pickup on a heritage street.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_120_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Close beauty portrait, a makeup brush at her cheek, warm light.',
  },
  {
    file: 'fb_121_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in black seated against a graffiti wall.',
  },
  {
    file: 'fb_123_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Woman walking a shoreline in a long dark dress, the fabric moving with her.',
  },
  {
    file: 'fb_124_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in a black dress and heels seated on concrete steps.',
  },
  {
    file: 'fb_133_fashion.jpg',
    category: 'fashion-editorial',
    series: 'red-in-snow',
    alt: 'Model in a red athletic set, hands on hips, snowy trees behind her.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_136_portrait.jpg',
    category: 'portraits',
    series: 'red-in-snow',
    alt: 'Close portrait of a model in red, snowy trees soft behind her.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'fb_137_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Beauty close-up of blonde curls, a hand at the chin, soft natural light.',
  },
  {
    file: 'fb_141_signature.jpg',
    category: 'fashion-editorial',
    series: 'legislature-in-black',
    alt: 'Model in a black gown under an ornate lamp post, low angle, clear blue sky.',
    location: 'Alberta Legislature, Edmonton',
  },
  {
    file: 'fb_147_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in a black sequined gown with a lace panel, clean studio light.',
  },
  {
    file: 'fb_154_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Portrait in a red sweater and faux fur, autumn bokeh behind her.',
  },
  {
    file: 'fb_156_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Beauty portrait, curly hair and a leopard top, bright frontal light.',
  },
  {
    file: 'fb_158_runway.jpg',
    category: 'runway',
    series: 'runway-nights',
    alt: 'Runway look, a royal blue cape gown on the show floor.',
    location: 'Edmonton',
  },
  {
    file: 'fb_160_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a navy off-shoulder gown, bare trees and open sky.',
  },
  {
    file: 'fb_168_city.jpg',
    category: 'edmonton',
    series: 'blue-hour',
    alt: 'Edmonton skyline at pink dusk, seen from across the river valley.',
    location: 'Edmonton',
  },
  {
    file: 'fb_173_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Model in denim squatting against a bright blue wall.',
  },
  {
    file: 'fb_178_fashion.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Blonde model in a denim jacket, city glass behind her.',
  },
  {
    file: 'fb_183_portrait.jpg',
    category: 'portraits',
    series: null,
    alt: 'Portrait of a woman with a full afro against a clear blue sky.',
  },
  {
    file: 'ig_profile_01.jpg',
    category: 'fashion-editorial',
    series: null,
    alt: 'Black and white frame of a figure walking away down a dirt path.',
  },
  {
    file: 'ig_profile_02.jpg',
    category: 'fashion-editorial',
    series: 'legislature-in-black',
    alt: 'Model in a black gown beneath a lamp post, blue sky, low angle.',
    location: 'Alberta Legislature, Edmonton',
  },
  {
    file: 'ig_profile_03.jpg',
    category: 'fashion-editorial',
    series: 'legislature-in-black',
    alt: 'Model in a black gown in front of the Alberta Legislature columns.',
    location: 'Alberta Legislature, Edmonton',
  },
  {
    file: 'ig_profile_05.jpg',
    category: 'edmonton',
    series: null,
    alt: 'Two people seen from behind on a rooftop, arms open toward the skyline.',
    location: 'Edmonton, Alberta',
  },
  {
    file: 'ig_profile_06.jpg',
    category: 'edmonton',
    series: null,
    alt: 'Sun sitting on the water at sunset, a dark post in the foreground.',
  },
];

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', {
  eager: true,
});

function orientationOf(width: number, height: number): Orientation {
  const ratio = width / height;
  if (ratio > 1.08) return 'landscape';
  if (ratio < 0.92) return 'portrait';
  return 'square';
}

function assetFor(file: string): ImageMetadata {
  const key = `../assets/photos/${file}`;
  const mod = modules[key];
  if (!mod) throw new Error(`Missing photo asset ${file}`);
  return mod.default;
}

export const photos: Photo[] = records.map((record) => {
  const src = assetFor(record.file);
  return {
    id: record.file.replace(/\.jpg$/i, ''),
    file: record.file,
    src,
    category: record.category,
    series: record.series,
    alt: record.alt,
    location: record.location ?? null,
    orientation: orientationOf(src.width, src.height),
    width: src.width,
    height: src.height,
  };
});

export function getPhoto(id: string): Photo {
  const photo = photos.find((item) => item.id === id);
  if (!photo) throw new Error(`Unknown photo ${id}`);
  return photo;
}

export function photosInCategory(category: Category): Photo[] {
  return photos.filter((photo) => photo.category === category);
}

export function photosInSeries(slug: SeriesSlug): Photo[] {
  return photos.filter((photo) => photo.series === slug);
}

export function getSeries(slug: SeriesSlug): Series {
  const series = seriesList.find((item) => item.slug === slug);
  if (!series) throw new Error(`Unknown series ${slug}`);
  return series;
}
