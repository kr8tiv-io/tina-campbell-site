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
): Frame {
  return { photo: getPhoto(id), series, href, position, crop, origin };
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
export const fashionColumn: Frame[] = [
  frame('fb_016_signature', 'the-red-gown', 'center 70%', 'the-red-gown', 1.12, '62% 74%'),
  frame('fb_116_signature', 'the-red-gown', 'center 24%', 'the-red-gown', 1.12, 'center 20%'),
  frame('fb_013_signature', 'the-red-gown', 'center 22%', 'the-red-gown', 1.12, 'center 18%'),
  frame('fb_046_signature', 'legislature-in-black', 'center 34%'),
  frame('fb_141_signature', 'legislature-in-black', 'center 28%'),
  frame('fb_009_fashion', 'red-in-snow', 'center 32%'),
  frame('fb_034_fashion', 'red-in-snow', 'center 36%'),
  frame('fb_029_runway', 'runway-nights', 'center 42%'),
  frame('fb_168_city', 'blue-hour', 'center top', 'blue-hour', 1.45, 'center top'),
  frame('fb_001_city', 'blue-hour', 'center top', 'blue-hour', 1.35, 'center top'),
];

/**
 * Four tall portraits. fb_016 is the only red-gown file whose signature sits
 * in a corner we can crop off a 1:2 frame. The other three are clean snow
 * portraits (the truck files carry script across the gown).
 */
export const fashionStrip: Frame[] = [
  frame('fb_016_signature', 'the-red-gown', '78% 58%', 'the-red-gown', 1.7, '82% 60%'),
  frame('fb_009_fashion', 'red-in-snow', 'center 30%', 'red-in-snow'),
  frame('fb_034_fashion', 'red-in-snow', 'center 34%', 'red-in-snow'),
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
  pair: [Photo, Photo];
  pairPosition: [string, string];
  pairCrop: [number, number];
  pairOrigin: [string, string];
  film: Photo;
  filmPosition: string;
  filmCrop: number;
  filmOrigin: string;
  next: Series;
}

const spreadPlan: Record<
  SeriesSlug,
  { cover: ShotPlan; feature: ShotPlan; pair: [ShotPlan, ShotPlan]; film: ShotPlan }
> = {
  'the-red-gown': {
    cover: { id: 'fb_016_signature', position: 'center 90%', crop: 1.9, origin: '58% 92%' },
    feature: { id: 'fb_116_signature', position: 'center top', crop: 2.05, origin: 'center top' },
    pair: [
      { id: 'fb_013_signature', position: 'center top', crop: 1.5, origin: 'center top' },
      { id: 'fb_016_signature', position: '72% 82%', crop: 1.4, origin: '74% 84%' },
    ],
    film: { id: 'fb_016_signature', position: 'center 84%', crop: 1.2, origin: 'center 86%' },
  },
  'legislature-in-black': {
    cover: { id: 'fb_046_signature', position: 'center 32%' },
    feature: { id: 'fb_141_signature', position: 'center 30%' },
    pair: [
      { id: 'ig_profile_03', position: 'center 38%' },
      { id: 'fb_046_signature', position: 'center top', crop: 1.15, origin: 'center top' },
    ],
    film: { id: 'fb_046_signature', position: 'center 16%', crop: 1.1, origin: 'center top' },
  },
  'red-in-snow': {
    cover: { id: 'fb_034_fashion', position: 'center 34%' },
    feature: { id: 'fb_136_portrait', position: 'center 26%' },
    pair: [
      { id: 'fb_009_fashion', position: 'center 30%' },
      { id: 'fb_133_fashion', position: 'center 32%' },
    ],
    film: { id: 'fb_034_fashion', position: 'center 28%' },
  },
  'runway-nights': {
    cover: { id: 'fb_029_runway', position: 'center 40%' },
    feature: { id: 'fb_012_runway', position: 'center 36%' },
    pair: [
      { id: 'fb_158_runway', position: 'center top', crop: 1.25, origin: 'center top' },
      { id: 'fb_085_runway', position: 'center top', crop: 1.25, origin: 'center top' },
    ],
    film: { id: 'fb_029_runway', position: 'center 36%' },
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
      { id: 'fb_066_city', position: 'center top', crop: 1.55, origin: 'center top' },
    ],
    film: { id: 'fb_001_city', position: 'center 32%', crop: 1.2, origin: 'center 28%' },
  },
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
  const pair0 = shot(plan.pair[0]);
  const pair1 = shot(plan.pair[1]);
  const film = shot(plan.film);
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
    pair: [pair0.photo, pair1.photo],
    pairPosition: [pair0.position, pair1.position],
    pairCrop: [pair0.crop, pair1.crop],
    pairOrigin: [pair0.origin, pair1.origin],
    film: film.photo,
    filmPosition: film.position,
    filmCrop: film.crop,
    filmOrigin: film.origin,
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
      chapterFrame('fb_120_portrait', '80% 34%', 1.75, '82% 32%'),
    ],
  },
  {
    number: '02',
    title: 'Bridal',
    text: 'I started out photographing weddings, and I still love a good bridal portrait. Staircases, glass and great light.',
    href: '/work/?filter=bridal',
    frames: [
      chapterFrame('fb_049_bridal', 'center top', 1.55, 'center top'),
      chapterFrame('fb_056_bridal', 'center top', 1.55, 'center top'),
      chapterFrame('fb_059_bridal', 'center top', 1.55, 'center top'),
    ],
  },
  {
    number: '03',
    title: 'Couples',
    text: 'Engagements, anniversaries or just because. Relaxed, a little glamorous, and very much you two.',
    href: '/work/?filter=couples',
    frames: [
      chapterFrame('fb_031_couples', 'center top', 1.7, 'center top'),
      chapterFrame('fb_007_couples', 'center 34%'),
      chapterFrame('fb_065_couples', 'center 32%'),
    ],
  },
];

export function metaLine(series: Series): string {
  return `Series ${series.number} / Edmonton`;
}
