/**
 * Scene 04B B-crimson-ink-drop. The centre Work tile plays the picked clip
 * through scene-video.ts (mode play): hover or focus from 0, leave reverses
 * to 0 over 0.4 s, touch plays once at 60% in view.
 * Gate mode leaves the video in the tile. html.is-gate-04B already pins it
 * fixed to the viewport. Moving it after load() suspends the fetch.
 */

import { gsap } from '../runtime';
import { sceneGateId } from '../scene-video';

function park(video: HTMLVideoElement, link: HTMLElement): void {
  video.classList.remove('is-playing', 'is-floating');
  video.style.top = '';
  video.style.left = '';
  video.style.width = '';
  video.style.height = '';
  const loupe = link.querySelector('[data-scene-loupe]');
  if (loupe) link.insertBefore(video, loupe);
  else link.appendChild(video);
}

export function initWorkInk(reduced: boolean, signal: AbortSignal): () => void {
  const root = document.documentElement;
  const gate = sceneGateId();
  if (gate === '04B') root.classList.add('is-gate-04B');

  const video = document.querySelector<HTMLVideoElement>('video[data-scene-video="04B"]');
  const link = video?.closest<HTMLElement>('[data-scene-hit]');
  const tile = video?.closest<HTMLElement>('.tile');

  const clearGate = (): void => {
    root.classList.remove('is-gate-04B');
  };

  if (reduced || gate || !video || !link || !tile) {
    signal.addEventListener('abort', clearGate, { once: true });
    return clearGate;
  }

  let floating = false;
  let tickOn = false;

  const place = (): void => {
    const rect = link.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    video.classList.add('is-floating');
    video.style.top = `${rect.top}px`;
    video.style.left = `${rect.left}px`;
    video.style.width = `${rect.width}px`;
    video.style.height = `${rect.height}px`;
    if (video.parentElement !== document.body) {
      const resume = !video.paused;
      document.body.appendChild(video);
      // The float has to leave the tile so the header stays above it.
      // That move aborts an in-flight fetch. Restart once if nothing arrived.
      if (video.readyState === 0 && video.querySelector('source')) {
        video.load();
        if (resume) void video.play().catch(() => {});
      }
    }
    floating = true;
    tile.classList.add('is-ink');
  };

  const tick = (): void => {
    if (floating) place();
  };

  const armTick = (): void => {
    if (tickOn) return;
    tickOn = true;
    gsap.ticker.add(tick);
  };

  const stopTick = (): void => {
    if (!tickOn) return;
    tickOn = false;
    gsap.ticker.remove(tick);
  };

  const onSeeked = (): void => {
    if (!video.paused || video.currentTime > 0.045) return;
    floating = false;
    stopTick();
    tile.classList.remove('is-ink');
    park(video, link);
  };

  const onPlay = (): void => {
    place();
    armTick();
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('seeked', onSeeked);

  const stop = (): void => {
    video.removeEventListener('play', onPlay);
    video.removeEventListener('seeked', onSeeked);
    stopTick();
    floating = false;
    tile.classList.remove('is-ink');
    if (video.isConnected && link.isConnected) park(video, link);
    clearGate();
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
