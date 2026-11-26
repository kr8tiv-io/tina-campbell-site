/**
 * Scene 01A living gown, on the page.
 * Gate mode leaves the element to scene-video.ts (it seeks every frame).
 * First view plays 0 to 6.04 s from the tucked pose. After that the hem
 * loops the only >= 3 s window whose ends meet: frames 72 to 143
 * (3.00 s to 5.958 s). That join is the closest pair in the clip.
 */

import { sceneGateId } from '../scene-video';

const LOOP_IN = 72 / 24;
const LOOP_OUT = 143 / 24;

export function initLivingGown(reduced: boolean, signal: AbortSignal): () => void {
  if (reduced || sceneGateId()) return () => {};
  const video = document.querySelector<HTMLVideoElement>('video[data-scene-video="01A"]');
  if (!video) return () => {};

  let intro = true;
  let primed = false;
  let seeking = false;
  let dead = false;
  let seekTimer = 0;

  // bindLoop sets loop = true. The native loop would restart at the tucked
  // frame and skip the living window. Shadow the property after forcing it off.
  video.loop = false;
  try {
    Object.defineProperty(video, 'loop', {
      configurable: true,
      get: () => false,
      set: () => {},
    });
  } catch {
    video.loop = false;
  }

  const releaseSeek = (): void => {
    seeking = false;
    if (seekTimer) window.clearTimeout(seekTimer);
    seekTimer = 0;
  };

  const go = (time: number): void => {
    if (seeking || dead) return;
    seeking = true;
    video.addEventListener('seeked', releaseSeek, { once: true });
    seekTimer = window.setTimeout(releaseSeek, 240);
    try {
      video.currentTime = time;
    } catch {
      releaseSeek();
    }
  };

  const prime = (): void => {
    if (primed || !intro || dead) return;
    if (video.readyState < 1) return;
    primed = true;
    video.loop = false;
    if (video.currentTime > 0.04) go(0);
  };

  const onTime = (): void => {
    if (dead) return;
    video.loop = false;
    prime();
    const dur = video.duration;
    const t = video.currentTime;
    if (intro) {
      if (Number.isFinite(dur) && dur > 0 && (video.ended || t >= dur - 1 / 24)) {
        intro = false;
        video.dataset.gownPhase = 'loop';
        go(LOOP_IN);
      }
      return;
    }
    if (t >= LOOP_OUT - 0.001 || t < LOOP_IN - 0.05) go(LOOP_IN);
  };

  const onPlay = (): void => {
    prime();
  };
  const onEnded = (): void => {
    if (dead) return;
    intro = false;
    video.dataset.gownPhase = 'loop';
    go(LOOP_IN);
    video.play().catch(() => {});
  };

  video.dataset.gownPhase = 'intro';
  video.addEventListener('loadedmetadata', prime, { signal });
  video.addEventListener('play', onPlay, { signal });
  video.addEventListener('timeupdate', onTime, { signal });
  video.addEventListener('ended', onEnded, { signal });

  const stop = (): void => {
    if (dead) return;
    dead = true;
    if (seekTimer) window.clearTimeout(seekTimer);
    delete video.dataset.gownPhase;
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
