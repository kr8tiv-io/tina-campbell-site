import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { bindScrollLock, initHeader } from './header';
import { initCursor } from './cursor';
import { endLoader, playLoader } from './loader';

gsap.registerPlugin(ScrollTrigger, SplitText);

const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE = '(hover: hover) and (pointer: fine)';

let lenis: Lenis | null = null;
let cleanup: (() => void) | null = null;
let splits: SplitText[] = [];
let bound = false;
let active = false;

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED).matches;
}

export function hasFinePointer(): boolean {
  return window.matchMedia(FINE).matches;
}

function destroyMotion(): void {
  cleanup?.();
  cleanup = null;
  splits.forEach((split) => split.revert());
  splits = [];
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

function setupLenis(reduced: boolean, fine: boolean): void {
  if (reduced || !fine) return;
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number): void => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const previous = cleanup;
  cleanup = () => {
    previous?.();
    gsap.ticker.remove(tick);
  };
}

function setupReveals(reduced: boolean): void {
  if (reduced) return;
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const kind = el.dataset.reveal;
    if (kind === 'fade-up') {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            toggleActions: 'play none none reverse',
          },
        },
      );
      return;
    }
    if (kind === 'clip-up') {
      const inner = el.querySelector('img');
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          toggleActions: 'play none none reverse',
        },
      });
      timeline.fromTo(
        el,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power3.out' },
        0,
      );
      if (inner) {
        timeline.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 1.15, ease: 'power3.out' }, 0);
      }
      return;
    }
    if (kind === 'lines') {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto' });
      splits.push(split);
      // Tight display leading is shorter than the glyph box. Pad the mask so
      // ascenders and descenders are not clipped, then pull the leading back.
      split.masks.forEach((mask) => {
        if (!(mask instanceof HTMLElement)) return;
        mask.style.paddingBlock = '0.28em';
        mask.style.marginBlock = '-0.28em';
      });
      gsap.fromTo(
        split.lines,
        { yPercent: 130 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }
  });
}

function setupSkew(reduced: boolean): void {
  if (reduced) return;
  const nodes = gsap.utils.toArray<HTMLElement>('[data-skew]');
  if (nodes.length === 0) return;
  const setters = nodes.map((node) => gsap.quickTo(node, 'skewY', { duration: 0.6, ease: 'power3.out' }));
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / 2000);
      setters.forEach((set) => set(skew));
    },
  });
}

async function initMotion(): Promise<void> {
  destroyMotion();
  const reduced = prefersReducedMotion();
  const fine = hasFinePointer();
  const abort = new AbortController();
  cleanup = () => abort.abort();

  setupLenis(reduced, fine);
  const playing = document.documentElement.classList.contains('loader-play');
  if (playing) lenis?.stop();
  bindScrollLock((locked) => {
    document.documentElement.classList.toggle('scroll-lock', locked);
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  });
  initHeader(abort.signal);
  initCursor(abort.signal, fine);

  playLoader(reduced, () => {
    if (abort.signal.aborted) return;
    lenis?.start();
    ScrollTrigger.refresh();
  });

  if (document.fonts?.ready) await document.fonts.ready;
  if (abort.signal.aborted) return;

  setupReveals(reduced);
  setupSkew(reduced);
  ScrollTrigger.refresh();
}

function boot(): void {
  // astro:page-load also fires on the first window load, after this module
  // has already started. A second init was killing the signature loader.
  if (active) return;
  active = true;
  void initMotion();
}

export function bindMotion(): void {
  if (bound) return;
  bound = true;
  document.addEventListener('astro:before-swap', () => {
    active = false;
    endLoader();
    destroyMotion();
  });
  document.addEventListener('astro:page-load', boot);
  boot();
}
