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

/**
 * Phone visible box for label y, in viewport pixels.
 * Chrome iOS shrinks visualViewport while 100vh stays the large viewport, so
 * innerHeight would park the captions under the toolbar. The band is the
 * overlap of the on-screen sheet and that visual viewport.
 * A scrolled-away sheet keeps the same band inside its own box, so the offsets
 * copied onto the echo stay tied to the frames. A collapsed canvas (the sheet
 * leaving fixed layout) returns null and the caller keeps the last placement.
 */
function phoneVisibleBox(canvas: HTMLCanvasElement | null): { top: number; height: number } | null {
  const vv = window.visualViewport;
  const viewTop = vv && vv.height > 1 ? vv.offsetTop || 0 : 0;
  const viewH = vv && vv.height > 1 ? vv.height : window.innerHeight;
  if (!canvas || canvas.clientHeight < 2) return null;
  const canvasH = canvas.clientHeight;
  const rect = canvas.getBoundingClientRect();
  // Half a phone is a layout glitch, not the small viewport. Toolbars take
  // less than this (svh vs the large viewport is still most of the screen).
  if (canvasH < viewH * 0.55) return null;
  const overlaps = rect.bottom > viewTop + 24 && rect.top < viewTop + viewH - 24;
  const headed = rect.top > viewTop - 40 && rect.top < viewTop + 120;
  if (overlaps && headed) {
    const top = Math.max(rect.top, viewTop);
    const height = Math.min(canvasH, viewH - Math.max(0, rect.top - viewTop));
    if (height > 80) return { top, height };
  }
  return { top: rect.top, height: canvasH };
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
  echo?.querySelectorAll<HTMLElement>('.sheet__label').forEach((label) => {
    label.style.visibility = 'hidden';
  });
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
  let bridge: ScrollTrigger | null = null;

  const snapLabel = (label: HTMLElement, dpr: number): void => {
    const align = (value: number): number => Math.round(value * dpr) / dpr;
    const err = (value: number): number => Math.abs(value * dpr - Math.round(value * dpr));
    // Two passes. One CSS pixel of leftover is 3 device pixels at DPR 3, past the 0.02 gate.
    for (let pass = 0; pass < 2; pass += 1) {
      const rect = label.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (err(rect.left) <= 0.01 && err(rect.top) <= 0.01) return;
      const computed = getComputedStyle(label);
      const left = Number.parseFloat(computed.left);
      const top = Number.parseFloat(computed.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) return;
      label.style.right = 'auto';
      label.style.marginLeft = '0px';
      label.style.marginRight = '0px';
      label.style.left = `${left + align(rect.left) - rect.left}px`;
      label.style.top = `${top + align(rect.top) - rect.top}px`;
    }
  };

  const placeLabels = (): void => {
    const strip = strips[0];
    if (!strip) return;
    const media = live.querySelector<HTMLElement>('.sheet__media');
    if (!media) return;
    const origin = media.getBoundingClientRect();
    const samples = categories(strip.frames());
    const narrow = phoneLayout();
    const viewW = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    const canvas = live.querySelector<HTMLCanvasElement>('[data-sheet-canvas]');
    const px = (value: number): number => Math.round(value * dpr) / dpr;
    // Collapsed sheet while it unpins. Keep the echo on the last on-screen tops.
    const phoneVis = narrow ? phoneVisibleBox(canvas) : null;
    if (narrow && !phoneVis) return;
    const shown: Array<{
      item: HTMLElement;
      link: HTMLElement;
      label: HTMLElement | null;
      visLeft: number;
      visRight: number;
      rawTop: number;
      rawBottom: number;
    }> = [];
    const hideLabel = (label: HTMLElement | null): void => {
      if (!label) return;
      label.style.visibility = 'hidden';
    };
    live.querySelectorAll<HTMLElement>('.sheet__item').forEach((item) => {
      const index = Number(item.dataset.index || 0);
      const sample = samples[index];
      const link = item.querySelector<HTMLElement>('.sheet__link');
      const frame = item.querySelector<HTMLElement>('.sheet__frame');
      const label = item.querySelector<HTMLElement>('.sheet__label');
      if (!sample || !link) {
        hideLabel(label);
        return;
      }
      const xs = sample.quad.map((point) => point.x);
      const ys = sample.quad.map((point) => point.y);
      const rawLeft = Math.min(...xs);
      const rawRight = Math.max(...xs);
      const rawTop = Math.min(...ys);
      const rawBottom = Math.max(...ys);
      // A quad that has not landed yet sits at 0,0 and piles every caption.
      if (rawRight - rawLeft < 8) {
        hideLabel(label);
        return;
      }
      if (!narrow) {
        item.classList.remove('is-offstage');
        if (label) {
          label.classList.remove('is-offstage');
          label.style.display = '';
          label.style.visibility = 'visible';
        }
        const viewLeft = px(rawLeft);
        const viewTop = px(rawTop);
        link.style.left = `${viewLeft - origin.left}px`;
        link.style.top = `${viewTop - origin.top}px`;
        link.style.width = `${Math.max(8, px(rawRight) - viewLeft)}px`;
        link.style.height = `${Math.max(8, px(rawBottom) - viewTop)}px`;
        if (label) snapLabel(label, dpr);
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
          label.style.visibility = 'hidden';
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
        label.style.visibility = 'visible';
      }
      const viewLeft = px(visLeft);
      const viewTop = px(rawTop);
      link.style.left = `${viewLeft - origin.left}px`;
      link.style.top = `${viewTop - origin.top}px`;
      link.style.width = `${Math.max(8, px(visRight) - viewLeft)}px`;
      link.style.height = 'auto';
      if (frame) frame.style.height = `${Math.max(8, px(rawBottom) - viewTop)}px`;
      shown.push({ item, link, label, visLeft: viewLeft, visRight: px(visRight), rawTop: viewTop, rawBottom: px(rawBottom) });
    });
    if (narrow && shown.length > 0) {
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
      const gap = 8;
      for (let i = 0; i < slots.length; i += 1) {
        const minLeft = i === 0 ? pad : slots[i - 1].left + slots[i - 1].want + gap;
        const maxLeft = Math.max(pad, viewW - pad - slots[i].want);
        slots[i].left = Math.min(Math.max(slots[i].left, minLeft), maxLeft);
      }
      for (let i = slots.length - 1; i >= 0; i -= 1) {
        const maxLeft = Math.max(pad, viewW - pad - slots[i].want);
        if (slots[i].left > maxLeft) slots[i].left = maxLeft;
        if (i === 0) break;
        const prevMax = slots[i].left - gap - slots[i - 1].want;
        if (slots[i - 1].left > prevMax) slots[i - 1].left = Math.max(pad, prevMax);
      }
      slots.forEach((slot) => {
        const label = slot.entry.label;
        if (!label) return;
        label.style.left = `${px(slot.left) - slot.entry.visLeft}px`;
        label.style.width = `${px(slot.want)}px`;
      });
      // Keep the captions in the clear band of the small viewport. Under the
      // frames when that still fits; otherwise lifted onto the frame.
      let labelH = 32;
      slots.forEach((slot) => {
        const label = slot.entry.label;
        if (!label) return;
        labelH = Math.max(labelH, label.offsetHeight);
      });
      const vis = phoneVis;
      if (!vis) return;
      const bandTop = vis.top + vis.height * 0.18;
      const bandBottom = vis.top + Math.min(vis.height * 0.7, vis.height - 140);
      let lifted = rowTop;
      const limit = bandBottom - labelH;
      if (lifted > limit) lifted = limit;
      if (lifted < bandTop) lifted = bandTop;
      const snappedTop = px(lifted);
      slots.forEach((slot) => {
        const label = slot.entry.label;
        if (!label) return;
        label.style.top = `${snappedTop - slot.entry.rawTop}px`;
        snapLabel(label, dpr);
      });
      const sheetH = canvas && canvas.clientHeight > 1 ? canvas.clientHeight : vis.height;
      const poolTop = Math.max(50, (rowTop / sheetH) * 100 - 14);
      live.style.setProperty('--pool-top', `${poolTop.toFixed(2)}%`);
    }
    if (!echo) return;
    live.querySelectorAll<HTMLElement>('.sheet__item').forEach((item) => {
      const echoItem = echo.querySelector<HTMLElement>(`.sheet__item[data-index="${item.dataset.index ?? ''}"]`);
      if (!echoItem) return;
      const liveLink = item.querySelector<HTMLElement>('.sheet__link');
      const echoLink = echoItem.querySelector<HTMLElement>('.sheet__link');
      if (liveLink && echoLink) {
        echoLink.style.left = liveLink.style.left;
        echoLink.style.top = liveLink.style.top;
        echoLink.style.width = liveLink.style.width;
        echoLink.style.height = liveLink.style.height;
      }
      const liveFrame = item.querySelector<HTMLElement>('.sheet__frame');
      const echoFrame = echoItem.querySelector<HTMLElement>('.sheet__frame');
      if (liveFrame && echoFrame) echoFrame.style.height = liveFrame.style.height;
      const liveLabel = item.querySelector<HTMLElement>('.sheet__label');
      const echoLabel = echoItem.querySelector<HTMLElement>('.sheet__label');
      if (liveLabel && echoLabel) {
        echoLabel.style.left = liveLabel.style.left;
        echoLabel.style.top = liveLabel.style.top;
        echoLabel.style.right = liveLabel.style.right;
        echoLabel.style.width = liveLabel.style.width;
        echoLabel.style.marginLeft = liveLabel.style.marginLeft;
        echoLabel.style.marginRight = liveLabel.style.marginRight;
        echoLabel.style.display = liveLabel.style.display;
        echoLabel.style.visibility = liveLabel.style.visibility || 'hidden';
        echoLabel.classList.toggle('is-offstage', liveLabel.classList.contains('is-offstage'));
      }
      echoItem.classList.toggle('is-offstage', item.classList.contains('is-offstage'));
    });
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
  const viewport = window.visualViewport;
  if (viewport) {
    const onViewport = (): void => {
      if (!phoneLayout()) return;
      const root = document.documentElement;
      if (!root.classList.contains('is-sheet-hold') && !root.classList.contains('is-gate-02A')) return;
      strips.forEach((strip) => strip.resize());
      placeLabels();
    };
    viewport.addEventListener('resize', onViewport);
    flags.stops.push(() => viewport.removeEventListener('resize', onViewport));
  }

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
      // isActive is false at progress 0 and 1. The snapped last frame sits on
      // that pixel, which is also the bridge start, so the hold includes it
      // and drops only once the 02A-03B track has reached the top.
      const syncHold = (): void => {
        const scrubHold = Boolean(trigger && trigger.isActive && trigger.progress > 0.02);
        let bridgeHold = false;
        if (bridge) {
          const scroll = bridge.scroll();
          bridgeHold = scroll >= bridge.start - 1 && scroll < bridge.end;
        }
        const root = document.documentElement;
        const wasHeld = root.classList.contains('is-sheet-hold');
        const held = scrubHold || bridgeHold;
        root.classList.toggle('is-sheet-hold', held);
        // Entering the hold can change the sheet from the stage box to svh.
        // Leaving it must not remeasure: the live sheet has scrolled away and
        // a fresh placement would drag the echo labels off the pinned frame.
        if (!wasHeld && held && phoneLayout()) {
          window.requestAnimationFrame(() => {
            strips.forEach((strip) => strip.resize());
            placeLabels();
          });
        }
      };
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
        onToggle: () => {
          syncHold();
        },
        onUpdate: (self) => {
          syncHold();
          const lenis = Math.min(1, Math.abs(window.__tcScrollVelocity || 0) / 90);
          const scrolled = Math.min(1, Math.abs(self.getVelocity()) / 1600);
          apply(self.progress, Math.max(lenis, scrolled));
        },
      });
      const nextTrack = document.querySelector<HTMLElement>('[data-seam-pair="02A-03B"] [data-track]');
      if (nextTrack) {
        bridge = ScrollTrigger.create({
          trigger: scrub,
          start: 'bottom bottom',
          endTrigger: nextTrack,
          end: 'top top',
          refreshPriority: 1,
          onToggle: () => {
            syncHold();
          },
          onUpdate: () => {
            syncHold();
          },
        });
      }
      // The spacer lands after the load refresh. Sort by page position, then
      // remeasure, or 02A-03B keeps a start short by this element's height.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      syncHold();
      flags.stops.push(() => {
        trigger?.kill();
        bridge?.kill();
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
