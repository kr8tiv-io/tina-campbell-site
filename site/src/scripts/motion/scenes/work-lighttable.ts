/**
 * Scene 05C C-light-table-drop. GSAP on the opening Work prints.
 * Desktop (015 table, 6.04 s):
 * 0.0-0.5 empty table glow.
 * 0.5-2.0 fall (y -120vh, rotate ±18, scale 1.1, shadow 0 60px 80px).
 * 2.0-5.5 settle flat into the slots, ease cine, stagger 0.08, shadows tighten.
 * 5.2-5.8 crimson loupe ring, stroke 6, scales in.
 * Prints stay mono through the fall and warm to colour over the last 0.6 s.
 * Phone uses the same beats on 8 prints, compressed to 4 s, in the 2-column grid.
 * Record mode exposes the paused desktop timeline and does not move the resting grid.
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
const MONO = 'grayscale(1) contrast(1.05)';
const COLOUR = 'grayscale(0) contrast(1)';

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

  if (reduced) {
    releaseClass();
    return () => {};
  }

  const phone = !record && !wideLayout();
  const stills = prints
    .map((print) => print.querySelector<HTMLElement>('.tile__link img'))
    .filter((node): node is HTMLElement => Boolean(node));
  const stagger = phone ? STAGGER * (4 / 6.04) : STAGGER;
  const settleSpan = phone ? 3.5 * (4 / 6.04) : 3.5;
  const settleDur = settleSpan - (prints.length - 1) * stagger;
  const fallAt = phone ? 0.5 * (4 / 6.04) : 0.5;
  const fallDur = phone ? 1.5 * (4 / 6.04) : 1.5;
  const landAt = phone ? 2 * (4 / 6.04) : 2;
  // Phone init lands near the 1s sheet column. -70vh keeps the lower prints in
  // frame at the first beat; desktop stays at -120vh for the 015 table.
  const fallY = phone ? '-70vh' : FALL_Y;
  const loupeAt = phone ? 5.2 * (4 / 6.04) : 5.2;
  const loupeDur = phone ? 0.6 * (4 / 6.04) : 0.6;
  const colourAt = phone ? (6.04 - 0.6) * (4 / 6.04) : 6.04 - 0.6;
  const colourDur = phone ? 0.6 * (4 / 6.04) : 0.6;
  const holdAt = phone ? 4 : 6.04;
  const glowOut = phone ? 0.4 * (4 / 6.04) : 0.4;

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'cine', immediateRender: false },
  });

  tl.addLabel('glow', 0);
  tl.addLabel('fall', fallAt);
  tl.addLabel('land', landAt);
  tl.addLabel('settle', landAt);
  tl.addLabel('loupe', loupeAt);
  tl.addLabel('loupeEnd', loupeAt + loupeDur);
  tl.addLabel('colour', colourAt);
  tl.addLabel('hold', holdAt);

  prints.forEach((print, index) => {
    tl.set(
      print,
      {
        y: fallY,
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

  if (stills.length > 0) {
    tl.set(stills, { filter: MONO, immediateRender: !record }, 0);
  }

  tl.fromTo(
    glow,
    { autoAlpha: 0.15 },
    { autoAlpha: 1, duration: fallAt || 0.5, ease: 'sine.out', immediateRender: false },
    0,
  );

  tl.to(
    prints,
    {
      y: '6vh',
      duration: fallDur,
      // power2.out crosses the viewport inside the fall window. power2.in holds
      // -120vh until the last frames, so the drop never reads on the page.
      ease: 'power2.out',
      immediateRender: false,
    },
    fallAt,
  );

  tl.to(
    prints,
    {
      y: 0,
      rotation: 0,
      scale: 1,
      boxShadow: SHADOW_FLAT,
      duration: settleDur,
      stagger,
      ease: 'cine',
      immediateRender: false,
    },
    landAt,
  );

  if (stills.length > 0) {
    tl.to(stills, { filter: COLOUR, duration: colourDur, ease: 'sine.out', immediateRender: false }, colourAt);
  }

  tl.fromTo(
    ring,
    { scale: 0, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: loupeDur, ease: 'cine', immediateRender: false },
    loupeAt,
  );

  tl.to(glow, { autoAlpha: 0, duration: glowOut, ease: 'power1.in', immediateRender: false }, holdAt);

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
    gsap.set(stills, { clearProps: 'filter' });
    gsap.set(glow, { autoAlpha: 0 });
  };

  if (record) {
    window.__SCENE_TL__ = window.__SCENE_TL__ || {};
    window.__SCENE_TL__['05C'] = tl;
    // A time-0 set can render when the timeline is built. Put the grid back.
    gsap.set(prints, { clearProps: 'transform,boxShadow,zIndex,opacity,visibility' });
    gsap.set(stills, { clearProps: 'filter' });
    gsap.set(glow, { clearProps: 'opacity,visibility' });
    gsap.set(ring, { clearProps: 'transform,opacity,visibility' });
    releaseClass();
  } else {
    tl.eventCallback('onComplete', finish);
    // work-intro stays until finish so the page tests wait out the entrance.
    // is-light-table reveals the prints once they are parked offscreen.
    html.classList.add('is-light-table');
    tl.play(0);
  }

  const stop = (): void => {
    tl.eventCallback('onComplete', null);
    tl.eventCallback('onUpdate', null);
    if (window.__SCENE_TL__?.['05C'] === tl) delete window.__SCENE_TL__['05C'];
    tl.kill();
    gsap.set(stills, { clearProps: 'filter' });
    html.classList.remove('is-light-table');
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
