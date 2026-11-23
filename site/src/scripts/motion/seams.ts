import { DrawSVGPlugin, gsap, isRecordMode, ScrollTrigger, SplitText } from './runtime';

declare global {
  interface Window {
    __PROTO_TL__?: gsap.core.Timeline;
    __PROTO_READY__?: boolean;
    __PROTO_DONE__?: Promise<void>;
    __START_RECORD__?: () => Promise<void>;
    __SEAM_TABLES__?: Record<string, SeamTable>;
  }
}

interface SeamTableRow {
  start: number;
  dur: number;
  ease: string;
  stagger: number | string | null;
  n: number;
  target: string;
  props: Record<string, number | string>;
  from: Record<string, number | string> | null;
}

interface SeamTable {
  duration: number;
  defaults: string;
  pin: {
    start: string;
    end: string;
    scrub: number | boolean;
    anticipatePin: number;
    ratio: number;
  } | null;
  rows: SeamTableRow[];
}

const CLEAR_PROPS =
  'opacity,visibility,transform,filter,clipPath,background,backgroundColor,borderRadius,transformOrigin,zIndex';

/** Harness markup uses `.copy h1` / `.media`. Real sections use the same tweens on their own nodes. */
function titleOf(section: HTMLElement): Element | null {
  return section.querySelector('.copy h1') || section.querySelector('[data-seam-title]');
}

function mediaOf(section: HTMLElement): Element | null {
  return section.querySelector('.media') || section.querySelector('[data-seam-media]');
}

function extractTable(tl: gsap.core.Timeline): SeamTable {
  const st = tl.scrollTrigger || null;
  const name = (node: Element | null): string => {
    if (!node) return '';
    const id = node.id ? `#${node.id}` : '';
    const cls = node.getAttribute('class');
    const className = cls ? `.${cls.trim().split(/\s+/).join('.')}` : '';
    return id + className || node.tagName;
  };
  const norm = (value: unknown): number | string => {
    if (typeof value === 'number') return Math.round(value * 1000) / 1000;
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && !Array.isArray(value)) return JSON.stringify(value);
    return String(value);
  };
  const skip = new Set([
    'ease',
    'duration',
    'stagger',
    'delay',
    'onComplete',
    'onUpdate',
    'onStart',
    'immediateRender',
    'lazy',
    'callbackScope',
    'overwrite',
    'parent',
    'runBackwards',
    'startAt',
    'data',
    'id',
    'paused',
    'yoyo',
    'repeat',
    'keyframes',
  ]);
  const rows = tl.getChildren(true, true, true).map((child) => {
    const tween = child as gsap.core.Tween;
    const vars = (tween.vars || {}) as Record<string, unknown>;
    const props: Record<string, number | string> = {};
    Object.keys(vars)
      .sort()
      .forEach((key) => {
        if (!skip.has(key)) props[key] = norm(vars[key]);
      });
    const startAt = vars.startAt as Record<string, unknown> | undefined;
    const from = startAt
      ? Object.fromEntries(
          Object.keys(startAt)
            .sort()
            .filter((key) => !skip.has(key))
            .map((key) => [key, norm(startAt[key])]),
        )
      : null;
    const targets = tween.targets ? tween.targets() : [];
    const first = targets[0] instanceof Element ? targets[0] : null;
    return {
      start: Math.round(tween.startTime() * 1000) / 1000,
      dur: Math.round(tween.duration() * 1000) / 1000,
      ease: vars.ease ? String(vars.ease) : 'default',
      stagger: vars.stagger === undefined ? null : norm(vars.stagger),
      n: targets.length,
      target: first ? name(first) : '',
      props,
      from,
    };
  });
  return {
    duration: Math.round(tl.duration() * 1000) / 1000,
    defaults: JSON.stringify(tl.vars.defaults || {}),
    pin: st
      ? {
          start: String(st.vars.start),
          end: String(st.vars.end),
          scrub: st.vars.scrub as number | boolean,
          anticipatePin: Number(st.vars.anticipatePin || 0),
          ratio: Math.round(((st.end - st.start) / innerHeight) * 1000) / 1000,
        }
      : null,
    rows,
  };
}

function layer(className: string, attr: string): HTMLElement {
  const node = document.createElement('div');
  node.className = className;
  node.setAttribute(attr, '');
  node.setAttribute('aria-hidden', 'true');
  return node;
}

/** The echo sheet stays empty in the markup so reduced motion does not wait on hidden images. */
function fillSheetEcho(): void {
  const live = document.querySelector<HTMLElement>('[data-seam-pair="01A-02A"] .sheet:not(.sheet--echo) .sheet__row');
  const echo = document.querySelector<HTMLElement>('[data-seam-pair="02A-03B"] .sheet--echo .sheet__row');
  if (!live || !echo || echo.childElementCount > 0) return;
  live.querySelectorAll<HTMLElement>(':scope > li').forEach((item) => {
    const clone = item.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return;
    clone.querySelectorAll('a').forEach((anchor) => anchor.setAttribute('tabindex', '-1'));
    echo.append(clone);
  });
}

/**
 * The work echo is the incoming three-up for seam 04B-05C. The pictures are
 * cloned here so /work/ HTML still contains each library photo once.
 */
function fillWorkEcho(): void {
  const row = document.querySelector<HTMLElement>('.work-echo__row');
  if (!row || row.childElementCount > 0) return;
  const tiles = document.querySelectorAll<HTMLElement>('.work-live .tile');
  [...tiles].slice(0, 3).forEach((tile) => {
    const picture = tile.querySelector('picture');
    if (!picture) return;
    const cell = document.createElement('div');
    cell.className = 'work-echo__cell';
    cell.append(picture.cloneNode(true));
    row.append(cell);
  });
}

/** Masks, ink, flood and the loupe are decorative. They are never headings or copy. */
function ensurePairLayers(seam: HTMLElement): void {
  const stage = seam.querySelector('[data-stage]');
  if (!(stage instanceof HTMLElement)) return;
  const pair = seam.dataset.seamPair || '';
  if (pair === '01A-02A' && !stage.querySelector('[data-ink]')) stage.append(layer('ink-layer', 'data-ink'));
  if (pair === '02A-03B' && !stage.querySelector('[data-flood]')) stage.append(layer('flood-layer', 'data-flood'));
  if (pair === '04B-05C' && !stage.querySelector('[data-loupe]')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'mask-svg');
    svg.setAttribute('viewBox', '0 0 1440 810');
    svg.setAttribute('aria-hidden', 'true');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('data-loupe', '');
    circle.setAttribute('cx', '720');
    circle.setAttribute('cy', '405');
    circle.setAttribute('r', '90');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#b3261e');
    circle.setAttribute('stroke-width', '6');
    svg.append(circle);
    stage.append(svg);
  }
}

const REDUCED = '(prefers-reduced-motion: reduce)';

const LOCKED: Record<string, string> = {
  '01A-02A': '01A-02A-A',
  '02A-03B': '02A-03B-C',
  '03B-04B': '03B-04B-A',
  '04B-05C': '04B-05C-C',
  '05C-06B': '05C-06B-A',
  '06B-07C': '06B-07C-C',
  '07C-08B': '07C-08B-C',
  '08B-09B': '08B-09B-C',
  '09B-10A': '09B-10A-B',
  '10A-11B': '10A-11B-B',
};

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED).matches;
}

function installRecordHook(): void {
  const params = new URLSearchParams(location.search);
  const hold = Number(params.get('hold') || 0.6);
  const dur = Number(params.get('dur') || 5.2);
  window.__START_RECORD__ = function () {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.__PROTO_DONE__ = new Promise((resolve) => {
      gsap.to(window, {
        scrollTo: { y: max, autoKill: false },
        duration: dur,
        ease: 'none',
        delay: hold,
        onComplete: () => {
          gsap.delayedCall(0.85, resolve);
        },
      });
    });
    return window.__PROTO_DONE__;
  };
  if (params.has('play') && !params.has('record')) {
    const ready = document.fonts?.ready ?? Promise.resolve();
    void ready.then(() => {
      void window.__START_RECORD__?.();
    });
  }
}

function showIncomingOnly(seam: HTMLElement): void {
  seam.querySelectorAll<HTMLElement>('.sec-out').forEach((node) => {
    node.style.opacity = '0';
  });
  seam.querySelectorAll<HTMLElement>('.sec-in').forEach((node) => {
    node.style.opacity = '1';
    node.style.pointerEvents = 'auto';
  });
  seam
    .querySelectorAll<HTMLElement>('.ink-layer, .flood-layer, .spot-layer, .veil-layer, .leak-layer, .mask-svg')
    .forEach((node) => {
      node.style.display = 'none';
    });
}

interface Mounted {
  timeline: gsap.core.Timeline;
  pair?: string;
  settle?: () => void;
  revert: () => void;
}

function mountSeam(seam: HTMLElement, root: ParentNode): Mounted | null {
  const stageQuery = seam.querySelector<HTMLElement>('[data-stage]');
  const trackQuery = seam.hasAttribute('data-track') ? seam : seam.querySelector<HTMLElement>('[data-track]');
  const outQuery = seam.querySelector<HTMLElement>('[data-out]');
  const inQuery = seam.querySelector<HTMLElement>('[data-in]');
  if (!stageQuery || !trackQuery || !outQuery || !inQuery) return null;
  const stage: HTMLElement = stageQuery;
  const track: HTMLElement = trackQuery;
  const outS: HTMLElement = outQuery;
  const inS: HTMLElement = inQuery;

  const navOut = [...root.querySelectorAll<HTMLElement>('[data-nav-out]')];
  const navIn = [...root.querySelectorAll<HTMLElement>('[data-nav-in]')];
  const splits: SplitText[] = [];
  const liveHarness = seam.hasAttribute('data-seam');
  const touched: Element[] = [];
  const deferred: Array<() => void> = [];

  function applySet(target: gsap.TweenTarget, vars: gsap.TweenVars): void {
    gsap.set(target, vars);
    if (liveHarness || target == null) return;
    gsap.utils.toArray(target).forEach((node) => {
      if (node instanceof Element) touched.push(node);
    });
    deferred.push(() => {
      gsap.set(target, vars);
    });
  }

  function releaseResting(): void {
    touched.forEach((node) => {
      gsap.set(node, { clearProps: CLEAR_PROPS });
    });
  }

  function split(el: Element | null): SplitText | null {
    if (!(el instanceof HTMLElement)) return null;
    const created = SplitText.create(el, { type: 'chars,words,lines', mask: 'chars' });
    splits.push(created);
    return created;
  }

  function swapNav(progress: number): void {
    navOut.forEach((anchor) => {
      if (progress > 0.55) anchor.removeAttribute('aria-current');
      else anchor.setAttribute('aria-current', 'page');
    });
    navIn.forEach((anchor) => {
      if (progress > 0.55) anchor.setAttribute('aria-current', 'page');
      else anchor.removeAttribute('aria-current');
    });
  }

  function pinTl(): gsap.core.Timeline {
    return gsap.timeline({
      defaults: { ease: 'cine', duration: 1 },
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        pin: stage,
        anticipatePin: 1,
        onToggle: (self) => {
          if (liveHarness) return;
          // Re-apply the from-state only as the pin engages. Releasing at the
          // end put the outgoing section back on top of the incoming one.
          if (self.isActive && self.progress < 0.04) deferred.forEach((fn) => fn());
        },
        onUpdate: (self) => swapNav(self.progress),
      },
    });
  }

  /* ---------- 01A → 02A ---------- */
  function t_01A_02A_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(ink, { yPercent: 100, zIndex: 8 });
    applySet(inS, { yPercent: 36, autoAlpha: 0, zIndex: 9 });
    if (inCopy) applySet(inCopy.chars, { yPercent: 110 });
    tl.to(mediaOf(outS), { yPercent: -12, scale: 1.08, duration: 1.2 }, 0);
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, opacity: 0, stagger: 0.02, duration: 0.55 }, 0.05);
    tl.to(ink, { yPercent: 0, duration: 0.65, ease: 'power2.inOut' }, 0.15);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.85, ease: 'power3.out' }, 0.38);
    if (inCopy) tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.52);
    tl.fromTo(
      mediaOf(inS),
      { yPercent: 18, filter: 'blur(8px)' },
      { yPercent: 0, filter: 'blur(0px)', duration: 0.7 },
      0.4,
    );
    tl.to(ink, { yPercent: 100, duration: 0.45, ease: 'power2.in' }, 0.72);
  }

  function t_01A_02A_B(tl: gsap.core.Timeline): void {
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0 });
    tl.to(
      mediaOf(outS),
      { scale: 0.34, yPercent: 6, xPercent: 0, borderRadius: 4, duration: 1 },
      0,
    );
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (outCopy) tl.to(outCopy.chars, { yPercent: 120, opacity: 0, stagger: 0.015, duration: 0.4 }, 0.05);
    tl.fromTo(inS, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.025, duration: 0.55 }, 0.5);
    }
  }

  function t_01A_02A_C(tl: gsap.core.Timeline): void {
    const brush = stage.querySelector('#brushPath');
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 1, clipPath: 'inset(0 0 0 100%)' });
    if (brush) applySet(brush, { drawSVG: '0% 0%' });
    if (outCopy) tl.to(outCopy.chars, { xPercent: -40, opacity: 0, stagger: 0.02, duration: 0.5 }, 0);
    if (brush) tl.to(brush, { drawSVG: '0% 100%', duration: 0.8, ease: 'power2.inOut' }, 0.05);
    tl.to(inS, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'power2.inOut' }, 0.15);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.45);
    }
    if (brush) {
      const svg = brush instanceof SVGElement ? brush.ownerSVGElement || brush : brush;
      tl.to(svg, { autoAlpha: 0, duration: 0.4 }, 0.72);
    }
  }

  /* ---------- 02A → 03B ---------- */
  function t_02A_03B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, scaleY: 0.42, yPercent: 8 });
    tl.to(mediaOf(outS), { scaleY: 1.55, scaleX: 0.92, yPercent: -6, duration: 0.8 }, 0);
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(inS, { autoAlpha: 1, scaleY: 1, yPercent: 0, duration: 0.85 }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.55);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_02A_03B_B(tl: gsap.core.Timeline): void {
    const spot = stage.querySelector('[data-spot]');
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, scale: 1.12 });
    applySet(spot, { autoAlpha: 0, '--sx': '18%', '--sy': '55%' });
    tl.to(outS, { filter: 'saturate(0) brightness(0.45)', duration: 0.4 }, 0);
    tl.to(spot, { autoAlpha: 1, duration: 0.3 }, 0.1);
    tl.to(spot, { '--sx': '50%', '--sy': '50%', duration: 0.8 }, 0.2);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    tl.to(outS, { autoAlpha: 0, duration: 0.35 }, 0.65);
    tl.to(spot, { autoAlpha: 0.4, duration: 0.4 }, 0.7);
    if (inCopy) {
      applySet(inCopy.chars, { opacity: 0, y: 30 });
      tl.to(inCopy.chars, { opacity: 1, y: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  function t_02A_03B_C(tl: gsap.core.Timeline): void {
    const flood = stage.querySelector('[data-flood]');
    const inCopy = split(titleOf(inS));
    applySet(flood, { yPercent: 100, background: 'linear-gradient(180deg,#4a0d1a 0%,#b3261e 40%,#1a0a12 100%)' });
    applySet(inS, { autoAlpha: 0, yPercent: 16, filter: 'blur(10px)' });
    const easeIn = gsap.parseEase('power2.in');
    const easeCine = gsap.parseEase('cine');
    // Page only. The tween list stays the harness table (seam_route_check). The
    // render holds the echo opaque and clips it to the flood edge, drift included,
    // so the strip is not faded to ink before the wash covers it.
    const paintClip = (): void => {
      if (liveHarness || !(flood instanceof HTMLElement)) return;
      const time = tl.time();
      const along = Math.min(1, Math.max(0, time / 0.55));
      const floodEdge = 1 - easeIn(along);
      let drift = 0;
      if (time >= 0.55) drift = 1;
      else if (time > 0.15) drift = easeCine((time - 0.15) / 0.4);
      const localEdge = floodEdge + drift * 0.1;
      const inset = Math.min(100, Math.max(0, (1 - localEdge) * 100));
      outS.style.clipPath = `inset(0% 0% ${inset.toFixed(3)}% 0%)`;
      // The followspot underneath is dark. Once the wash is full and starts
      // thinning, a 6% lift keeps a 16:9 frame from falling under the ink line.
      flood.style.filter = time >= 0.55 && time < 1.05 ? 'brightness(1.06)' : '';
    };
    tl.to(
      flood,
      {
        yPercent: 0,
        duration: 0.55,
        ease: 'power2.in',
        onUpdate: () => {
          paintClip();
        },
      },
      0,
    );
    tl.to(
      outS,
      {
        autoAlpha: 0,
        yPercent: -10,
        duration: 0.4,
        onUpdate(this: gsap.core.Tween) {
          if (liveHarness) return;
          if (tl.time() < 0.549 && this.progress() < 1) {
            outS.style.opacity = '1';
            outS.style.visibility = 'visible';
          }
          paintClip();
        },
      },
      0.15,
    );
    tl.to(inS, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.7 }, 0.4);
    tl.to(flood, { autoAlpha: 0, duration: 0.5, onUpdate: () => { paintClip(); } }, 0.55);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 03B → 04B ---------- */
  function t_03B_04B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, rotate: -4, yPercent: -20, scale: 0.86 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(mediaOf(outS), { yPercent: 40, rotate: 3, scale: 0.8, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotate: 0, yPercent: 0, scale: 1, duration: 0.85, ease: 'power3.out' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.55);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_03B_04B_B(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' });
    tl.to(mediaOf(outS), { filter: 'grayscale(1) brightness(0.7)', yPercent: 8, duration: 0.6 }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power2.inOut' }, 0.2);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.7);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_03B_04B_C(tl: gsap.core.Timeline): void {
    const spot = stage.querySelector('[data-spot]');
    const inCopy = split(titleOf(inS));
    applySet(spot, { autoAlpha: 1, '--sx': '50%', '--sy': '50%' });
    applySet(inS, { autoAlpha: 0, scale: 1.2 });
    tl.to(spot, { '--sx': '50%', '--sy': '48%', duration: 0.3 }, 0);
    tl.to(mediaOf(outS), { scale: 0.42, duration: 0.7 }, 0.1);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    tl.to(spot, { autoAlpha: 0, duration: 0.45 }, 0.55);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 04B → 05C ---------- */
  function t_04B_05C_A(tl: gsap.core.Timeline): void {
    const outCopy = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, yPercent: -18, rotate: -5, scale: 1.08 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.35 }, 0);
    tl.to(mediaOf(outS), { yPercent: -30, rotate: 4, scale: 0.9, duration: 0.65 }, 0);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, rotate: 0, scale: 1, duration: 0.85, ease: 'back.out(1.2)' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.55);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_04B_05C_B(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(titleOf(inS));
    applySet(ink, { scale: 0, borderRadius: '50%', background: '#b3261e' });
    applySet(inS, { autoAlpha: 0 });
    tl.to(ink, { scale: 18, duration: 0.7, ease: 'power2.in' }, 0);
    tl.set(ink, { background: '#0c0c0f' }, 0.45);
    tl.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.45);
    tl.to(ink, { autoAlpha: 0, duration: 0.45 }, 0.65);
    tl.to(outS, { autoAlpha: 0, duration: 0.2 }, 0.5);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.6);
    }
  }

  function t_04B_05C_C(tl: gsap.core.Timeline): void {
    const loupe = stage.querySelector('[data-loupe]');
    const inCopy = split(titleOf(inS));
    applySet(loupe, { scale: 0.15, autoAlpha: 1 });
    applySet(inS, { autoAlpha: 0, clipPath: 'circle(8% at 50% 50%)' });
    tl.to(loupe, { scale: 1.15, duration: 0.85, ease: 'power2.inOut' }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'circle(80% at 50% 50%)', duration: 0.85, ease: 'power2.inOut' }, 0.1);
    tl.to(loupe, { autoAlpha: 0, duration: 0.3 }, 0.7);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.65);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 05C → 06B ---------- */
  function t_05C_06B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(titleOf(outS));
    const inTitle = split(titleOf(inS));
    const thread = stage.querySelector('#threadPath');
    applySet(inS, { autoAlpha: 0, xPercent: 28, scale: 0.86 });
    if (thread) applySet(thread, { drawSVG: '0% 0%' });
    if (outCopy) tl.to(outCopy.chars, { xPercent: -30, opacity: 0, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(mediaOf(outS), { xPercent: -18, scale: 0.92, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 0.8 }, 0.25);
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.7, ease: 'power1.inOut' }, 0.4);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inTitle) {
      applySet(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.45);
    }
  }

  function t_05C_06B_B(tl: gsap.core.Timeline): void {
    const thread = stage.querySelector('#threadPath');
    const inTitle = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, clipPath: 'inset(0 0 0 50%)' });
    if (thread) applySet(thread, { drawSVG: '0% 0%' });
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.55 }, 0);
    tl.to(mediaOf(outS), { xPercent: -8, duration: 0.8 }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.85, ease: 'power2.inOut' }, 0.2);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.65);
    if (inTitle) {
      applySet(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.4);
    }
  }

  function t_05C_06B_C(tl: gsap.core.Timeline): void {
    const inTitle = split(titleOf(inS));
    const thread = stage.querySelector('#threadPath');
    applySet(inS, { autoAlpha: 0, rotateY: -18, transformOrigin: 'right center' });
    if (thread) applySet(thread, { drawSVG: '0% 0%' });
    tl.to(mediaOf(outS), { rotateY: 12, xPercent: -10, duration: 0.65 }, 0);
    tl.to(inS, { autoAlpha: 1, rotateY: 0, duration: 0.8 }, 0.25);
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.65 }, 0.4);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inTitle) {
      applySet(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.45);
    }
  }

  /* ---------- 06B → 07C ---------- */
  function t_06B_07C_A(tl: gsap.core.Timeline): void {
    const outTitle = split(titleOf(outS));
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, rotate: -8, yPercent: 16, scale: 0.82, transformOrigin: '50% 50%' });
    if (outTitle) tl.to(outTitle.chars, { yPercent: -110, stagger: 0.015, duration: 0.4 }, 0);
    tl.to(mediaOf(outS), { scale: 0.7, rotate: 6, xPercent: -8, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotate: 0, yPercent: 0, scale: 1, duration: 0.85, ease: 'power3.out' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_06B_07C_B(tl: gsap.core.Timeline): void {
    const thread = stage.querySelector('#threadPath');
    const inCopy = split(titleOf(inS));
    if (thread) applySet(thread, { drawSVG: '0% 100%' });
    applySet(inS, { autoAlpha: 0, xPercent: 20, rotate: 4 });
    if (thread) tl.to(thread, { drawSVG: '100% 100%', duration: 0.5, ease: 'power1.in' }, 0);
    tl.to(mediaOf(outS), { xPercent: -22, rotate: -3, duration: 0.7 }, 0.1);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, rotate: 0, duration: 0.75 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_06B_07C_C(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0, rotateY: 90, transformPerspective: 1600, transformOrigin: 'left center' });
    tl.to(outS, { rotateY: -55, transformPerspective: 1600, transformOrigin: 'right center', duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotateY: 0, duration: 0.75 }, 0.28);
    tl.to(outS, { autoAlpha: 0, duration: 0.2 }, 0.65);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  /* ---------- 07C → 08B ---------- */
  function t_07C_08B_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(titleOf(inS));
    applySet(ink, { yPercent: 100 });
    applySet(inS, { autoAlpha: 0, scale: 1.08 });
    tl.to(ink, { yPercent: 0, duration: 0.7, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, yPercent: -8, duration: 0.4 }, 0.2);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.45);
    tl.to(ink, { autoAlpha: 0, duration: 0.5 }, 0.65);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.55);
    }
  }

  function t_07C_08B_B(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0 });
    applySet(ink, { yPercent: 100 });
    tl.to(mediaOf(outS), { scale: 1.35, duration: 0.7 }, 0);
    tl.to(outS.querySelector('.copy'), { autoAlpha: 0, duration: 0.3 }, 0);
    tl.to(ink, { yPercent: 0, duration: 0.65, ease: 'power2.in' }, 0.3);
    tl.to(inS, { autoAlpha: 1, duration: 0.6 }, 0.5);
    tl.to(ink, { autoAlpha: 0, duration: 0.4 }, 0.7);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.6);
    }
  }

  function t_07C_08B_C(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(titleOf(inS));
    applySet(ink, { xPercent: -100, background: 'linear-gradient(90deg,#0c0c0f 70%,transparent)' });
    applySet(inS, { autoAlpha: 0, xPercent: 12 });
    tl.to(ink, { xPercent: 0, duration: 0.6, ease: 'power2.inOut' }, 0);
    tl.to(outS, { xPercent: -10, autoAlpha: 0, duration: 0.5 }, 0.15);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, duration: 0.7 }, 0.4);
    tl.to(ink, { xPercent: 100, duration: 0.55 }, 0.55);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 08B → 09B ---------- */
  function t_08B_09B_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(titleOf(inS));
    applySet(ink, { autoAlpha: 1, yPercent: 0 });
    applySet(inS, { autoAlpha: 1 });
    applySet(mediaOf(inS), { yPercent: 18, scale: 1.08 });
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0);
    tl.to(ink, { yPercent: -110, duration: 0.9, ease: 'power2.inOut' }, 0.05);
    tl.to(mediaOf(inS), { yPercent: 0, scale: 1, duration: 1 }, 0.1);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.45);
    }
  }

  function t_08B_09B_B(tl: gsap.core.Timeline): void {
    const layers = inS.querySelectorAll('[data-layer]');
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 0 });
    if (layers.length) applySet(layers, { yPercent: (i: number) => 20 + i * 14, scale: 1.1 });
    tl.to(outS, { autoAlpha: 0, filter: 'blur(8px)', duration: 0.5 }, 0);
    tl.to(inS, { autoAlpha: 1, duration: 0.4 }, 0.2);
    if (layers.length) tl.to(layers, { yPercent: 0, scale: 1, stagger: 0.08, duration: 0.9 }, 0.2);
    else tl.fromTo(mediaOf(inS), { yPercent: 16, scale: 1.1 }, { yPercent: 0, scale: 1, duration: 0.9 }, 0.2);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.5);
    }
  }

  function t_08B_09B_C(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 1, clipPath: 'circle(0% at 50% 55%)' });
    tl.to(inS, { clipPath: 'circle(80% at 50% 55%)', duration: 1, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, scale: 1.06, duration: 0.6 }, 0.35);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  /* ---------- 09B → 10A ---------- */
  function t_09B_10A_A(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    const outCopy = split(titleOf(outS));
    applySet(inS, { autoAlpha: 0 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -80, opacity: 0, stagger: 0.02, duration: 0.45 }, 0);
    tl.to(mediaOf(outS), { scaleY: 0.62, yPercent: 0, duration: 0.8, transformOrigin: '50% 50%' }, 0.05);
    tl.to(inS, { autoAlpha: 1, duration: 0.6 }, 0.35);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    tl.fromTo(mediaOf(inS), { xPercent: -6 }, { xPercent: 0, duration: 0.9 }, 0.4);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_09B_10A_B(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    const outCopy = split(titleOf(outS));
    applySet(inS, { autoAlpha: 0, yPercent: 20 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(mediaOf(outS), { yPercent: -14, scale: 1.04, duration: 0.8 }, 0);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.75 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_09B_10A_C(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    applySet(inS, { autoAlpha: 1, clipPath: 'inset(100% 0 0 0)' });
    tl.to(inS, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power2.inOut' }, 0.05);
    tl.to(mediaOf(outS), { yPercent: -16, duration: 0.9 }, 0);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  /* ---------- 10A → 11B ---------- */
  function t_10A_11B_A(tl: gsap.core.Timeline): void {
    const veil = stage.querySelector('[data-veil]');
    const inCopy = split(titleOf(inS));
    applySet(veil, { xPercent: -130, autoAlpha: 1 });
    applySet(inS, { autoAlpha: 0 });
    tl.to(veil, { xPercent: 130, duration: 1, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, duration: 0.4 }, 0.25);
    tl.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.35);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  function t_10A_11B_B(tl: gsap.core.Timeline): void {
    const inCopy = split(titleOf(inS));
    const outCopy = split(titleOf(outS));
    applySet(inS, { autoAlpha: 0, yPercent: 40 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(outS, { yPercent: -60, duration: 0.8, ease: 'power2.inOut' }, 0.05);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.25);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  function t_10A_11B_C(tl: gsap.core.Timeline): void {
    const leak = stage.querySelector('[data-leak]');
    const veil = stage.querySelector('[data-veil]');
    const inCopy = split(titleOf(inS));
    applySet(leak, { autoAlpha: 0 });
    applySet(veil, { xPercent: -120, autoAlpha: 0.85 });
    applySet(inS, { autoAlpha: 0, filter: 'blur(10px) brightness(1.3)' });
    tl.to(leak, { autoAlpha: 1, duration: 0.35 }, 0);
    tl.to(veil, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.1);
    tl.to(inS, { autoAlpha: 1, filter: 'blur(0px) brightness(1)', duration: 0.7 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.4 }, 0.3);
    tl.to(leak, { autoAlpha: 0, duration: 0.45 }, 0.65);
    if (inCopy) {
      applySet(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  const map: Record<string, (tl: gsap.core.Timeline) => void> = {
    '01A-02A-A': t_01A_02A_A,
    '01A-02A-B': t_01A_02A_B,
    '01A-02A-C': t_01A_02A_C,
    '02A-03B-A': t_02A_03B_A,
    '02A-03B-B': t_02A_03B_B,
    '02A-03B-C': t_02A_03B_C,
    '03B-04B-A': t_03B_04B_A,
    '03B-04B-B': t_03B_04B_B,
    '03B-04B-C': t_03B_04B_C,
    '04B-05C-A': t_04B_05C_A,
    '04B-05C-B': t_04B_05C_B,
    '04B-05C-C': t_04B_05C_C,
    '05C-06B-A': t_05C_06B_A,
    '05C-06B-B': t_05C_06B_B,
    '05C-06B-C': t_05C_06B_C,
    '06B-07C-A': t_06B_07C_A,
    '06B-07C-B': t_06B_07C_B,
    '06B-07C-C': t_06B_07C_C,
    '07C-08B-A': t_07C_08B_A,
    '07C-08B-B': t_07C_08B_B,
    '07C-08B-C': t_07C_08B_C,
    '08B-09B-A': t_08B_09B_A,
    '08B-09B-B': t_08B_09B_B,
    '08B-09B-C': t_08B_09B_C,
    '09B-10A-A': t_09B_10A_A,
    '09B-10A-B': t_09B_10A_B,
    '09B-10A-C': t_09B_10A_C,
    '10A-11B-A': t_10A_11B_A,
    '10A-11B-B': t_10A_11B_B,
    '10A-11B-C': t_10A_11B_C,
  };

  const pair = seam.dataset.seam || seam.dataset.seamPair || '';
  const fn = map[LOCKED[pair] || ''];
  const timeline = pinTl();
  if (fn) fn(timeline);
  else {
    applySet(inS, { autoAlpha: 0 });
    timeline.to(outS, { autoAlpha: 0, duration: 0.5 }, 0);
    timeline.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.2);
  }

  const cleanups: Array<() => void> = [];
  if (!liveHarness && seam.dataset.seamPair === '04B-05C') {
    let opened = false;
    let armed = false;
    const arm = (): void => {
      armed = true;
    };
    const maybeOpen = (): void => {
      if (!armed || opened) return;
      const st = timeline.scrollTrigger;
      if (!st || st.progress < 1 || window.scrollY <= st.end + 1) return;
      opened = true;
      seam.classList.add('is-seam-open');
      document.documentElement.classList.add('is-seam-open');
      releaseResting();
      st.kill(true);
      ScrollTrigger.refresh();
    };
    window.addEventListener('wheel', arm, { passive: true });
    window.addEventListener('touchmove', arm, { passive: true });
    window.addEventListener('keydown', arm);
    window.addEventListener('scroll', maybeOpen, { passive: true });
    cleanups.push(() => {
      window.removeEventListener('wheel', arm);
      window.removeEventListener('touchmove', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('scroll', maybeOpen);
    });
  }

  return {
    timeline,
    pair: seam.dataset.seamPair,
    settle: () => {
      // The from-state stays on. Clearing it when the pin is idle covers the
      // outgoing section with the incoming one, or with a full ink layer.
    },
    revert: () => {
      cleanups.forEach((fn) => fn());
      timeline.scrollTrigger?.kill();
      timeline.kill();
      splits.forEach((item) => item.revert());
    },
  };
}

/** Build the locked timeline for every harness `[data-seam]` and real `[data-seam-pair]`. */
export function initSeams(root: ParentNode = document): () => void {
  window.ScrollTrigger = ScrollTrigger;
  void DrawSVGPlugin;
  installRecordHook();

  const harness = [...root.querySelectorAll<HTMLElement>('[data-seam]')];
  const pairs = [...root.querySelectorAll<HTMLElement>('[data-seam-pair]')];
  if (prefersReducedMotion()) {
    harness.forEach(showIncomingOnly);
    window.__PROTO_TL__ = undefined;
    window.__PROTO_READY__ = true;
    return () => {
      window.__PROTO_TL__ = undefined;
      window.__PROTO_READY__ = false;
    };
  }

  let cancelled = false;
  let mounted: Mounted[] = [];

  // The pin length has to exist before the route visual gate measures the
  // wrapper. That read happens 1.5s after load, which can beat font settling.
  if (pairs.length) document.documentElement.classList.add('is-seam-motion');

  const mount = (): void => {
    if (cancelled) return;
    if (pairs.length) document.documentElement.classList.add('is-seam-motion');
    fillSheetEcho();
    fillWorkEcho();
    pairs.forEach((seam) => ensurePairLayers(seam));
    const built = [...harness, ...pairs]
      .map((seam) => mountSeam(seam, root))
      .filter((item): item is Mounted => item !== null);
    mounted = built;
    const harnessTimeline = built.find((item) => !item.pair)?.timeline;
    window.__PROTO_TL__ = harnessTimeline ?? built[0]?.timeline;
    ScrollTrigger.refresh();
    built.forEach((item) => item.settle?.());
    if (isRecordMode()) {
      const tables: Record<string, SeamTable> = {};
      built.forEach((item) => {
        if (!item.pair) return;
        tables[item.pair] = extractTable(item.timeline);
      });
      window.__SEAM_TABLES__ = tables;
    }
    window.__PROTO_READY__ = true;
  };

  // Split after the locked serif is applied. A deferred module can run before
  // the swap, and the chapter title then wraps one line early.
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  void fontsReady.then(mount);

  return () => {
    cancelled = true;
    document.documentElement.classList.remove('is-seam-motion', 'is-seam-open');
    mounted.forEach((item) => item.revert());
    if (window.__PROTO_TL__ && mounted.some((item) => item.timeline === window.__PROTO_TL__)) {
      window.__PROTO_TL__ = undefined;
    }
    window.__PROTO_READY__ = false;
    if (window.__SEAM_TABLES__) window.__SEAM_TABLES__ = undefined;
  };
}
