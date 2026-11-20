import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://lightsteelblue-lark-427091.hostingersite.com';
const motionLab = process.env.TC_MOTION_LAB === '1';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/motion-lab/'),
    }),
    {
      name: 'motion-lab-pages',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (motionLab) return;
          await rm(new URL('motion-lab/', dir), { recursive: true, force: true });
        },
      },
    },
  ],
});
