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
}

function frame(id: string, series: SeriesSlug, position: string, href: SeriesSlug = series): Frame {
  return { photo: getPhoto(id), series, href, position };
}

/** Opening stack matches layout 03. Later frames keep the left panel moving. */
export const fashionColumn: Frame[] = [
  frame('fb_013_signature', 'the-red-gown', 'center 10%'),
  frame('fb_116_signature', 'the-red-gown', 'center 38%'),
  frame('fb_136_portrait', 'the-red-gown', 'center 36%', 'red-in-snow'),
  frame('fb_141_signature', 'legislature-in-black', 'center 22%'),
  frame('fb_009_fashion', 'red-in-snow', 'center 30%'),
  frame('fb_064_runway', 'runway-nights', 'center 40%'),
  frame('fb_008_fashion', 'blue-hour', 'center 34%'),
];

/** Four crops from the red gown shoot, as in the pull-quote strip. */
export const fashionStrip: Frame[] = [
  frame('fb_013_signature', 'the-red-gown', 'center 24%'),
  frame('fb_116_signature', 'the-red-gown', 'center 40%'),
  frame('fb_114_signature', 'the-red-gown', 'center 38%'),
  frame('fb_016_signature', 'the-red-gown', 'center 30%'),
];

export interface Spread {
  series: Series;
  cover: Photo;
  coverPosition: string;
  coverScale: number;
  coverOrigin: string;
  feature: Photo;
  featurePosition: string;
  pair: [Photo, Photo];
  pairPosition: [string, string];
  film: Photo;
  filmPosition: string;
  next: Series;
}

const spreadPlan: Record<
  SeriesSlug,
  {
    cover: string;
    coverPosition: string;
    coverScale?: number;
    coverOrigin?: string;
    feature: string;
    featurePosition: string;
    pair: [string, string];
    pairPosition: [string, string];
    film: string;
    filmPosition: string;
  }
> = {
  'the-red-gown': {
    cover: 'fb_013_signature',
    coverPosition: 'center 28%',
    feature: 'fb_116_signature',
    featurePosition: 'center 42%',
    pair: ['fb_114_signature', 'fb_016_signature'],
    pairPosition: ['center 40%', 'center 32%'],
    film: 'fb_016_signature',
    filmPosition: 'center 55%',
  },
  'legislature-in-black': {
    cover: 'fb_046_signature',
    coverPosition: 'center 38%',
    coverScale: 1,
    coverOrigin: 'center center',
    feature: 'fb_141_signature',
    featurePosition: 'center 16%',
    pair: ['ig_profile_03', 'ig_profile_02'],
    pairPosition: ['center 42%', 'center 30%'],
    film: 'fb_046_signature',
    filmPosition: 'center 78%',
  },
  'red-in-snow': {
    cover: 'fb_133_fashion',
    coverPosition: 'center 30%',
    feature: 'fb_136_portrait',
    featurePosition: 'center 28%',
    pair: ['fb_009_fashion', 'fb_034_fashion'],
    pairPosition: ['center 32%', 'center 30%'],
    film: 'fb_009_fashion',
    filmPosition: 'center 40%',
  },
  'runway-nights': {
    cover: 'fb_064_runway',
    coverPosition: 'center 35%',
    feature: 'fb_037_runway',
    featurePosition: 'center 40%',
    pair: ['fb_029_runway', 'fb_158_runway'],
    pairPosition: ['center 30%', 'center 42%'],
    film: 'fb_012_runway',
    filmPosition: 'center 45%',
  },
  'blue-hour': {
    cover: 'fb_066_city',
    coverPosition: 'center 48%',
    feature: 'fb_008_fashion',
    featurePosition: 'center 34%',
    pair: ['fb_001_city', 'fb_072_fashion'],
    pairPosition: ['center 45%', 'center 40%'],
    film: 'fb_168_city',
    filmPosition: 'center 50%',
  },
};

export function spreadFor(slug: SeriesSlug): Spread {
  const series = getSeries(slug);
  const plan = spreadPlan[slug];
  const index = seriesList.findIndex((item) => item.slug === slug);
  const next = seriesList[(index + 1) % seriesList.length] ?? seriesList[0];
  return {
    series,
    cover: getPhoto(plan.cover),
    coverPosition: plan.coverPosition,
    coverScale: plan.coverScale ?? 1,
    coverOrigin: plan.coverOrigin ?? 'center center',
    feature: getPhoto(plan.feature),
    featurePosition: plan.featurePosition,
    pair: [getPhoto(plan.pair[0]), getPhoto(plan.pair[1])],
    pairPosition: plan.pairPosition,
    film: getPhoto(plan.film),
    filmPosition: plan.filmPosition,
    next,
  };
}

export interface Chapter {
  number: string;
  title: string;
  text: string;
  href: string;
  frames: { photo: Photo; position: string }[];
}

export const chapters: Chapter[] = [
  {
    number: '01',
    title: 'Portraits',
    text: "Glam, personal brand and headshots. I'll guide every pose, so you can stop worrying about your hands.",
    href: '/work/?filter=portraits',
    frames: [
      { photo: getPhoto('fb_021_portrait'), position: 'center 18%' },
      { photo: getPhoto('fb_154_portrait'), position: 'center 28%' },
      { photo: getPhoto('fb_120_portrait'), position: 'center 30%' },
    ],
  },
  {
    number: '02',
    title: 'Bridal',
    text: 'I started out photographing weddings, and I still love a good bridal portrait. Staircases, glass and great light.',
    href: '/work/?filter=bridal',
    frames: [
      { photo: getPhoto('fb_049_bridal'), position: 'center 16%' },
      { photo: getPhoto('fb_056_bridal'), position: 'center 20%' },
      { photo: getPhoto('fb_059_bridal'), position: 'center 18%' },
    ],
  },
  {
    number: '03',
    title: 'Couples',
    text: 'Engagements, anniversaries or just because. Relaxed, a little glamorous, and very much you two.',
    href: '/work/?filter=couples',
    frames: [
      { photo: getPhoto('fb_031_couples'), position: 'center 28%' },
      { photo: getPhoto('fb_007_couples'), position: 'center 32%' },
      { photo: getPhoto('fb_065_couples'), position: 'center 30%' },
    ],
  },
];

export function metaLine(series: Series): string {
  return `Series ${series.number} / Edmonton`;
}
