import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Clip 06. The hero is pinned for the first half viewport of scroll (360px at
 * 720). Layers scrub linearly and reverse with the scroll. No opacity, no
 * crossfade. The ghost in the clip is a video artefact and is not rebuilt.
 * Touch: no pin. The figure rises at 0.3x the scroll against a still plate.
 */
const triggers: ScrollTrigger[] = [];

function pinDistance(): number {
  return Math.round(window.innerHeight * 0.5);
}

function applyDesktop(progress: number, pointerX: number, pointerY: number): void {
  const root = document.querySelector<HTMLElement>('[data-about-hero]');
  if (!root) return;
  const sky = root.querySelector<HTMLElement>('[data-layer="sky"]');
  const arch = root.querySelector<HTMLElement>('[data-layer="arch"]');
  const title = root.querySelector<HTMLElement>('[data-layer="title"]');
  const figure = root.querySelector<HTMLElement>('[data-layer="figure"]');
  const rise = -0.3 * pinDistance() * progress;
  if (sky) gsap.set(sky, { x: pointerX * -8, y: -3 * progress + pointerY * 4, scale: 1 });
  if (arch) gsap.set(arch, { x: pointerX * -14, y: -8 * progress + pointerY * 8, scale: 1 });
  if (title) gsap.set(title, { x: pointerX * -4, y: -4 * progress + pointerY * 2, scale: 1 });
  if (figure) {
    gsap.set(figure, {
      x: pointerX * 12,
      y: rise + pointerY * 14,
      scale: 1 + 0.12 * progress,
      transformOrigin: '50% 42%',
    });
  }
}

export function initAbout(reduced: boolean, fine: boolean, signal: AbortSignal): () => void {
  const root = document.querySelector<HTMLElement>('[data-about-hero]');
  if (!root) return () => {};

  const kill = (): void => {
    triggers.splice(0).forEach((trigger) => trigger.kill());
  };

  if (reduced) return kill;

  let pointerX = 0;
  let pointerY = 0;
  let progress = 0;

  const narrow = window.matchMedia('(max-width: 900px)').matches;
  if (!fine || narrow) {
    const figure = root.querySelector<HTMLElement>('[data-layer="figure"]');
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const distance = self.end - self.start;
        if (figure) gsap.set(figure, { y: -0.3 * self.progress * distance, scale: 1, x: 0 });
      },
    });
    triggers.push(trigger);
    signal.addEventListener('abort', kill, { once: true });
    return kill;
  }

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: () => `+=${pinDistance()}`,
    pin: true,
    pinSpacing: true,
    scrub: true,
    anticipatePin: 0,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progress = self.progress;
      applyDesktop(progress, pointerX, pointerY);
    },
  });
  triggers.push(trigger);

  const onMove = (event: PointerEvent): void => {
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
    applyDesktop(progress, pointerX, pointerY);
  };
  window.addEventListener('pointermove', onMove, { signal });
  signal.addEventListener('abort', kill, { once: true });
  applyDesktop(0, 0, 0);
  return kill;
}
