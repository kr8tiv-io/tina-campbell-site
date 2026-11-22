import Lenis from 'lenis';
import { bindScrollLock, initHeader } from './header';
import { initCursor } from './cursor';
import { endLoader, playLoader } from './loader';
import { initHome, syncHeroCopy } from './home';
import { initHomeFilmstrip } from './scenes/home-filmstrip';
import { initRunway } from './runway';
import { initEditorialThread } from './scenes/editorial-thread';
import { initPrintStack } from './scenes/print-stack';
import { initRunwayFollowspot } from './scenes/runway-followspot';
import { initWorkInk } from './scenes/work-ink';
import { initWorkLightTable } from './scenes/work-lighttable';
import { initWork } from './work';
import { initEditorial } from './editorial';
import { initAbout } from './about';
import { initPages } from './pages';
import { initSeams } from './seams';
import { initSceneVideos } from './scene-video';
import { gsap, isRecordMode, ScrollTrigger, SplitText } from './runtime';

declare global {
  interface Window {
    __tcMotion?: {
      gsap: typeof gsap;
      ScrollTrigger: typeof ScrollTrigger;
      scrollTo: (y: number) => void;
    };
  }
}

export function scrollToY(y: number, immediate = false): void {
  if (lenis) lenis.scrollTo(y, { immediate, force: true });
  else window.scrollTo(0, y);
  ScrollTrigger.update();
}

window.__tcMotion = {
  gsap,
  ScrollTrigger,
  scrollTo: (y: number) => scrollToY(y, true),
};

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
  // Record mode keeps native scroll so the seam gate can drive ScrollTrigger directly.
  if (isRecordMode()) {
    const onScroll = (): void => {
      ScrollTrigger.update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const previous = cleanup;
    cleanup = () => {
      window.removeEventListener('scroll', onScroll);
      previous?.();
    };
    return;
  }
  if (reduced || !fine) return;
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: true,
  });
  lenis.on('scroll', (instance) => {
    ScrollTrigger.update();
    syncHeroCopy(instance.scroll);
    window.__tcScrollVelocity = instance.velocity;
  });
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
        { clipPath: 'inset(0 0 0% 0)', duration: 0.72, ease: 'power3.out' },
        0,
      );
      if (inner) {
        timeline.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 0.85, ease: 'power3.out' }, 0);
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

  // Hold reveals until the signature loader finishes so the hero rise is seen.
  // Record mode skips that hold. The route visual gate reads seam geometry
  // 1.5s after load, and the loader does not release ScrollTrigger until ~2.6s.
  const revealed = new Promise<void>((resolve) => {
    playLoader(reduced || isRecordMode(), () => {
      if (abort.signal.aborted) return;
      lenis?.start();
      resolve();
    });
  });

  await revealed;
  if (document.fonts?.ready) await document.fonts.ready;
  if (abort.signal.aborted) return;

  setupReveals(reduced);
  setupSkew(reduced);
  const releaseHome = initHome(reduced, fine, abort.signal);
  const releaseSheet = initHomeFilmstrip(reduced, abort.signal);
  const releaseRunway = initRunway(reduced, fine, abort.signal);
  const releaseWork = initWork(reduced, fine, abort.signal);
  const releaseEditorial = initEditorial(reduced, fine, abort.signal);
  const releaseAbout = initAbout(reduced, fine, abort.signal);
  const releasePages = initPages(reduced, abort.signal);
  const releaseSeams = initSeams(document);
  const releaseInk = initWorkInk(reduced, abort.signal);
  const releaseVideos = initSceneVideos(abort.signal);
  const releaseThread = initEditorialThread(reduced, abort.signal);
  const releasePrints = initPrintStack(reduced, abort.signal);
  const releaseLight = initWorkLightTable(reduced, abort.signal);
  const releaseFollow = initRunwayFollowspot(reduced, abort.signal);
  const previous = cleanup;
  cleanup = () => {
    releaseFollow();
    releaseLight();
    releasePrints();
    releaseThread();
    releaseVideos();
    releaseInk();
    releaseSeams();
    releasePages();
    releaseAbout();
    releaseEditorial();
    releaseWork();
    releaseRunway();
    releaseSheet();
    releaseHome();
    previous?.();
  };
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
