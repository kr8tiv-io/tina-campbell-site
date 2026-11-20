/**
 * Scene 07C C-print-stack. One 6.04 s step per series photo.
 * Top print slides up-left (strongest 1.0-2.0 s) and stays in frame.
 * The next print straightens and sharpens to centre by 5.5 s, then drifts.
 * Record mode exports a paused single step and does not pin.
 */

import { gsap, isRecordMode, ScrollTrigger } from '../runtime';

declare global {
  interface Window {
    __SCENE_TL__?: Record<string, gsap.core.Timeline>;
  }
}

const STEP = 6.04;
const STRIDE = 6.08;
const SHADOW_REST = '0px 18px 28px rgba(0,0,0,0.28)';
const SHADOW_LIFT = '0px 46px 64px rgba(0,0,0,0.55)';
const SHADOW_SETTLE = '0px 16px 26px rgba(0,0,0,0.30)';

function headerOffset(): number {
  const header = document.querySelector<HTMLElement>('.site-header');
  return header?.offsetHeight || 96;
}

function addStep(tl: gsap.core.Timeline, cards: HTMLElement[], index: number, at: number): void {
  const count = cards.length;
  const top = cards[index % count];
  const next = cards[(index + 1) % count];
  const back = cards[(index + 2) % count];
  if (!top || !next || !back) return;
  if (top === next || next === back || top === back) return;

  const now = at === 0;
  const live = new Set([top, next, back]);
  cards.forEach((card) => {
    if (live.has(card)) return;
    tl.set(card, { autoAlpha: 0, immediateRender: now }, at);
  });

  tl.set(
    top,
    {
      x: 0,
      y: 0,
      xPercent: 6,
      yPercent: -4,
      rotation: 3,
      scale: 1,
      filter: 'blur(0px)',
      zIndex: 5,
      autoAlpha: 1,
      boxShadow: SHADOW_REST,
      transformOrigin: '50% 40%',
      immediateRender: now,
    },
    at,
  );
  tl.to(
    top,
    { xPercent: 4, yPercent: -6, rotation: 2.2, duration: 1, ease: 'sine.out', immediateRender: false },
    at,
  );
  tl.to(
    top,
    {
      xPercent: -40,
      yPercent: -30,
      rotation: -8,
      boxShadow: SHADOW_LIFT,
      duration: 1,
      ease: 'power2.inOut',
      immediateRender: false,
    },
    at + 1,
  );
  tl.to(
    top,
    {
      xPercent: -48,
      yPercent: -36,
      rotation: -10,
      boxShadow: SHADOW_SETTLE,
      duration: 3.5,
      ease: 'sine.inOut',
      immediateRender: false,
    },
    at + 2,
  );
  tl.to(top, { rotation: -8.5, duration: 0.54, ease: 'sine.inOut', immediateRender: false }, at + 5.5);

  tl.set(
    next,
    {
      x: 0,
      y: 0,
      xPercent: 10,
      yPercent: 16,
      rotation: 8,
      scale: 0.92,
      filter: 'blur(8px)',
      zIndex: 4,
      autoAlpha: 1,
      boxShadow: SHADOW_REST,
      transformOrigin: '50% 40%',
      immediateRender: now,
    },
    at,
  );
  tl.to(
    next,
    {
      xPercent: 0,
      yPercent: 0,
      rotation: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 4.5,
      ease: 'cine',
      immediateRender: false,
    },
    at + 1,
  );
  tl.set(next, { zIndex: 6, immediateRender: false }, at + 2);
  tl.to(next, { rotation: 1.4, duration: 0.54, ease: 'sine.inOut', immediateRender: false }, at + 5.5);

  tl.set(
    back,
    {
      x: 0,
      y: 0,
      xPercent: -16,
      yPercent: 2,
      rotation: -6,
      scale: 0.95,
      filter: 'blur(0px)',
      zIndex: 3,
      autoAlpha: 1,
      boxShadow: SHADOW_REST,
      transformOrigin: '50% 40%',
      immediateRender: now,
    },
    at,
  );
  tl.to(
    back,
    {
      xPercent: -10,
      yPercent: 6,
      rotation: -2,
      scale: 0.98,
      duration: 4.5,
      ease: 'cine',
      immediateRender: false,
    },
    at + 1,
  );
  tl.to(back, { rotation: -0.6, duration: 0.54, ease: 'sine.inOut', immediateRender: false }, at + 5.5);

  if (at === 0) {
    tl.addLabel('hold', 0);
    tl.addLabel('slide', 1);
    tl.addLabel('slideEnd', 2);
    tl.addLabel('settle', 5.5);
    tl.addLabel('driftEnd', STEP);
  }
}

export function initPrintStack(reduced: boolean, signal: AbortSignal): () => void {
  const html = document.documentElement;
  const cover = document.querySelector<HTMLElement>('[data-print-stack]');
  const cards = cover ? [...cover.querySelectorAll<HTMLElement>('.print')] : [];

  const releaseClass = (): void => {
    html.classList.remove('print-live');
  };

  if (!cover || cards.length < 3) {
    releaseClass();
    return () => {};
  }

  if (reduced) {
    releaseClass();
    const stopReduced = (): void => releaseClass();
    signal.addEventListener('abort', stopReduced, { once: true });
    return stopReduced;
  }

  const record = isRecordMode();
  const steps = record ? 1 : cards.length;
  // The loose-start CSS transform is only for the first paint. GSAP would add
  // xPercent on top of it, so clear it before the timeline records values.
  cards.forEach((card) => {
    card.style.transform = 'none';
    card.style.filter = 'none';
  });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'cine' } });
  for (let index = 0; index < steps; index += 1) addStep(tl, cards, index, index * STRIDE);

  window.__SCENE_TL__ = window.__SCENE_TL__ || {};
  window.__SCENE_TL__['07C'] = tl;

  const wide = window.innerWidth > 960;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let trigger: ScrollTrigger | null = null;
  if (!record && wide && fine) {
    const distance = steps * window.innerHeight;
    trigger = ScrollTrigger.create({
      trigger: cover,
      start: () => `top ${headerOffset()}px`,
      end: () => `+=${distance}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
    });
  } else if (!record) {
    trigger = ScrollTrigger.create({
      trigger: cover,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
      animation: tl,
    });
  }

  const stop = (): void => {
    trigger?.kill();
    if (window.__SCENE_TL__?.['07C'] === tl) delete window.__SCENE_TL__['07C'];
    tl.kill();
    releaseClass();
    gsap.set(cards, { clearProps: 'transform,filter,boxShadow,zIndex,opacity,visibility' });
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
