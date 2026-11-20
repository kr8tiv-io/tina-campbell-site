import { DrawSVGPlugin, gsap, ScrollTrigger, SplitText } from './runtime';

declare global {
  interface Window {
    __PROTO_TL__?: gsap.core.Timeline;
    __PROTO_READY__?: boolean;
    __PROTO_DONE__?: Promise<void>;
    __START_RECORD__?: () => Promise<void>;
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
        onUpdate: (self) => swapNav(self.progress),
      },
    });
  }

  /* ---------- 01A → 02A ---------- */
  function t_01A_02A_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(ink, { yPercent: 100, zIndex: 8 });
    gsap.set(inS, { yPercent: 36, autoAlpha: 0, zIndex: 9 });
    if (inCopy) gsap.set(inCopy.chars, { yPercent: 110 });
    tl.to(outS.querySelector('.media'), { yPercent: -12, scale: 1.08, duration: 1.2 }, 0);
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, opacity: 0, stagger: 0.02, duration: 0.55 }, 0.05);
    tl.to(ink, { yPercent: 0, duration: 0.65, ease: 'power2.inOut' }, 0.15);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.85, ease: 'power3.out' }, 0.38);
    if (inCopy) tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.52);
    tl.fromTo(
      inS.querySelector('.media'),
      { yPercent: 18, filter: 'blur(8px)' },
      { yPercent: 0, filter: 'blur(0px)', duration: 0.7 },
      0.4,
    );
    tl.to(ink, { yPercent: 100, duration: 0.45, ease: 'power2.in' }, 0.72);
  }

  function t_01A_02A_B(tl: gsap.core.Timeline): void {
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0 });
    tl.to(
      outS.querySelector('.media'),
      { scale: 0.34, yPercent: 6, xPercent: 0, borderRadius: 4, duration: 1 },
      0,
    );
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (outCopy) tl.to(outCopy.chars, { yPercent: 120, opacity: 0, stagger: 0.015, duration: 0.4 }, 0.05);
    tl.fromTo(inS, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.025, duration: 0.55 }, 0.5);
    }
  }

  function t_01A_02A_C(tl: gsap.core.Timeline): void {
    const brush = stage.querySelector('#brushPath');
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 1, clipPath: 'inset(0 0 0 100%)' });
    if (brush) gsap.set(brush, { drawSVG: '0% 0%' });
    if (outCopy) tl.to(outCopy.chars, { xPercent: -40, opacity: 0, stagger: 0.02, duration: 0.5 }, 0);
    if (brush) tl.to(brush, { drawSVG: '0% 100%', duration: 0.8, ease: 'power2.inOut' }, 0.05);
    tl.to(inS, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'power2.inOut' }, 0.15);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.45);
    }
    if (brush) {
      const svg = brush instanceof SVGElement ? brush.ownerSVGElement || brush : brush;
      tl.to(svg, { autoAlpha: 0, duration: 0.4 }, 0.72);
    }
  }

  /* ---------- 02A → 03B ---------- */
  function t_02A_03B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, scaleY: 0.42, yPercent: 8 });
    tl.to(outS.querySelector('.media'), { scaleY: 1.55, scaleX: 0.92, yPercent: -6, duration: 0.8 }, 0);
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(inS, { autoAlpha: 1, scaleY: 1, yPercent: 0, duration: 0.85 }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.55);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_02A_03B_B(tl: gsap.core.Timeline): void {
    const spot = stage.querySelector('[data-spot]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, scale: 1.12 });
    gsap.set(spot, { autoAlpha: 0, '--sx': '18%', '--sy': '55%' });
    tl.to(outS, { filter: 'saturate(0) brightness(0.45)', duration: 0.4 }, 0);
    tl.to(spot, { autoAlpha: 1, duration: 0.3 }, 0.1);
    tl.to(spot, { '--sx': '50%', '--sy': '50%', duration: 0.8 }, 0.2);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    tl.to(outS, { autoAlpha: 0, duration: 0.35 }, 0.65);
    tl.to(spot, { autoAlpha: 0.4, duration: 0.4 }, 0.7);
    if (inCopy) {
      gsap.set(inCopy.chars, { opacity: 0, y: 30 });
      tl.to(inCopy.chars, { opacity: 1, y: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  function t_02A_03B_C(tl: gsap.core.Timeline): void {
    const flood = stage.querySelector('[data-flood]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(flood, { yPercent: 100, background: 'linear-gradient(180deg,#4a0d1a 0%,#b3261e 40%,#1a0a12 100%)' });
    gsap.set(inS, { autoAlpha: 0, yPercent: 16, filter: 'blur(10px)' });
    tl.to(flood, { yPercent: 0, duration: 0.55, ease: 'power2.in' }, 0);
    tl.to(outS, { autoAlpha: 0, yPercent: -10, duration: 0.4 }, 0.15);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.7 }, 0.4);
    tl.to(flood, { autoAlpha: 0, duration: 0.5 }, 0.55);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 03B → 04B ---------- */
  function t_03B_04B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, rotate: -4, yPercent: -20, scale: 0.86 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(outS.querySelector('.media'), { yPercent: 40, rotate: 3, scale: 0.8, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotate: 0, yPercent: 0, scale: 1, duration: 0.85, ease: 'power3.out' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.55);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_03B_04B_B(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' });
    tl.to(outS.querySelector('.media'), { filter: 'grayscale(1) brightness(0.7)', yPercent: 8, duration: 0.6 }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power2.inOut' }, 0.2);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.7);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_03B_04B_C(tl: gsap.core.Timeline): void {
    const spot = stage.querySelector('[data-spot]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(spot, { autoAlpha: 1, '--sx': '50%', '--sy': '50%' });
    gsap.set(inS, { autoAlpha: 0, scale: 1.2 });
    tl.to(spot, { '--sx': '50%', '--sy': '48%', duration: 0.3 }, 0);
    tl.to(outS.querySelector('.media'), { scale: 0.42, duration: 0.7 }, 0.1);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.35);
    tl.to(spot, { autoAlpha: 0, duration: 0.45 }, 0.55);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 04B → 05C ---------- */
  function t_04B_05C_A(tl: gsap.core.Timeline): void {
    const outCopy = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, yPercent: -18, rotate: -5, scale: 1.08 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.35 }, 0);
    tl.to(outS.querySelector('.media'), { yPercent: -30, rotate: 4, scale: 0.9, duration: 0.65 }, 0);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, rotate: 0, scale: 1, duration: 0.85, ease: 'back.out(1.2)' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.55);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_04B_05C_B(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(ink, { scale: 0, borderRadius: '50%', background: '#b3261e' });
    gsap.set(inS, { autoAlpha: 0 });
    tl.to(ink, { scale: 18, duration: 0.7, ease: 'power2.in' }, 0);
    tl.set(ink, { background: '#0c0c0f' }, 0.45);
    tl.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.45);
    tl.to(ink, { autoAlpha: 0, duration: 0.45 }, 0.65);
    tl.to(outS, { autoAlpha: 0, duration: 0.2 }, 0.5);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.6);
    }
  }

  function t_04B_05C_C(tl: gsap.core.Timeline): void {
    const loupe = stage.querySelector('[data-loupe]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(loupe, { scale: 0.15, autoAlpha: 1 });
    gsap.set(inS, { autoAlpha: 0, clipPath: 'circle(8% at 50% 50%)' });
    tl.to(loupe, { scale: 1.15, duration: 0.85, ease: 'power2.inOut' }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'circle(80% at 50% 50%)', duration: 0.85, ease: 'power2.inOut' }, 0.1);
    tl.to(loupe, { autoAlpha: 0, duration: 0.3 }, 0.7);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.65);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 05C → 06B ---------- */
  function t_05C_06B_A(tl: gsap.core.Timeline): void {
    const outCopy = split(outS.querySelector('.copy h1'));
    const inTitle = split(inS.querySelector('.copy h1'));
    const thread = stage.querySelector('#threadPath');
    gsap.set(inS, { autoAlpha: 0, xPercent: 28, scale: 0.86 });
    if (thread) gsap.set(thread, { drawSVG: '0% 0%' });
    if (outCopy) tl.to(outCopy.chars, { xPercent: -30, opacity: 0, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(outS.querySelector('.media'), { xPercent: -18, scale: 0.92, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 0.8 }, 0.25);
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.7, ease: 'power1.inOut' }, 0.4);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inTitle) {
      gsap.set(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.45);
    }
  }

  function t_05C_06B_B(tl: gsap.core.Timeline): void {
    const thread = stage.querySelector('#threadPath');
    const inTitle = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, clipPath: 'inset(0 0 0 50%)' });
    if (thread) gsap.set(thread, { drawSVG: '0% 0%' });
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.55 }, 0);
    tl.to(outS.querySelector('.media'), { xPercent: -8, duration: 0.8 }, 0);
    tl.to(inS, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.85, ease: 'power2.inOut' }, 0.2);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.65);
    if (inTitle) {
      gsap.set(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.4);
    }
  }

  function t_05C_06B_C(tl: gsap.core.Timeline): void {
    const inTitle = split(inS.querySelector('.copy h1'));
    const thread = stage.querySelector('#threadPath');
    gsap.set(inS, { autoAlpha: 0, rotateY: -18, transformOrigin: 'right center' });
    if (thread) gsap.set(thread, { drawSVG: '0% 0%' });
    tl.to(outS.querySelector('.media'), { rotateY: 12, xPercent: -10, duration: 0.65 }, 0);
    tl.to(inS, { autoAlpha: 1, rotateY: 0, duration: 0.8 }, 0.25);
    if (thread) tl.to(thread, { drawSVG: '0% 100%', duration: 0.65 }, 0.4);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inTitle) {
      gsap.set(inTitle.chars, { yPercent: 110 });
      tl.to(inTitle.chars, { yPercent: 0, stagger: 0.018, duration: 0.6 }, 0.45);
    }
  }

  /* ---------- 06B → 07C ---------- */
  function t_06B_07C_A(tl: gsap.core.Timeline): void {
    const outTitle = split(outS.querySelector('.copy h1'));
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, rotate: -8, yPercent: 16, scale: 0.82, transformOrigin: '50% 50%' });
    if (outTitle) tl.to(outTitle.chars, { yPercent: -110, stagger: 0.015, duration: 0.4 }, 0);
    tl.to(outS.querySelector('.media'), { scale: 0.7, rotate: 6, xPercent: -8, duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotate: 0, yPercent: 0, scale: 1, duration: 0.85, ease: 'power3.out' }, 0.25);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_06B_07C_B(tl: gsap.core.Timeline): void {
    const thread = stage.querySelector('#threadPath');
    const inCopy = split(inS.querySelector('.copy h1'));
    if (thread) gsap.set(thread, { drawSVG: '0% 100%' });
    gsap.set(inS, { autoAlpha: 0, xPercent: 20, rotate: 4 });
    if (thread) tl.to(thread, { drawSVG: '100% 100%', duration: 0.5, ease: 'power1.in' }, 0);
    tl.to(outS.querySelector('.media'), { xPercent: -22, rotate: -3, duration: 0.7 }, 0.1);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, rotate: 0, duration: 0.75 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.25 }, 0.6);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_06B_07C_C(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, rotateY: 90, transformPerspective: 1600, transformOrigin: 'left center' });
    tl.to(outS, { rotateY: -55, transformPerspective: 1600, transformOrigin: 'right center', duration: 0.7 }, 0);
    tl.to(inS, { autoAlpha: 1, rotateY: 0, duration: 0.75 }, 0.28);
    tl.to(outS, { autoAlpha: 0, duration: 0.2 }, 0.65);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  /* ---------- 07C → 08B ---------- */
  function t_07C_08B_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(ink, { yPercent: 100 });
    gsap.set(inS, { autoAlpha: 0, scale: 1.08 });
    tl.to(ink, { yPercent: 0, duration: 0.7, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, yPercent: -8, duration: 0.4 }, 0.2);
    tl.to(inS, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.45);
    tl.to(ink, { autoAlpha: 0, duration: 0.5 }, 0.65);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.55);
    }
  }

  function t_07C_08B_B(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0 });
    gsap.set(ink, { yPercent: 100 });
    tl.to(outS.querySelector('.media'), { scale: 1.35, duration: 0.7 }, 0);
    tl.to(outS.querySelector('.copy'), { autoAlpha: 0, duration: 0.3 }, 0);
    tl.to(ink, { yPercent: 0, duration: 0.65, ease: 'power2.in' }, 0.3);
    tl.to(inS, { autoAlpha: 1, duration: 0.6 }, 0.5);
    tl.to(ink, { autoAlpha: 0, duration: 0.4 }, 0.7);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.6);
    }
  }

  function t_07C_08B_C(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(ink, { xPercent: -100, background: 'linear-gradient(90deg,#0c0c0f 70%,transparent)' });
    gsap.set(inS, { autoAlpha: 0, xPercent: 12 });
    tl.to(ink, { xPercent: 0, duration: 0.6, ease: 'power2.inOut' }, 0);
    tl.to(outS, { xPercent: -10, autoAlpha: 0, duration: 0.5 }, 0.15);
    tl.to(inS, { autoAlpha: 1, xPercent: 0, duration: 0.7 }, 0.4);
    tl.to(ink, { xPercent: 100, duration: 0.55 }, 0.55);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.55);
    }
  }

  /* ---------- 08B → 09B ---------- */
  function t_08B_09B_A(tl: gsap.core.Timeline): void {
    const ink = stage.querySelector('[data-ink]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(ink, { autoAlpha: 1, yPercent: 0 });
    gsap.set(inS, { autoAlpha: 1 });
    gsap.set(inS.querySelector('.media'), { yPercent: 18, scale: 1.08 });
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0);
    tl.to(ink, { yPercent: -110, duration: 0.9, ease: 'power2.inOut' }, 0.05);
    tl.to(inS.querySelector('.media'), { yPercent: 0, scale: 1, duration: 1 }, 0.1);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.45);
    }
  }

  function t_08B_09B_B(tl: gsap.core.Timeline): void {
    const layers = inS.querySelectorAll('[data-layer]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0 });
    if (layers.length) gsap.set(layers, { yPercent: (i: number) => 20 + i * 14, scale: 1.1 });
    tl.to(outS, { autoAlpha: 0, filter: 'blur(8px)', duration: 0.5 }, 0);
    tl.to(inS, { autoAlpha: 1, duration: 0.4 }, 0.2);
    if (layers.length) tl.to(layers, { yPercent: 0, scale: 1, stagger: 0.08, duration: 0.9 }, 0.2);
    else tl.fromTo(inS.querySelector('.media'), { yPercent: 16, scale: 1.1 }, { yPercent: 0, scale: 1, duration: 0.9 }, 0.2);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.6 }, 0.5);
    }
  }

  function t_08B_09B_C(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 1, clipPath: 'circle(0% at 50% 55%)' });
    tl.to(inS, { clipPath: 'circle(80% at 50% 55%)', duration: 1, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, scale: 1.06, duration: 0.6 }, 0.35);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  /* ---------- 09B → 10A ---------- */
  function t_09B_10A_A(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    const outCopy = split(outS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -80, opacity: 0, stagger: 0.02, duration: 0.45 }, 0);
    tl.to(outS.querySelector('.media'), { scaleY: 0.62, yPercent: 0, duration: 0.8, transformOrigin: '50% 50%' }, 0.05);
    tl.to(inS, { autoAlpha: 1, duration: 0.6 }, 0.35);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    tl.fromTo(inS.querySelector('.media'), { xPercent: -6 }, { xPercent: 0, duration: 0.9 }, 0.4);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_09B_10A_B(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    const outCopy = split(outS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, yPercent: 20 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(outS.querySelector('.media'), { yPercent: -14, scale: 1.04, duration: 0.8 }, 0);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.75 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.6);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  function t_09B_10A_C(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 1, clipPath: 'inset(100% 0 0 0)' });
    tl.to(inS, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power2.inOut' }, 0.05);
    tl.to(outS.querySelector('.media'), { yPercent: -16, duration: 0.9 }, 0);
    tl.to(outS, { autoAlpha: 0, duration: 0.3 }, 0.7);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5);
    }
  }

  /* ---------- 10A → 11B ---------- */
  function t_10A_11B_A(tl: gsap.core.Timeline): void {
    const veil = stage.querySelector('[data-veil]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(veil, { xPercent: -130, autoAlpha: 1 });
    gsap.set(inS, { autoAlpha: 0 });
    tl.to(veil, { xPercent: 130, duration: 1, ease: 'power2.inOut' }, 0);
    tl.to(outS, { autoAlpha: 0, duration: 0.4 }, 0.25);
    tl.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.35);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  function t_10A_11B_B(tl: gsap.core.Timeline): void {
    const inCopy = split(inS.querySelector('.copy h1'));
    const outCopy = split(outS.querySelector('.copy h1'));
    gsap.set(inS, { autoAlpha: 0, yPercent: 40 });
    if (outCopy) tl.to(outCopy.chars, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 0);
    tl.to(outS, { yPercent: -60, duration: 0.8, ease: 'power2.inOut' }, 0.05);
    tl.to(inS, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.25);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
      tl.to(inCopy.chars, { yPercent: 0, stagger: 0.03, duration: 0.55 }, 0.5);
    }
  }

  function t_10A_11B_C(tl: gsap.core.Timeline): void {
    const leak = stage.querySelector('[data-leak]');
    const veil = stage.querySelector('[data-veil]');
    const inCopy = split(inS.querySelector('.copy h1'));
    gsap.set(leak, { autoAlpha: 0 });
    gsap.set(veil, { xPercent: -120, autoAlpha: 0.85 });
    gsap.set(inS, { autoAlpha: 0, filter: 'blur(10px) brightness(1.3)' });
    tl.to(leak, { autoAlpha: 1, duration: 0.35 }, 0);
    tl.to(veil, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.1);
    tl.to(inS, { autoAlpha: 1, filter: 'blur(0px) brightness(1)', duration: 0.7 }, 0.3);
    tl.to(outS, { autoAlpha: 0, duration: 0.4 }, 0.3);
    tl.to(leak, { autoAlpha: 0, duration: 0.45 }, 0.65);
    if (inCopy) {
      gsap.set(inCopy.chars, { yPercent: 110 });
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

  const pair = seam.dataset.seam || '';
  const fn = map[LOCKED[pair] || ''];
  const timeline = pinTl();
  if (fn) fn(timeline);
  else {
    gsap.set(inS, { autoAlpha: 0 });
    timeline.to(outS, { autoAlpha: 0, duration: 0.5 }, 0);
    timeline.to(inS, { autoAlpha: 1, duration: 0.5 }, 0.2);
  }

  return {
    timeline,
    revert: () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      splits.forEach((item) => item.revert());
    },
  };
}

/** Build the locked timeline for every `[data-seam]` under `root`. */
export function initSeams(root: ParentNode = document): () => void {
  window.ScrollTrigger = ScrollTrigger;
  void DrawSVGPlugin;
  installRecordHook();

  const seams = [...root.querySelectorAll<HTMLElement>('[data-seam]')];
  if (prefersReducedMotion()) {
    seams.forEach(showIncomingOnly);
    window.__PROTO_TL__ = undefined;
    window.__PROTO_READY__ = true;
    return () => {
      window.__PROTO_TL__ = undefined;
      window.__PROTO_READY__ = false;
    };
  }

  let cancelled = false;
  let mounted: Mounted[] = [];

  const mount = (): void => {
    if (cancelled) return;
    mounted = seams
      .map((seam) => mountSeam(seam, root))
      .filter((item): item is Mounted => item !== null);
    window.__PROTO_TL__ = mounted[0]?.timeline;
    window.__PROTO_READY__ = true;
  };

  // Split after the locked serif is applied. A deferred module can run before
  // the swap, and the chapter title then wraps one line early.
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  void fontsReady.then(mount);

  return () => {
    cancelled = true;
    mounted.forEach((item) => item.revert());
    if (window.__PROTO_TL__ && mounted.some((item) => item.timeline === window.__PROTO_TL__)) {
      window.__PROTO_TL__ = undefined;
    }
    window.__PROTO_READY__ = false;
  };
}
