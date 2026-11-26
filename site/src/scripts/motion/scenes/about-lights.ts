/**
 * Scene 09B B-blue-hour-lights.
 * The full-bleed band under the editorial split scrubs the picked clip.
 * Desktop pins the band and maps scroll progress to currentTime, so the
 * light wave (about 2.0 s to 3.5 s) lands in the middle of the pin.
 * A portrait screen keeps the 16:9 frame and scrubs as the band crosses
 * the viewport. No pin, no scrub, no video when motion is reduced.
 * Gate mode does not seek: scene-video.ts owns the element.
 */

import { ScrollTrigger } from '../runtime';
import { getSceneVideo, sceneGateId } from '../scene-video';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function headerPx(): number {
  // --header-h is a clamp(), so reading the custom property returns the
  // specified text, not the used length. The header's box is that length.
  const header = document.querySelector<HTMLElement>('.site-header');
  const height = header?.getBoundingClientRect().height ?? 0;
  return height > 0 ? height : 0;
}

export function initAboutLights(reduced: boolean, signal: AbortSignal): () => void {
  const gate = sceneGateId();
  if (gate === '09B') document.documentElement.classList.add('is-gate-09B');

  const clear = (): void => {
    document.documentElement.classList.remove('is-gate-09B');
  };

  if (reduced || gate) {
    signal.addEventListener('abort', clear, { once: true });
    return clear;
  }

  const section = document.querySelector<HTMLElement>('[data-about-band]');
  if (!section) return clear;

  let dead = false;
  let last = -1;
  let latest = 0;

  const apply = (progress: number): void => {
    latest = clamp01(progress);
    const ctrl = getSceneVideo('09B');
    if (!ctrl) return;
    if (Math.abs(latest - last) < 0.0004) return;
    last = latest;
    section.dataset.sceneProgress = latest.toFixed(4);
    ctrl.scrub(latest);
  };

  const narrow = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: narrow ? 'top 85%' : () => `top ${headerPx()}px`,
    end: narrow ? 'bottom 15%' : '+=170%',
    pin: narrow ? false : section,
    scrub: true,
    anticipatePin: narrow ? 0 : 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => apply(self.progress),
  });

  const kick = (): void => {
    if (dead) return;
    apply(trigger.progress);
    if (!getSceneVideo('09B')) requestAnimationFrame(kick);
  };
  kick();

  const stop = (): void => {
    if (dead) return;
    dead = true;
    trigger.kill();
    clear();
    delete section.dataset.sceneProgress;
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
