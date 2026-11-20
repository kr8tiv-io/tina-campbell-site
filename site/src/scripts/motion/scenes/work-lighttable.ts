/**
 * Scene 05C C-light-table-drop. GSAP on the opening Work prints.
 * 0.0-0.5 empty table glow.
 * 0.5-2.0 fall (y -120vh, rotate ±18, scale 1.1, shadow 0 60px 80px).
 * 2.0-5.5 settle flat into the slots, ease cine, stagger 0.08, shadows tighten.
 * 5.2-5.8 crimson loupe ring, stroke 6, scales in.
 * Record mode exposes the paused timeline and does not move the resting grid.
 */

import { gsap, isRecordMode } from '../runtime';

declare global {
  interface Window {
    __SCENE_TL__?: Record<string, gsap.core.Timeline>;
  }
}

const FALL_Y = '-120vh';
const SHADOW_FALL = '0px 60px 80px rgba(0,0,0,0.55)';
const SHADOW_FLAT = '0px 8px 14px rgba(0,0,0,0.22)';
const STAGGER = 0.08;

function wideLayout(): boolean {
  return window.matchMedia('(min-width: 801px)').matches;
}

export function initWorkLightTable(reduced: boolean, signal: AbortSignal): () => void {
  const root = document.querySelector<HTMLElement>('[data-page="work"]');
  if (!root) return () => {};

  const prints = [...root.querySelectorAll<HTMLElement>('[data-light-print]')];
  const glow = root.querySelector<HTMLElement>('[data-light-table]');
  const ring = root.querySelector<HTMLElement>('.work-loupe__ring');
  const html = document.documentElement;
  const record = isRecordMode();

  const releaseClass = (): void => {
    html.classList.remove('work-intro', 'is-light-table');
  };

  if (prints.length === 0 || !glow || !ring) {
    releaseClass();
    return () => {};
  }

  if (reduced || !wideLayout()) {
    releaseClass();
    return () => {};
  }

  const settleDur = 3.5 - (prints.length - 1) * STAGGER;
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'cine', immediateRender: false },
  });

  tl.addLabel('glow', 0);
  tl.addLabel('fall', 0.5);
  tl.addLabel('land', 2);
  tl.addLabel('settle', 2);
  tl.addLabel('loupe', 5.2);
  tl.addLabel('loupeEnd', 5.8);
  tl.addLabel('hold', 6.04);

  prints.forEach((print, index) => {
    tl.set(
      print,
      {
        y: FALL_Y,
        rotation: index % 2 === 0 ? -18 : 18,
        scale: 1.1,
        zIndex: 2 + index,
        boxShadow: SHADOW_FALL,
        transformOrigin: '50% 50%',
        // Production parks the prints offscreen before work-intro lifts.
        // Record mode stays on the resting grid until a seek.
        immediateRender: !record,
      },
      0,
    );
  });

  tl.fromTo(
    glow,
    { autoAlpha: 0.15 },
    { autoAlpha: 1, duration: 0.5, ease: 'sine.out', immediateRender: false },
    0,
  );

  tl.to(
    prints,
    {
      y: '6vh',
      duration: 1.5,
      // power2.out crosses the viewport inside 0.5-2.0. power2.in holds -120vh
      // until the last frames, so the drop never reads on the page.
      ease: 'power2.out',
      immediateRender: false,
    },
    0.5,
  );

  tl.to(
    prints,
    {
      y: 0,
      rotation: 0,
      scale: 1,
      boxShadow: SHADOW_FLAT,
      duration: settleDur,
      stagger: STAGGER,
      ease: 'cine',
      immediateRender: false,
    },
    2,
  );

  tl.fromTo(
    ring,
    { scale: 0, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'cine', immediateRender: false },
    5.2,
  );

  tl.to(glow, { autoAlpha: 0, duration: 0.4, ease: 'power1.in', immediateRender: false }, 6.04);

  const mark = (): void => {
    html.classList.add('is-light-table');
  };
  tl.eventCallback('onUpdate', mark);

  const finish = (): void => {
    tl.eventCallback('onComplete', null);
    tl.eventCallback('onUpdate', null);
    tl.kill();
    releaseClass();
    gsap.set(prints, { clearProps: 'transform,boxShadow,zIndex' });
    gsap.set(glow, { autoAlpha: 0 });
  };

  if (record) {
    window.__SCENE_TL__ = window.__SCENE_TL__ || {};
    window.__SCENE_TL__['05C'] = tl;
    // A time-0 set can render when the timeline is built. Put the grid back.
    gsap.set(prints, { clearProps: 'transform,boxShadow,zIndex,opacity,visibility' });
    gsap.set(glow, { clearProps: 'opacity,visibility' });
    gsap.set(ring, { clearProps: 'transform,opacity,visibility' });
    releaseClass();
  } else {
    tl.eventCallback('onComplete', finish);
    // work-intro stays until finish so the page tests wait out the entrance.
    // is-light-table reveals the prints once they are parked offscreen.
    tl.play(0);
  }

  const stop = (): void => {
    tl.eventCallback('onComplete', null);
    tl.eventCallback('onUpdate', null);
    if (window.__SCENE_TL__?.['05C'] === tl) delete window.__SCENE_TL__['05C'];
    tl.kill();
    html.classList.remove('is-light-table');
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
