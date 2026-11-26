/**
 * Scene 04B B-crimson-ink-drop. The centre Work tile plays the picked clip
 * through scene-video.ts (mode play): hover or focus from 0, leave reverses
 * to 0 over 0.4 s, touch plays once at 60% in view.
 * While it plays the grid stills go mono and ease back to colour over 0.4 s
 * when playback ends or the pointer leaves. On a coarse pointer the first tap
 * plays the ink at the tile's size and reveals "View series"; the next tap
 * or that button opens the series.
 * Gate mode leaves the video in the tile. html.is-gate-04B already pins it
 * fixed to the viewport. Moving it after load() suspends the fetch.
 */

import { gsap } from '../runtime';
import { sceneGateId } from '../scene-video';

const FINE = '(hover: hover) and (pointer: fine)';

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
    root.classList.remove('is-gate-04B', 'is-ink-mono');
  };

  if (reduced || gate || !video || !link || !tile) {
    signal.addEventListener('abort', clearGate, { once: true });
    return clearGate;
  }

  const fine = window.matchMedia(FINE).matches;
  let floating = false;
  let tickOn = false;
  let armed = false;

  const monoOn = (): void => {
    root.classList.add('is-ink-mono');
  };
  const monoOff = (): void => {
    root.classList.remove('is-ink-mono');
  };

  const place = (): void => {
    if (!fine) return;
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
    if (tickOn || !fine) return;
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
    monoOn();
    place();
    armTick();
  };

  const onPause = (): void => {
    monoOff();
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('ended', onPause);
  video.addEventListener('seeked', onSeeked);

  const series = tile.querySelector<HTMLButtonElement>('[data-view-series]');
  const onSeries = (): void => {
    const href = link.getAttribute('href');
    if (href) window.location.assign(href);
  };
  const onTap = (event: Event): void => {
    if (fine || armed) return;
    event.preventDefault();
    event.stopPropagation();
    armed = true;
    if (series) series.hidden = false;
    if (video.paused || video.ended || video.currentTime < 0.05) {
      try {
        video.currentTime = 0;
      } catch {
        /* metadata may still be loading; play() queues it */
      }
      void video.play().catch(() => {});
    }
  };

  if (!fine) {
    link.addEventListener('click', onTap, true);
    series?.addEventListener('click', onSeries);
  }

  const stop = (): void => {
    video.removeEventListener('play', onPlay);
    video.removeEventListener('pause', onPause);
    video.removeEventListener('ended', onPause);
    video.removeEventListener('seeked', onSeeked);
    link.removeEventListener('click', onTap, true);
    series?.removeEventListener('click', onSeries);
    stopTick();
    floating = false;
    tile.classList.remove('is-ink');
    if (video.isConnected && link.isConnected) park(video, link);
    clearGate();
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
