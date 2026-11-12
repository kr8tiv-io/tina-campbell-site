export const siteName = 'Tina Campbell Photography';

export const defaultSiteUrl = 'https://lightsteelblue-lark-427091.hostingersite.com';

export const instagramUrl = 'https://www.instagram.com/_tcphoto/';
export const instagramHandle = '@_tcphoto';
export const facebookUrl = 'https://www.facebook.com/tcphotophotography';

export const bookHref = '/book/';
export const bookLabel = 'Book a shoot';

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/fashion-editorial/', label: 'Fashion & Editorial' },
  { href: '/about/', label: 'About' },
  { href: '/services/', label: 'Services' },
  { href: '/journal/', label: 'Journal' },
] as const;

export const footerTagline = 'Fashion, portrait and runway photographer in Edmonton, Alberta.';

export const skipLabel = 'Skip to content';

export const areaServed = ['Edmonton', 'St. Albert', 'Fort Saskatchewan', 'Alberta'] as const;

export function noindexEnabled(): boolean {
  return import.meta.env.PUBLIC_NOINDEX !== 'false';
}

/** Fashion & Editorial stays current on its series stories. */
export function isCurrent(path: string, href: string): boolean {
  if (path === href) return true;
  if (href === '/fashion-editorial/' && path.startsWith('/series/')) return true;
  return false;
}
