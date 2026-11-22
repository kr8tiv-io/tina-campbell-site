/**
 * Read built HTML and check the photo spread.
 *
 * Counts one library photo per <img> (picture <source> tags are skipped),
 * plus a style="...url(...)" or <video poster> when that attribute names a
 * library file, and a 02A ribbon fill frame (data-strip-fill). Meta tags and JSON-LD do not count.
 *
 * Usage: node scripts/photo-audit.mjs <dist> <photos-dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const RETIRED = ['ig_profile_02'];

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const RUNWAY_PAGES = new Set(['/runway/', '/series/runway-nights/']);

function libraryIds(photosDir) {
  return fs
    .readdirSync(photosDir)
    .filter((name) => name.toLowerCase().endsWith('.jpg'))
    .map((name) => name.replace(/\.jpg$/i, ''));
}

function idPattern(ids) {
  const ordered = [...ids].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const body = ordered.map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`(?:^|[^A-Za-z0-9_])(${body})(?=[^A-Za-z0-9_]|$)`);
}

function pageFrom(distDir, file) {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  if (rel === '404.html') return '/404.html';
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function htmlFiles(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
    }
  };
  walk(dir);
  return out.sort();
}

function visibleHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

function attrsOf(raw) {
  return raw || '';
}

function interesting(name, attrs) {
  if (name === 'source') return false;
  if (name === 'img') return true;
  if (name === 'video' && /\bposter\s*=/.test(attrs)) return true;
  // 02A ribbon lead and tail frames are drawn from a data attribute, so they count like an <img>.
  if (/\bdata-strip-fill\s*=/.test(attrs)) return true;
  if (/\bstyle\s*=\s*"[^"]*url\(/i.test(attrs)) return true;
  return false;
}

function runwayAllowed(page, elements) {
  // /work/ is the archive: every library photo, including runway, appears there once.
  if (page === '/work/' || RUNWAY_PAGES.has(page)) return true;
  return elements.some((el) => {
    const attrs = el.attrs;
    if (/\bdata-home-runway\b/.test(attrs)) return true;
    if (/\bdata-strip-frame\s*=\s*["']Runway["']/.test(attrs)) return true;
    if (/\bdata-service\s*=\s*["']runway["']/.test(attrs)) return true;
    return false;
  });
}

function scanHtml(html, pattern) {
  const clean = visibleHtml(html);
  const re = /<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)(\s[^<>]*?)?\s*(\/?)>/g;
  const stack = [];
  const hits = [];
  let match;
  while ((match = re.exec(clean))) {
    if (match[1]) {
      const name = match[1].toLowerCase();
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const name = match[2].toLowerCase();
    const attrs = attrsOf(match[3]);
    const el = { name, attrs };
    if (interesting(name, attrs)) {
      const found = pattern.exec(attrs);
      if (found) hits.push({ id: found[1], elements: [...stack, el] });
    }
    if (match[4] !== '/' && !VOID.has(name)) stack.push(el);
  }
  return hits;
}

export function auditPhotos(distDir, photosDir) {
  const ids = libraryIds(photosDir);
  const known = new Set(ids);
  const pattern = idPattern(ids);
  const perPage = new Map();
  const pagesOf = new Map();

  for (const file of htmlFiles(distDir)) {
    const page = pageFrom(distDir, file);
    const counts = new Map();
    const html = fs.readFileSync(file, 'utf8');
    for (const hit of scanHtml(html, pattern)) {
      if (!known.has(hit.id)) continue;
      counts.set(hit.id, (counts.get(hit.id) || 0) + 1);
      if (!pagesOf.has(hit.id)) pagesOf.set(hit.id, new Map());
      const where = pagesOf.get(hit.id);
      if (!where.has(page)) where.set(page, []);
      where.get(page).push(hit);
    }
    perPage.set(page, counts);
  }

  const violations = [];
  const retired = new Set(RETIRED);

  for (const [page, counts] of perPage) {
    for (const [id, count] of counts) {
      if (count > 1) violations.push(`${id} appears ${count} times on ${page}`);
    }
  }

  for (const id of retired) {
    const where = pagesOf.get(id);
    if (where && where.size > 0) {
      violations.push(`retired ${id} is rendered on ${[...where.keys()].sort().join(', ')}`);
    }
  }

  for (const [id, where] of pagesOf) {
    const outside = [...where.keys()].filter((page) => page !== '/work/');
    if (outside.length > 3) {
      violations.push(`${id} is on ${outside.length} pages besides /work/: ${outside.sort().join(', ')}`);
    }
    if (id.endsWith('_runway')) {
      for (const [page, hits] of where) {
        const bad = hits.filter((hit) => !runwayAllowed(page, hit.elements));
        if (bad.length > 0) {
          violations.push(`${id} is outside a runway section on ${page}`);
        }
      }
    }
  }

  const work = perPage.get('/work/') || new Map();
  for (const id of ids) {
    if (retired.has(id)) continue;
    const count = work.get(id) || 0;
    if (count !== 1) violations.push(`${id} appears ${count} times on /work/ (expected 1)`);
  }

  const used = [...pagesOf.keys()].filter((id) => !retired.has(id));
  return {
    pages: perPage.size,
    library: ids.length,
    used: used.length,
    violations,
    perPage: Object.fromEntries(
      [...perPage.entries()].map(([page, counts]) => [page, Object.fromEntries(counts)]),
    ),
    pagesOf: Object.fromEntries(
      [...pagesOf.entries()].map(([id, where]) => [id, [...where.keys()].sort()]),
    ),
  };
}

function printReport(result) {
  const site = new Map();
  for (const [id, pages] of Object.entries(result.pagesOf)) site.set(id, pages.length);
  let uses = 0;
  for (const counts of Object.values(result.perPage)) {
    for (const count of Object.values(counts)) uses += count;
  }
  console.log(
    `pages ${result.pages} distinct used ${result.used} of library ${result.library} total uses ${uses}`,
  );
  if (result.violations.length === 0) console.log('violations 0');
  else {
    console.log(`violations ${result.violations.length}`);
    for (const line of result.violations) console.log(`  ${line}`);
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entry) {
  const distDir = process.argv[2];
  const photosDir = process.argv[3];
  if (!distDir || !photosDir) {
    console.error('usage: node scripts/photo-audit.mjs <dist> <photos-dir>');
    process.exit(2);
  }
  const result = auditPhotos(path.resolve(distDir), path.resolve(photosDir));
  printReport(result);
  process.exit(result.violations.length === 0 ? 0 : 1);
}
