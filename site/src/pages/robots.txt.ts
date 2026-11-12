import type { APIRoute } from 'astro';
import { defaultSiteUrl, noindexEnabled } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? defaultSiteUrl;
  const body = noindexEnabled()
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
