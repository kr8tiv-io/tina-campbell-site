import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { defaultSiteUrl } from '../data/site';

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL(defaultSiteUrl);
  const posts = (await getCollection('journal')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const items = posts
    .map((post) => {
      const url = new URL(`/journal/${post.id}/`, origin).href;
      return [
        '<item>',
        `<title>${xml(post.data.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `<description>${xml(post.data.description)}</description>`,
        '</item>',
      ].join('');
    })
    .join('');
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    '<title>Tina Campbell Photography Journal</title>',
    `<link>${new URL('/journal/', origin).href}</link>`,
    '<description>Guides and behind the scenes from shoots around Edmonton.</description>',
    items,
    '</channel>',
    '</rss>',
  ].join('');
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
