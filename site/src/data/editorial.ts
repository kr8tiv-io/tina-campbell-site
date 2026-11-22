import {
  getPhoto,
  getSeries,
  seriesList,
  type Photo,
  type Series,
  type SeriesSlug,
} from './photos';

export interface Frame {
  photo: Photo;
  /** Series index row this frame belongs to while it is the one in view. */
  series: SeriesSlug;
  /** Story the photo actually belongs to. */
  href: SeriesSlug;
  /** When set, the frame links here instead of the series page. */
  link?: string;
  position: string;
  /** Extra cover zoom so a baked signature stays out of the frame. */
  crop: number;
  origin: string;
}

function frame(
  id: string,
  series: SeriesSlug,
  position: string,
  href: SeriesSlug = series,
  crop = 1,
  origin = 'center center',
  link?: string,
): Frame {
  return { photo: getPhoto(id), series, href, position, crop, origin, link };
}

/** CSS variables for object-position plus a scale that keeps a signature out of frame. */
export function frameStyle(
  position: string,
  crop = 1,
  origin = 'center center',
  cropMobile?: number,
  originMobile?: string,
): string {
  let style = `--pos: ${position}; --crop: ${crop}; --origin: ${origin}`;
  if (cropMobile != null) style += `; --crop-m: ${cropMobile}`;
  if (originMobile) style += `; --origin-m: ${originMobile}`;
  return style;
}

/**
 * Opening stack is three Red Gown bands (layout 03). Later frames walk 02-05
 * so the pinned column can toggle the index. Crops keep baked signatures off
 * the subject: wide bands from the top or the lower-right, never the full file.
 */
const fashionWork = '/work/?filter=fashion';

export const fashionColumn: Frame[] = [
  frame('fb_016_signature', 'the-red-gown', 'center 70%', 'the-red-gown', 1.12, '62% 74%'),
  frame('fb_116_signature', 'the-red-gown', 'center 24%', 'the-red-gown', 1.12, 'center 20%'),
  frame('fb_114_signature', 'the-red-gown', 'center 28%'),
  frame('fb_009_fashion', 'red-in-snow', 'center 32%'),
  frame('fb_034_fashion', 'red-in-snow', 'center 36%'),
  frame('fb_054_fashion', 'the-red-gown', 'center 34%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_069_fashion', 'the-red-gown', 'center 42%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_138_fashion', 'red-in-snow', 'center 48%'),
  frame('fb_011_fashion', 'the-red-gown', 'center 22%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_024_fashion', 'the-red-gown', 'center 30%', 'the-red-gown', 1, 'center center', fashionWork),
];

/**
 * Four tall portraits. fb_016 is the only red-gown file whose signature sits
 * in a corner we can crop off a 1:2 frame. The other three are clean snow
 * portraits (the truck files carry script across the gown).
 */
export const fashionStrip: Frame[] = [
  frame('fb_018_fashion', 'the-red-gown', 'center 40%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_124_fashion', 'the-red-gown', 'center 36%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_177_fashion', 'the-red-gown', 'center 42%', 'the-red-gown', 1, 'center center', fashionWork),
  frame('fb_136_portrait', 'red-in-snow', 'center 28%', 'red-in-snow'),
];

export const titleLines: Record<SeriesSlug, [string, string]> = {
  'the-red-gown': ['The Red', 'Gown'],
  'legislature-in-black': ['Legislature', 'in Black'],
  'red-in-snow': ['Red in', 'Snow'],
  'runway-nights': ['Runway', 'Nights'],
  'blue-hour': ['Blue', 'Hour'],
};

interface ShotPlan {
  id: string;
  position: string;
  crop?: number;
  origin?: string;
  /** Tighter crop for a tall cover. A wide desktop band can hide a low signature that a phone frame still shows. */
  cropMobile?: number;
  originMobile?: string;
}

export interface Spread {
  series: Series;
  cover: Photo;
  coverPosition: string;
  coverScale: number;
  coverOrigin: string;
  coverCropMobile?: number;
  coverOriginMobile?: string;
  feature: Photo;
  featurePosition: string;
  featureCrop: number;
  featureOrigin: string;
  pair: Photo[];
  pairPosition: string[];
  pairCrop: number[];
  pairOrigin: string[];
  film: Photo | null;
  filmPosition: string;
  filmCrop: number;
  filmOrigin: string;
  /** Next-series thumb. Null when that cover would repeat a photo or break the runway rule. */
  nextThumb: Photo | null;
  next: Series;
}

const spreadPlan: Record<
  SeriesSlug,
  { cover: ShotPlan; feature: ShotPlan; pair: ShotPlan[]; film: ShotPlan | null }
> = {
  'the-red-gown': {
    cover: { id: 'fb_016_signature', position: 'center 90%', crop: 1.9, origin: '58% 92%' },
    feature: { id: 'fb_013_signature', position: 'center top', crop: 1.5, origin: 'center top' },
    pair: [{ id: 'fb_116_signature', position: 'center top', crop: 2.05, origin: 'center top' }],
    film: null,
  },
  'legislature-in-black': {
    cover: { id: 'fb_046_signature', position: 'center 32%' },
    feature: { id: 'fb_141_signature', position: 'center 30%' },
    pair: [
      { id: 'ig_profile_03', position: 'center 38%' },
      { id: 'fb_033_fashion', position: 'center 34%' },
    ],
    film: null,
  },
  'red-in-snow': {
    cover: { id: 'fb_034_fashion', position: 'center 34%' },
    feature: { id: 'fb_136_portrait', position: 'center 26%' },
    pair: [
      { id: 'fb_009_fashion', position: 'center 30%' },
      { id: 'fb_133_fashion', position: 'center 32%' },
    ],
    film: { id: 'fb_042_fashion', position: 'center 30%' },
  },
  'runway-nights': {
    cover: { id: 'fb_029_runway', position: 'center 40%' },
    feature: { id: 'fb_012_runway', position: 'center 36%' },
    pair: [
      { id: 'fb_158_runway', position: 'center top', crop: 1.25, origin: 'center top' },
      { id: 'fb_085_runway', position: 'center top', crop: 1.25, origin: 'center top' },
    ],
    film: { id: 'fb_062_runway', position: 'center 36%' },
  },
  'blue-hour': {
    cover: {
      id: 'fb_168_city',
      position: 'center 38%',
      crop: 1.2,
      origin: 'center 36%',
      cropMobile: 2.8,
      originMobile: 'center 34%',
    },
    feature: { id: 'fb_066_city', position: 'center top', crop: 1.65, origin: 'center top' },
    pair: [
      { id: 'fb_001_city', position: 'center top', crop: 1.35, origin: 'center top' },
      { id: 'fb_577057434409234', position: 'center 42%', crop: 1.15, origin: 'center 40%' },
    ],
    film: null,
  },
};

/** Covers that would put a photo on a fourth page, or a runway frame on the wrong page, stay blank. */
const nextThumbId: Partial<Record<SeriesSlug, string>> = {
  'the-red-gown': 'fb_046_signature',
  'legislature-in-black': 'fb_034_fashion',
  'runway-nights': 'fb_168_city',
  'blue-hour': 'fb_013_signature',
};

function shot(plan: ShotPlan): {
  photo: Photo;
  position: string;
  crop: number;
  origin: string;
  cropMobile?: number;
  originMobile?: string;
} {
  return {
    photo: getPhoto(plan.id),
    position: plan.position,
    crop: plan.crop ?? 1,
    origin: plan.origin ?? 'center center',
    cropMobile: plan.cropMobile,
    originMobile: plan.originMobile,
  };
}

export function spreadFor(slug: SeriesSlug): Spread {
  const series = getSeries(slug);
  const plan = spreadPlan[slug];
  const index = seriesList.findIndex((item) => item.slug === slug);
  const next = seriesList[(index + 1) % seriesList.length] ?? seriesList[0];
  const cover = shot(plan.cover);
  const feature = shot(plan.feature);
  const pair = plan.pair.map((item) => shot(item));
  const film = plan.film ? shot(plan.film) : null;
  const thumbId = nextThumbId[slug];
  return {
    series,
    cover: cover.photo,
    coverPosition: cover.position,
    coverScale: cover.crop,
    coverOrigin: cover.origin,
    coverCropMobile: cover.cropMobile,
    coverOriginMobile: cover.originMobile,
    feature: feature.photo,
    featurePosition: feature.position,
    featureCrop: feature.crop,
    featureOrigin: feature.origin,
    pair: pair.map((item) => item.photo),
    pairPosition: pair.map((item) => item.position),
    pairCrop: pair.map((item) => item.crop),
    pairOrigin: pair.map((item) => item.origin),
    film: film?.photo ?? null,
    filmPosition: film?.position ?? 'center center',
    filmCrop: film?.crop ?? 1,
    filmOrigin: film?.origin ?? 'center center',
    nextThumb: thumbId ? getPhoto(thumbId) : null,
    next,
  };
}

export interface Chapter {
  number: string;
  title: string;
  text: string;
  href: string;
  frames: { photo: Photo; position: string; crop: number; origin: string }[];
}

function chapterFrame(id: string, position: string, crop = 1, origin = 'center center') {
  return { photo: getPhoto(id), position, crop, origin };
}

export const chapters: Chapter[] = [
  {
    number: '01',
    title: 'Portraits',
    text: "Glam, personal brand and headshots. I'll guide every pose, so you can stop worrying about your hands.",
    href: '/work/?filter=portraits',
    frames: [
      chapterFrame('fb_137_portrait', 'center 42%'),
      chapterFrame('fb_154_portrait', '64% 24%', 1.6, '66% 22%'),
      chapterFrame('fb_127_portrait', 'center 32%'),
    ],
  },
  {
    number: '02',
    title: 'Bridal',
    text: 'I started out photographing weddings, and I still love a good bridal portrait. Staircases, glass and great light.',
    href: '/work/?filter=bridal',
    frames: [
      chapterFrame('fb_056_bridal', 'center top', 1.55, 'center top'),
      chapterFrame('fb_061_bridal', 'center 42%'),
      chapterFrame('fb_109_bridal', 'center 36%'),
    ],
  },
  {
    number: '03',
    title: 'Couples',
    text: 'Engagements, anniversaries or just because. Relaxed, a little glamorous, and very much you two.',
    href: '/work/?filter=couples',
    frames: [
      chapterFrame('fb_007_couples', 'center 34%'),
      chapterFrame('fb_132_couples', 'center 36%'),
      chapterFrame('fb_135_couples', 'center 30%'),
    ],
  },
];

export function metaLine(series: Series): string {
  return `Series ${series.number} / Edmonton`;
}
