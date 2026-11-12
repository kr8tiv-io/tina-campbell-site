import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY } from './core';

gsap.registerPlugin(ScrollTrigger, Observer);

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = gsap.utils.clamp(0, 1, (x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
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

function placeRail(section: HTMLElement, progress: number): void {
  const rail = section.querySelector<HTMLElement>('[data-rail]');
  const line = section.querySelector<HTMLElement>('[data-rail-line]');
  const dot = section.querySelector<HTMLElement>('[data-dot]');
  if (!rail || !line || !dot) return;
  const box = rail.getBoundingClientRect();
  if (box.width < 1) return;
  const wide = window.innerWidth >= 961;
  const clamped = gsap.utils.clamp(0, 1, progress);
  let local: number;
  if (wide) {
    const x = window.innerWidth * (0.362 + (0.61 - 0.362) * clamped);
    local = x - box.left;
  } else {
    local = box.width * (0.12 + 0.86 * clamped);
  }
  const scale = gsap.utils.clamp(0.04, 1, local / box.width);
  line.style.transform = `scaleX(${scale})`;
  dot.style.left = `${local}px`;
  rail.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
  section.dataset.progress = clamped.toFixed(4);
}

function mountFallback(section: HTMLElement, signal: AbortSignal): () => void {
  const scroller = section.querySelector<HTMLElement>('[data-catwalk-scroller]');
  if (!scroller) return () => {};
  section.dataset.catwalkReady = 'css';
  section.dataset.catwalkMode = 'css';

  const update = (): void => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const progress = max <= 1 ? 0 : scroller.scrollLeft / max;
    placeRail(section, progress);
    const track = section.querySelector<HTMLElement>('[data-catwalk-track]');
    if (track) track.style.transform = '';
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    const reach = scroller.clientWidth * 0.52;
    scroller.querySelectorAll<HTMLElement>('[data-index]').forEach((item) => {
      const center = item.offsetLeft + item.offsetWidth / 2;
      const nx = (center - mid) / reach;
      const t = smoothstep(0.12, 1.15, Math.abs(nx));
      const scale = 1.14 - t * 0.36;
      item.style.transform = `scale(${scale.toFixed(3)})`;
      item.style.opacity = (1 - t * 0.38).toFixed(3);
    });
  };

  scroller.addEventListener('scroll', update, { signal, passive: true });

  const hero = scroller.querySelector<HTMLElement>('[data-index="3"]');
  if (hero) {
    const left = hero.offsetLeft - (scroller.clientWidth - hero.clientWidth) / 2;
    scroller.scrollLeft = Math.max(0, left);
  }
  update();

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (!coarse) {
    scroller.addEventListener(
      'wheel',
      (event) => {
        if (scroller.scrollWidth <= scroller.clientWidth + 1) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        event.preventDefault();
        scroller.scrollLeft += event.deltaY;
      },
      { signal, passive: false },
    );
  }

  return () => {};
}

export function initRunway(reduced: boolean, _fine: boolean, signal: AbortSignal): () => void {
  const section = document.querySelector<HTMLElement>('[data-catwalk]');
  if (!section) return () => {};

  const state = { dead: false, release: (): void => {} };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const enhanced = !reduced && !coarse && canWebGL();

  if (!enhanced) {
    state.release = mountFallback(section, signal);
    return () => state.release();
  }

  void (async () => {
    try {
      const mod = await import('../webgl/curvedStrip');
      if (state.dead || signal.aborted) return;
      state.release = mountEnhanced(section, signal, mod);
    } catch {
      if (!state.dead) state.release = mountFallback(section, signal);
    }
  })();

  return () => {
    state.dead = true;
    state.release();
  };
}

function mountEnhanced(
  section: HTMLElement,
  signal: AbortSignal,
  mod: typeof import('../webgl/curvedStrip'),
): () => void {
  const canvas = section.querySelector<HTMLCanvasElement>('[data-catwalk-canvas]');
  const stage = section.querySelector<HTMLElement>('[data-catwalk-stage]');
  const items = [...section.querySelectorAll<HTMLElement>('[data-texture]')];
  if (!canvas || !stage || items.length === 0) return mountFallback(section, signal);

  const { STRIP, mountCurvedStrip } = mod;
  const span = STRIP.focusEnd - STRIP.focusStart;
  const frames = items.map((item) => ({
    url: item.dataset.texture || '',
    aspect: Number(item.dataset.aspect) || STRIP.photoW / STRIP.photoH,
  }));

  section.classList.add('is-webgl');
  section.dataset.catwalkMode = 'webgl';
  void canvas.offsetWidth;
  stage.tabIndex = 0;
  items.forEach((item) => {
    item.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
  });

  let progress = 0;
  let strip: ReturnType<typeof mountCurvedStrip> | null = null;
  let lastTime = performance.now();

  const mirror = (value: number): void => {
    const track = section.querySelector<HTMLElement>('[data-catwalk-track]');
    if (track) track.style.transform = `translate3d(${(-value * span * 180).toFixed(2)}px, 0, 0)`;
  };

  const apply = (value: number, velocity = 0): void => {
    progress = value;
    strip?.setProgress(value);
    if (velocity) strip?.setVelocity(velocity);
    placeRail(section, value);
    mirror(value);
  };

  let trigger: ScrollTrigger;
  try {
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * span * 0.92)}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const now = performance.now();
        const dt = Math.max(16, now - lastTime);
        lastTime = now;
        const velocity = (Math.abs(self.getVelocity()) / window.innerHeight) * (dt / 1000);
        apply(self.progress, velocity);
      },
    });
  } catch {
    section.classList.remove('is-webgl');
    return mountFallback(section, signal);
  }

  const writeMeta = (): void => {
    const range = Math.max(1, trigger.end - trigger.start);
    section.dataset.pinStart = String(Math.round(trigger.start));
    section.dataset.pinEnd = String(Math.round(trigger.end));
    section.dataset.frameScroll = String(Math.round(range / span));
  };

  strip = mountCurvedStrip(canvas, frames, {
    signal,
    onReady: () => {
      section.dataset.catwalkReady = 'webgl';
      strip?.resize();
      apply(progress);
    },
  });

  const observer = Observer.create({
    target: stage,
    type: 'pointer',
    dragMinimum: 4,
    preventDefault: true,
    onDrag: (self) => {
      const range = trigger.end - trigger.start;
      const pxPerFrame = Math.max(1, stage.clientWidth / STRIP.viewFrames);
      const scrollPerFrame = range / span;
      const next = gsap.utils.clamp(
        trigger.start,
        trigger.end,
        trigger.scroll() - self.deltaX * (scrollPerFrame / pxPerFrame),
      );
      scrollToY(next, true);
    },
  });

  const onKey = (event: KeyboardEvent): void => {
    const range = trigger.end - trigger.start;
    const step = range / span;
    let next = trigger.scroll();
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next += step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next -= step;
    else if (event.key === 'Home') next = trigger.start;
    else if (event.key === 'End') next = trigger.end;
    else return;
    event.preventDefault();
    scrollToY(gsap.utils.clamp(trigger.start, trigger.end, next), true);
  };
  stage.addEventListener('keydown', onKey, { signal });

  const onResize = (): void => {
    strip?.resize();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize, { signal });

  const onRefresh = (): void => {
    writeMeta();
    apply(trigger.progress);
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);

  apply(0);
  ScrollTrigger.refresh();
  writeMeta();

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    window.removeEventListener('resize', onResize);
    stage.removeEventListener('keydown', onKey);
    observer.kill();
    trigger.kill();
    strip?.destroy();
    section.classList.remove('is-webgl');
  };
}
