/**
 * Scene 03B B-followspot. The home runway stage scrubs the picked clip.
 * The pin is the 02A-03B track (top top / bottom bottom, scrub 0.6, anticipatePin 1).
 * Progress 0..1 maps to currentTime 0..6.0 s, forward and back.
 * The curved strip on /runway/ is not mounted here.
 */

import { gsap, ScrollTrigger } from '../runtime';
import { getSceneVideo, sceneGateId } from '../scene-video';
import { hookRunwayHandoff } from '../runway';

const SPOT_END = 6;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function initRunwayFollowspot(reduced: boolean, signal: AbortSignal): () => void {
  const gate = sceneGateId();
  if (gate === '03B') document.documentElement.classList.add('is-gate-03B');

  const clearGate = (): void => {
    document.documentElement.classList.remove('is-gate-03B');
  };

  // The scene gate seeks the element itself. A ticker seek would fight it.
  if (reduced || gate) return clearGate;

  const section = document.querySelector<HTMLElement>('[data-runway-pin]');
  const pair = section?.closest<HTMLElement>('[data-seam-pair="02A-03B"]');
  const track = pair?.querySelector<HTMLElement>('[data-track]');
  const stage = pair?.querySelector<HTMLElement>('[data-stage]');
  if (!section || !track || !stage) return clearGate;

  let dead = false;
  let remove = (): void => {};
  let waiting = false;
  let latest = 0;
  let last = -1;
  let marked = -1;

  const apply = (progress: number): void => {
    latest = clamp01(progress);
    if (Math.abs(latest - marked) >= 0.0004) {
      marked = latest;
      section.dataset.sceneProgress = latest.toFixed(4);
      hookRunwayHandoff(latest);
    }
    const ctrl = getSceneVideo('03B');
    if (!ctrl) return;
    const dur = ctrl.video.duration;
    if (!Number.isFinite(dur) || dur <= 0) {
      if (waiting) return;
      waiting = true;
      ctrl.video.addEventListener(
        'loadedmetadata',
        () => {
          waiting = false;
          last = -1;
          apply(latest);
        },
        { once: true },
      );
      return;
    }
    if (Math.abs(latest - last) < 0.0004) return;
    last = latest;
    ctrl.scrub(Math.min(1, (latest * SPOT_END) / dur));
  };

  const attach = (): void => {
    if (dead) return;
    const existing = ScrollTrigger.getAll().find((item) => item.trigger === track);
    if (existing) {
      const tick = (): void => apply(existing.progress);
      const onRefresh = (): void => {
        last = -1;
        apply(existing.progress);
      };
      gsap.ticker.add(tick);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      apply(existing.progress);
      remove = () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
      };
      return;
    }
    // Seam pin is the normal path. This only runs if that trigger never mounted.
    const created = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      pin: stage,
      anticipatePin: 1,
      onUpdate: (self) => apply(self.progress),
    });
    remove = () => created.kill();
  };

  let frames = 0;
  const wait = (): void => {
    if (dead) return;
    if (window.__PROTO_READY__ || frames > 120) {
      attach();
      return;
    }
    frames += 1;
    requestAnimationFrame(wait);
  };
  wait();

  const stop = (): void => {
    if (dead) return;
    dead = true;
    remove();
    clearGate();
    hookRunwayHandoff(0);
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
