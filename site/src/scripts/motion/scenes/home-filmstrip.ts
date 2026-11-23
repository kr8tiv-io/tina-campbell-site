/**
 * Home 02A film-gate strip. Scroll scrub on a barrel of seven frames.
 * The WebGL ribbon is the shared runway curvedStrip, with the gate options.
 */

import { gsap, isRecordMode, ScrollTrigger } from '../runtime';
import { sceneGateId } from '../scene-video';
import type { CurvedStrip, ProjectedFrame } from '../../webgl/curvedStrip';

interface FilmApi {
  setProgress: (progress: number) => void;
  frames: () => ProjectedFrame[];
}

const STEPS = 6;

/** Phone only. Desktop keeps the 7-across barrel. Three frames, centre large, ribbon shifted up for the labels. */
const PHONE = {
  visible: 1.82,
  segments: 12,
  centreScale: 1.06,
  persp: 0.012,
  edgeLift: 0.22,
  tilt: -5,
  midFrac: 0.018,
  holes: 8,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function phoneLayout(): boolean {
  return window.innerWidth < 760;
}

function canWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function holdCaptures(): boolean {
  return document.documentElement.dataset.filmHold === '1';
}

function markReady(): void {
  window.__SCENE_READY__ = window.__SCENE_READY__ || {};
  window.__SCENE_READY__['02A'] = true;
}

function urlsOf(section: HTMLElement): string[] {
  return [...section.querySelectorAll<HTMLElement>('[data-texture]')].map(
    (item) => item.dataset.texture || item.querySelector('img')?.currentSrc || '',
  );
}

/** Unlinked real photos for the ribbon past the first and last category. */
function fillOf(section: HTMLElement, side: 'lead' | 'tail'): string[] {
  return [...section.querySelectorAll<HTMLElement>(`[data-strip-fill="${side}"]`)]
    .map((item) => item.dataset.fillTexture || '')
    .filter((url) => url.length > 0);
}

function centreOf(quad: ProjectedFrame['quad']): { x: number; y: number } {
  const x = quad.reduce((sum, point) => sum + point.x, 0) / quad.length;
  const y = quad.reduce((sum, point) => sum + point.y, 0) / quad.length;
  return { x, y };
}

export function initHomeFilmstrip(reduced: boolean, signal: AbortSignal): () => void {
  const live = document.querySelector<HTMLElement>('[data-sheet="live"]');
  if (!live || signal.aborted) return () => {};

  const gate = sceneGateId();
  const record = isRecordMode();
  if (gate === '02A') document.documentElement.classList.add('is-gate-02A');

  let dead = false;
  const stops: Array<() => void> = [];
  const stop = (): void => {
    if (dead) return;
    dead = true;
    stops.forEach((fn) => fn());
    document.documentElement.classList.remove('is-gate-02A', 'is-sheet-hold');
    if (window.__SCENE_TL__?.['02A']) delete window.__SCENE_TL__['02A'];
  };
  signal.addEventListener('abort', stop, { once: true });

  const begin = (): void => {
    if (dead) return;
    if (reduced || !canWebGL()) {
      mountCss(live);
      markReady();
      return;
    }
    void mountGl(live, { record, gate: gate === '02A', stops, dead: () => dead });
  };

  if (gate === '02A') begin();
  else {
    let started = false;
    const go = (): void => {
      if (started || dead) return;
      started = true;
      begin();
    };
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(() => go(), { timeout: 1500 });
      stops.push(() => window.cancelIdleCallback(idleId));
    } else {
      const timer = window.setTimeout(go, 700);
      stops.push(() => window.clearTimeout(timer));
    }
    const onScroll = (): void => {
      if (window.scrollY > window.innerHeight * 0.35) go();
    };
    window.addEventListener('scroll', onScroll, { passive: true, signal });
    stops.push(() => window.removeEventListener('scroll', onScroll));
  }

  return stop;
}

function mountCss(section: HTMLElement): void {
  section.classList.add('is-film-css');
  const items = [...section.querySelectorAll<HTMLElement>('.sheet__item')];
  const phone = phoneLayout();
  const mid = (items.length - 1) / 2;
  items.forEach((item, index) => {
    const delta = index - mid;
    // Three frames across the phone. The outer four stay in the DOM for no-JS, but this stand-in hides them.
    if (phone && Math.abs(delta) > 1.01) {
      item.classList.add('is-offstage');
      return;
    }
    item.classList.remove('is-offstage');
    if (phone) {
      const edge = Math.abs(delta) > 0.01;
      item.style.setProperty('--s', edge ? '0.960' : '1.000');
      item.style.setProperty('--sx', edge ? '0.980' : '1.000');
      item.style.setProperty('--dim', edge ? '0.720' : '1.100');
      return;
    }
    const nx = delta / 3.4;
    const ad = Math.min(Math.abs(nx), 1.25);
    const x2 = ad * ad;
    const scale = Math.min(1, Math.max(0.48, 1 - 0.48 * x2 + 0.08 * x2 * ad));
    const scaleX = 1 / (1 + 1.42 * Math.min(Math.abs(nx), 1.6) ** 2);
    const t = ad < 0.02 ? 0 : Math.min(1, (ad - 0.02) / 0.98);
    const dim = index === Math.round(mid) ? 1.1 : 1 - t * 0.43;
    item.style.setProperty('--s', scale.toFixed(3));
    item.style.setProperty('--sx', scaleX.toFixed(3));
    item.style.setProperty('--dim', dim.toFixed(3));
  });
}

interface MountFlags {
  record: boolean;
  gate: boolean;
  stops: Array<() => void>;
  dead: () => boolean;
}

async function mountGl(live: HTMLElement, flags: MountFlags): Promise<void> {
  let mod: typeof import('../../webgl/curvedStrip');
  try {
    mod = await import('../../webgl/curvedStrip');
  } catch {
    if (!flags.dead()) mountCss(live);
    markReady();
    return;
  }
  if (flags.dead()) return;

  const echo = document.querySelector<HTMLElement>('[data-sheet="echo"]');
  const urls = urlsOf(live).filter((url) => url.length > 0);
  if (urls.length === 0) {
    mountCss(live);
    markReady();
    return;
  }
  // The film is finite, so at the first and last category the side frames would be empty base.
  // Lead and tail frames fill them. They sit outside the scrub, which still runs category 0 to the last.
  const lead = fillOf(live, 'lead');
  const tail = fillOf(live, 'tail');
  const plain = (url: string) => ({ url, aspect: mod.STRIP.photoAspect, focusX: undefined });
  const frames = [
    ...lead.map(plain),
    ...urls.map((url, index) => ({
      url,
      aspect: mod.STRIP.photoAspect,
      // fb_109 carries a script mark on the left of the window. Anchor the cover to the right.
      focusX: index === 3 ? 0.95 : undefined,
    })),
    ...tail.map(plain),
  ];
  const first = lead.length;
  const categories = (all: ProjectedFrame[]): ProjectedFrame[] =>
    all.slice(first, first + urls.length).map((frame, index) => ({ ...frame, index }));
  const phone = phoneLayout();
  const shared = phone
    ? {
        grade: 'gate' as const,
        tilt: PHONE.tilt,
        darkRun: false,
        focusIndex: first,
        span: urls.length - 1,
        visible: PHONE.visible,
        segments: PHONE.segments,
        centreScale: PHONE.centreScale,
        persp: PHONE.persp,
        edgeLift: PHONE.edgeLift,
        midFrac: PHONE.midFrac,
        holes: PHONE.holes,
      }
    : {
        grade: 'gate' as const,
        tilt: -7,
        darkRun: false,
        focusIndex: first,
        span: urls.length - 1,
        visible: 7,
        segments: 16,
        centreScale: 1.08,
        persp: 0.035,
        edgeLift: 0,
      };

  const strips: CurvedStrip[] = [];
  const proxy = { p: 0 };
  let progress = 0;
  let trigger: ScrollTrigger | null = null;

  const placeLabels = (): void => {
    const strip = strips[0];
    if (!strip) return;
    const media = live.querySelector<HTMLElement>('.sheet__media');
    if (!media) return;
    const origin = media.getBoundingClientRect();
    const samples = categories(strip.frames());
    const narrow = phoneLayout();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const shown: Array<{
      item: HTMLElement;
      link: HTMLElement;
      label: HTMLElement | null;
      visLeft: number;
      visRight: number;
      rawTop: number;
      rawBottom: number;
    }> = [];
    live.querySelectorAll<HTMLElement>('.sheet__item').forEach((item) => {
      const index = Number(item.dataset.index || 0);
      const sample = samples[index];
      const link = item.querySelector<HTMLElement>('.sheet__link');
      const frame = item.querySelector<HTMLElement>('.sheet__frame');
      const label = item.querySelector<HTMLElement>('.sheet__label');
      if (!sample || !link) return;
      const xs = sample.quad.map((point) => point.x);
      const ys = sample.quad.map((point) => point.y);
      const rawLeft = Math.min(...xs);
      const rawRight = Math.max(...xs);
      const rawTop = Math.min(...ys);
      const rawBottom = Math.max(...ys);
      if (!narrow) {
        item.classList.remove('is-offstage');
        link.style.left = `${rawLeft - origin.left}px`;
        link.style.top = `${rawTop - origin.top}px`;
        link.style.width = `${Math.max(8, rawRight - rawLeft)}px`;
        link.style.height = `${Math.max(8, rawBottom - rawTop)}px`;
        return;
      }
      const visLeft = Math.max(0, rawLeft);
      const visRight = Math.min(viewW, rawRight);
      const visW = visRight - visLeft;
      // Off-screen frames must not widen the page. A zero box stays inside the viewport.
      if (visW < 48) {
        item.classList.add('is-offstage');
        if (label) {
          label.classList.add('is-offstage');
          label.style.display = 'none';
        }
        link.style.left = '0px';
        link.style.top = '0px';
        link.style.width = '0px';
        link.style.height = '0px';
        return;
      }
      item.classList.remove('is-offstage');
      if (label) {
        label.classList.remove('is-offstage');
        label.style.display = '';
      }
      link.style.left = `${visLeft - origin.left}px`;
      link.style.top = `${rawTop - origin.top}px`;
      link.style.width = `${visW}px`;
      link.style.height = 'auto';
      if (frame) frame.style.height = `${Math.max(8, rawBottom - rawTop)}px`;
      shown.push({ item, link, label, visLeft, visRight, rawTop, rawBottom });
    });
    if (!narrow || shown.length === 0) return;
    const rowTop = Math.max(...shown.map((entry) => entry.rawBottom)) + 4;
    const slots = shown.map((entry) => {
      const label = entry.label;
      let want = 72;
      if (label) {
        label.style.position = 'absolute';
        label.style.width = 'auto';
        label.style.right = 'auto';
        label.style.whiteSpace = 'nowrap';
        want = Math.max(label.scrollWidth, 48) + 4;
      }
      const centre = (entry.visLeft + entry.visRight) / 2;
      return { entry, want, centre, left: centre - want / 2 };
    });
    slots.sort((a, b) => a.centre - b.centre);
    const pad = 4;
    for (let i = 0; i < slots.length; i += 1) {
      const minLeft = i === 0 ? pad : slots[i - 1].left + slots[i - 1].want + 8;
      slots[i].left = Math.max(slots[i].left, minLeft);
    }
    const tail = slots[slots.length - 1];
    const overflow = tail.left + tail.want - (viewW - pad);
    if (overflow > 0) slots.forEach((slot) => {
      slot.left -= overflow;
    });
    slots.forEach((slot) => {
      const label = slot.entry.label;
      if (!label) return;
      label.style.left = `${slot.left - slot.entry.visLeft}px`;
      label.style.top = `${rowTop - slot.entry.rawTop}px`;
      label.style.width = `${slot.want}px`;
    });
    const poolTop = Math.max(50, (rowTop / viewH) * 100 - 14);
    live.style.setProperty('--pool-top', `${poolTop.toFixed(2)}%`);
  };

  const apply = (value: number, velocity = 0): void => {
    progress = clamp01(value);
    strips.forEach((strip) => {
      strip.setProgress(progress);
      if (velocity) strip.setVelocity(velocity);
    });
    live.dataset.sceneProgress = progress.toFixed(4);
    placeLabels();
  };

  const publish = (): void => {
    const api: FilmApi = {
      setProgress(next: number): void {
        const exact = clamp01(next);
        gsap.killTweensOf(proxy);
        apply(exact, 0);
        strips.forEach((strip) => strip.setVelocity(0));
        if (holdCaptures()) return;
        const snapped = Math.round(exact * STEPS) / STEPS;
        if (Math.abs(snapped - exact) < 0.0008) return;
        proxy.p = exact;
        gsap.to(proxy, {
          p: snapped,
          duration: 0.35,
          ease: 'power3.out',
          onUpdate: () => apply(proxy.p, Math.min(1, Math.abs(snapped - proxy.p) * 6)),
        });
      },
      frames(): ProjectedFrame[] {
        return categories(strips[0]?.frames() ?? []);
      },
    };
    const bag = (window.__SCENE_TL__ ?? {}) as unknown as Record<string, FilmApi>;
    bag['02A'] = api;
    window.__SCENE_TL__ = bag as unknown as Window['__SCENE_TL__'];
  };

  const canvas = live.querySelector<HTMLCanvasElement>('[data-sheet-canvas]');
  if (!canvas) {
    mountCss(live);
    markReady();
    return;
  }

  let ready = false;
  const liveStrip = mod.mountCurvedStrip(canvas, frames, {
    ...shared,
    signal: new AbortController().signal,
    onReady: () => {
      if (flags.dead()) return;
      ready = true;
      live.classList.add('is-film-gl');
      liveStrip.resize();
      apply(progress, 0);
      publish();
      markReady();
    },
  });
  strips.push(liveStrip);
  flags.stops.push(() => liveStrip.destroy());

  const echoCanvas = echo?.querySelector<HTMLCanvasElement>('[data-sheet-canvas]');
  if (echo && echoCanvas) {
    const echoStrip = mod.mountCurvedStrip(echoCanvas, frames, {
      ...shared,
      segments: Math.max(6, (shared.segments ?? 8) - 4),
      signal: new AbortController().signal,
      onReady: () => {
        if (flags.dead()) return;
        echo.classList.add('is-film-gl');
        echoStrip.resize();
        echoStrip.setProgress(progress);
      },
    });
    strips.push(echoStrip);
    flags.stops.push(() => echoStrip.destroy());
  }

  const onResize = (): void => {
    strips.forEach((strip) => strip.resize());
    placeLabels();
  };
  window.addEventListener('resize', onResize);
  flags.stops.push(() => window.removeEventListener('resize', onResize));

  const onWheel = (event: WheelEvent): void => {
    const speed = Math.min(1, Math.abs(event.deltaY) / 28);
    strips.forEach((strip) => strip.setVelocity(Math.max(speed, 0.35)));
  };
  window.addEventListener('wheel', onWheel, { passive: true });
  flags.stops.push(() => window.removeEventListener('wheel', onWheel));

  live.querySelectorAll<HTMLAnchorElement>('.sheet__link').forEach((link, index) => {
    const onFocus = (): void => {
      const next = index / STEPS;
      if (flags.record || !trigger) {
        apply(next, 0);
        return;
      }
      const span = Math.max(1, trigger.end - trigger.start);
      window.__tcMotion?.scrollTo(trigger.start + next * span);
    };
    link.addEventListener('focus', onFocus);
    flags.stops.push(() => link.removeEventListener('focus', onFocus));
  });

  if (!flags.record && !reducedMotion()) {
    const pair = live.closest<HTMLElement>('[data-seam-pair="01A-02A"]');
    if (pair) {
      const scrub = document.createElement('div');
      scrub.className = 'sheet-scrub';
      scrub.dataset.sheetScrub = '';
      pair.after(scrub);
      trigger = ScrollTrigger.create({
        trigger: scrub,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Above the seam pins (default 0) so a later refresh measures this spacer first.
        refreshPriority: 1,
        snap: {
          snapTo: 1 / STEPS,
          duration: 0.35,
          ease: 'power3.out',
          // Phone only. The default follows scroll direction, so a short upward move
          // near the last frame snapped back to frame 5. Nearest frame on both ways.
          ...(phone ? { directional: false } : {}),
        },
        onToggle: (self) => {
          if (!self.isActive) document.documentElement.classList.remove('is-sheet-hold');
        },
        onUpdate: (self) => {
          document.documentElement.classList.toggle('is-sheet-hold', self.progress > 0.02 && self.progress < 0.995);
          const lenis = Math.min(1, Math.abs(window.__tcScrollVelocity || 0) / 90);
          const scrolled = Math.min(1, Math.abs(self.getVelocity()) / 1600);
          apply(self.progress, Math.max(lenis, scrolled));
        },
      });
      // The spacer lands after the load refresh. Sort by page position, then
      // remeasure, or 02A-03B keeps a start short by this element's height.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      flags.stops.push(() => {
        trigger?.kill();
        scrub.remove();
        document.documentElement.classList.remove('is-sheet-hold');
      });
    }
  }

  const tick = (): void => {
    if (flags.dead() || !ready) return;
    if (flags.record) {
      strips.forEach((strip) => strip.setFlicker(1));
      return;
    }
    const phase = (performance.now() / 1000) % 6;
    let flicker = 1;
    if (phase > 2.5 && phase < 4) {
      const u = (phase - 2.5) / 1.5;
      flicker = 1 - 0.42 * Math.sin(u * Math.PI);
    }
    strips.forEach((strip) => strip.setFlicker(flicker));
  };
  gsap.ticker.add(tick);
  flags.stops.push(() => gsap.ticker.remove(tick));

  // Publish before textures so the gate can attach. Ready flips in onReady.
  publish();
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
