/**
 * Scene 06B B-crimson-thread. The fashion split pin scrubs the picked clip.
 * The DOM hairline tip sits at y = progress × height (DrawSVG), above the video.
 * Gate mode does not seek it, and does not move the element. Gate CSS
 * (html.is-gate-06B) already pins it fixed to the viewport. Reparenting
 * after load() suspends the fetch and __SCENE_READY__ never flips.
 */

import { gsap, ScrollTrigger } from '../runtime';
import { getSceneVideo, sceneGateId } from '../scene-video';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function initEditorialThread(reduced: boolean, signal: AbortSignal): () => void {
  const html = document.documentElement;
  const scene = document.querySelector<HTMLElement>('[data-fe-scene]');
  const path = scene?.querySelector<SVGPathElement>('[data-fe-thread-path]');
  const thread = scene?.querySelector<HTMLElement>('[data-fe-thread]');
  const gate = sceneGateId();

  const clear = (): void => {
    html.classList.remove('has-thread', 'is-thread-late', 'is-gate-06B');
    if (scene) scene.style.opacity = '';
  };

  if (!scene || !path || !thread) {
    clear();
    return () => {};
  }

  if (gate === '06B') {
    html.classList.add('is-gate-06B');
    const stopGate = (): void => {
      html.classList.remove('is-gate-06B');
    };
    signal.addEventListener('abort', stopGate, { once: true });
    return stopGate;
  }

  if (reduced) {
    html.classList.remove('has-thread', 'is-thread-late');
    const stopReduced = (): void => {
      html.classList.remove('has-thread', 'is-thread-late');
    };
    signal.addEventListener('abort', stopReduced, { once: true });
    return stopReduced;
  }

  let dead = false;
  let last = -1;
  let remove = (): void => {};

  const apply = (progress: number): void => {
    const p = clamp01(progress);
    if (last >= 0 && Math.abs(p - last) < 0.0004) return;
    last = p;
    thread.style.visibility = 'visible';
    gsap.set(path, { drawSVG: `0% ${(p * 100).toFixed(3)}%` });
    if (html.classList.contains('has-thread')) {
      const fade = p > 0.9 ? Math.max(0, 1 - (p - 0.9) / 0.1) : 1;
      scene.style.opacity = fade.toFixed(4);
      html.classList.toggle('is-thread-late', fade < 0.2);
    } else {
      scene.style.opacity = '';
      html.classList.remove('is-thread-late');
    }
    getSceneVideo('06B')?.scrub(p);
  };

  const attach = (): void => {
    if (dead) return;
    const section = document.querySelector<HTMLElement>('[data-fe-split]');
    const pin = ScrollTrigger.getAll().find((item) => item.trigger === section && item.pin);
    if (pin) {
      const tick = (): void => apply(pin.progress);
      const onRefresh = (): void => {
        last = -1;
        apply(pin.progress);
      };
      gsap.ticker.add(tick);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      apply(pin.progress);
      remove = () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
      };
      return;
    }
    const created = ScrollTrigger.create({
      trigger: scene,
      start: 'top 75%',
      end: 'bottom 25%',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    });
    apply(created.progress);
    remove = () => created.kill();
  };

  attach();

  const stop = (): void => {
    if (dead) return;
    dead = true;
    remove();
    clear();
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
