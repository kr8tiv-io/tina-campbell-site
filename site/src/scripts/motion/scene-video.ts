/**
 * Shared video scenes (01A, 03B, 04B, 06B, 09B, 10A, 11B).
 * One helper: manifest sources, 1080 vs 720, loop | scrub | play, gate hook.
 * Later prompts must reuse this file. Do not fork it.
 */

export type SceneMode = 'loop' | 'scrub' | 'play';

export interface SceneController {
  id: string;
  mode: SceneMode;
  video: HTMLVideoElement;
  /** progress 0..1 → currentTime. Coalesced to one seek per frame. */
  scrub: (progress: number) => void;
  destroy: () => void;
}

interface SceneEntry {
  mode: SceneMode;
  sources: { av1_1080: string; h264_1080: string; h264_720: string };
  poster: { webp: string; jpg: string };
  end: { webp: string; jpg: string };
}

interface Manifest {
  scenes: Record<string, SceneEntry>;
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const controllers = new Map<string, SceneController>();

let manifestPromise: Promise<Manifest | null> | null = null;
let gateStyle: HTMLStyleElement | null = null;

export function sceneGateId(): string | null {
  if (typeof location === 'undefined') return null;
  const params = new URLSearchParams(location.search);
  if (!params.has('record')) return null;
  const gate = params.get('gate');
  return gate && gate.length > 0 ? gate : null;
}

export function getSceneVideo(id: string): SceneController | undefined {
  return controllers.get(id);
}

function prefersReduced(): boolean {
  return window.matchMedia(REDUCED).matches;
}

function prefersSmallSource(): boolean {
  if (window.innerWidth < 1000) return true;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return nav.connection?.saveData === true;
}

function fallbackEntry(id: string, video: HTMLVideoElement): SceneEntry {
  const raw = video.dataset.sceneMode;
  const mode: SceneMode = raw === 'scrub' || raw === 'play' || raw === 'loop' ? raw : 'loop';
  return {
    mode,
    sources: {
      av1_1080: `/media/scenes/${id}/${id}-1080.webm`,
      h264_1080: `/media/scenes/${id}/${id}-1080.mp4`,
      h264_720: `/media/scenes/${id}/${id}-720.mp4`,
    },
    poster: {
      webp: `/media/scenes/${id}/${id}-poster.webp`,
      jpg: `/media/scenes/${id}/${id}-poster.jpg`,
    },
    end: {
      webp: `/media/scenes/${id}/${id}-end.webp`,
      jpg: `/media/scenes/${id}/${id}-end.jpg`,
    },
  };
}

function loadManifest(): Promise<Manifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetch('/media/scenes/manifest.json')
      .then((res) => (res.ok ? (res.json() as Promise<Manifest>) : null))
      .catch(() => null);
  }
  return manifestPromise;
}

function installGateStyles(): void {
  document.documentElement.classList.add('is-scene-gate');
  if (gateStyle) return;
  const style = document.createElement('style');
  style.dataset.sceneGate = '';
  style.textContent = [
    'html.is-scene-gate [data-scene-overlay],',
    'html.is-scene-gate [data-scene-copy],',
    'html.is-scene-gate .grain,',
    'html.is-scene-gate .site-header,',
    'html.is-scene-gate .cursor,',
    'html.is-scene-gate .loader,',
    'html.is-scene-gate [data-book-bar],',
    'html.is-scene-gate .ink-layer,',
    'html.is-scene-gate .flood-layer,',
    'html.is-scene-gate .spot-layer,',
    'html.is-scene-gate .veil-layer,',
    'html.is-scene-gate .leak-layer,',
    'html.is-scene-gate .mask-svg{display:none!important}',
    'html.is-scene-gate video[data-scene-video]{',
    'opacity:1!important;filter:none!important;transform:none!important;display:block!important}',
    'html.is-scene-gate [data-seam-media],',
    'html.is-scene-gate [data-hero-shift],',
    'html.is-scene-gate [data-hero-zoom]{transform:none!important;filter:none!important}',
  ].join('');
  document.head.append(style);
  gateStyle = style;
}

function stillOf(video: HTMLVideoElement): HTMLElement | null {
  return video.parentElement?.querySelector<HTMLElement>('[data-scene-still]') ?? null;
}

function paintStill(still: HTMLElement, src: string): void {
  if (still instanceof HTMLImageElement) {
    if (still.currentSrc.includes(src) || still.getAttribute('src') === src) return;
    still.src = src;
    return;
  }
  if (still.style.backgroundImage.includes(src)) return;
  still.style.backgroundImage = `url("${src}")`;
}

function showEndStill(video: HTMLVideoElement, entry: SceneEntry): void {
  const still = stillOf(video);
  if (!still) return;
  // A picture source already selects the end frame for reduced motion.
  if (still instanceof HTMLImageElement && still.closest('picture')?.querySelector('source[media*="reduced-motion"]')) {
    return;
  }
  paintStill(still, entry.end.webp);
}

/** Poster (or the end still) once the band is close. No request before that. */
function revealStill(video: HTMLVideoElement): void {
  const still = stillOf(video);
  if (!still) return;
  const src = prefersReduced() ? still.dataset.sceneEnd : still.dataset.scenePoster;
  if (!src) return;
  paintStill(still, src);
}

const idleKicks = new WeakMap<HTMLVideoElement, () => void>();

/**
 * A load that picks a source and then sits at readyState 0 / NETWORK_IDLE
 * never fires loadedmetadata. One extra load() after that state has had 1.5s
 * to clear. One timer, no loop of load() calls, cleared on abort.
 */
function armIdleLoadKick(video: HTMLVideoElement, signal: AbortSignal): void {
  idleKicks.get(video)?.();
  let kicked = false;
  let timer = 0;
  const stop = (): void => {
    if (timer) window.clearTimeout(timer);
    timer = 0;
    video.removeEventListener('loadedmetadata', stop);
    signal.removeEventListener('abort', stop);
    if (idleKicks.get(video) === stop) idleKicks.delete(video);
  };
  const tick = (): void => {
    timer = 0;
    if (signal.aborted || kicked || !video.isConnected) return;
    if (video.readyState > 0) {
      stop();
      return;
    }
    const asked = video.preload === 'auto' || video.dataset.sceneSrc != null;
    if (!asked) return;
    if (video.networkState === video.NETWORK_IDLE) {
      kicked = true;
      video.load();
      return;
    }
    timer = window.setTimeout(tick, 1500);
  };
  idleKicks.set(video, stop);
  video.addEventListener('loadedmetadata', stop);
  signal.addEventListener('abort', stop);
  timer = window.setTimeout(tick, 1500);
}

function attachSources(video: HTMLVideoElement, entry: SceneEntry, small: boolean, signal: AbortSignal): void {
  const tier = small ? '720' : '1080';
  if (video.dataset.sceneSrc === tier && video.querySelector('source')) return;
  const sources: Array<{ src: string; type: string }> = small
    ? [{ src: entry.sources.h264_720, type: 'video/mp4' }]
    : [
        { src: entry.sources.av1_1080, type: 'video/webm' },
        { src: entry.sources.h264_1080, type: 'video/mp4' },
      ];
  video.replaceChildren();
  for (const item of sources) {
    const source = document.createElement('source');
    source.src = item.src;
    source.type = item.type;
    video.append(source);
  }
  video.dataset.sceneSrc = tier;
  video.load();
  if (video.readyState === 0) armIdleLoadKick(video, signal);
}

function markPlaying(video: HTMLVideoElement): void {
  const show = (): void => {
    video.classList.add('is-playing');
  };
  if (video.readyState >= 2) show();
  else video.addEventListener('loadeddata', show, { once: true });
}

function createScrubber(video: HTMLVideoElement): (progress: number) => void {
  let target = 0;
  let frame = 0;
  let pending: number | null = null;
  let seeking = false;

  const seek = (time: number): void => {
    const dur = video.duration;
    if (!Number.isFinite(dur) || dur <= 0) {
      pending = time;
      video.addEventListener(
        'loadedmetadata',
        () => {
          const next = pending;
          pending = null;
          if (next != null) seek(next);
        },
        { once: true },
      );
      return;
    }
    const clamped = Math.min(Math.max(time, 0), Math.max(0, dur - 1 / 48));
    if (seeking) {
      pending = clamped;
      return;
    }
    if (Math.abs(video.currentTime - clamped) < 0.5 / 24 && pending == null) return;
    seeking = true;
    pending = null;
    const release = (): void => {
      if (!seeking) return;
      seeking = false;
      const next = pending;
      pending = null;
      if (next != null) seek(next);
    };
    // Release on seeked. A paused scrub presents one frame per seek, so a
    // requestVideoFrameCallback registered after seeked never runs and every
    // later seek stays stuck in `pending`.
    video.addEventListener('seeked', release, { once: true });
    try {
      video.currentTime = clamped;
    } catch {
      seeking = false;
    }
  };

  return (progress: number): void => {
    target = Math.min(1, Math.max(0, progress));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const dur = video.duration;
      if (!Number.isFinite(dur) || dur <= 0) {
        video.addEventListener('loadedmetadata', () => seek(target * video.duration), { once: true });
        return;
      }
      seek(target * dur);
    });
  };
}

function onScreen(video: HTMLVideoElement): boolean {
  const box = video.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}

function bindLoop(video: HTMLVideoElement, signal: AbortSignal, eager: boolean, prepare: () => void): void {
  video.loop = true;
  const arm = (): void => {
    prepare();
    markPlaying(video);
    video.play().catch(() => {
      /* autoplay can wait for a gesture; the poster stays up */
    });
  };
  // Footer 10A: sources may already be attached because the band is within
  // one viewport. Playback still waits until the picture is actually on screen.
  const lazy = video.dataset.sceneLazy === '1';
  const io = new IntersectionObserver(
    (entries) => {
      const on = entries.some((entry) => entry.isIntersecting);
      if (!on) {
        video.pause();
        return;
      }
      arm();
    },
    { threshold: lazy ? 0.01 : 0.12 },
  );
  const start = (): void => {
    if (signal.aborted) return;
    io.observe(video);
    if (onScreen(video)) arm();
    else if (lazy) prepare();
  };
  if (eager || lazy) start();
  else whenIdle(start);
  signal.addEventListener('abort', () => io.disconnect());
}

function bindScrub(video: HTMLVideoElement, signal: AbortSignal): void {
  video.pause();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) markPlaying(video);
      else video.pause();
    },
    { rootMargin: '20% 0px', threshold: 0 },
  );
  whenIdle(() => {
    if (!signal.aborted) io.observe(video);
  });
  signal.addEventListener('abort', () => io.disconnect());
}

function bindPlay(video: HTMLVideoElement, signal: AbortSignal): void {
  const hit = video.closest<HTMLElement>('[data-scene-hit]') ?? video.parentElement ?? video;
  let reverseFrame = 0;
  let playedOnce = false;
  const stopReverse = (): void => {
    if (reverseFrame) cancelAnimationFrame(reverseFrame);
    reverseFrame = 0;
  };
  const forward = (): void => {
    stopReverse();
    markPlaying(video);
    video.play().catch(() => {});
  };
  const reverse = (): void => {
    stopReverse();
    video.pause();
    const from = video.currentTime;
    const start = performance.now();
    const step = (now: number): void => {
      const k = Math.min(1, (now - start) / 400);
      video.currentTime = from * (1 - k);
      if (k < 1) reverseFrame = requestAnimationFrame(step);
      else {
        video.currentTime = 0;
        reverseFrame = 0;
      }
    };
    reverseFrame = requestAnimationFrame(step);
  };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    hit.addEventListener('pointerenter', forward, { signal });
    hit.addEventListener('pointerleave', reverse, { signal });
    hit.addEventListener('focusin', forward, { signal });
    hit.addEventListener('focusout', reverse, { signal });
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        if (playedOnce) return;
        if (entries.some((entry) => entry.intersectionRatio >= 0.6)) {
          playedOnce = true;
          forward();
          io.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    whenIdle(() => {
      if (!signal.aborted) io.observe(video);
    });
    signal.addEventListener('abort', () => io.disconnect());
  }
  signal.addEventListener('abort', stopReverse);
}

function whenIdle(run: () => void): void {
  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') ric(() => run(), { timeout: 1500 });
  else window.setTimeout(run, 200);
}

function prime(video: HTMLVideoElement): void {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  if (!video.getAttribute('preload')) video.preload = 'none';
}

function mountOne(
  video: HTMLVideoElement,
  id: string,
  entry: SceneEntry,
  gate: string | null,
  signal: AbortSignal,
): SceneController {
  const mode: SceneMode =
    video.dataset.sceneMode === 'scrub' || video.dataset.sceneMode === 'play' || video.dataset.sceneMode === 'loop'
      ? video.dataset.sceneMode
      : entry.mode;
  prime(video);
  const scrub = createScrubber(video);
  const ctrl: SceneController = { id, mode, video, scrub, destroy: () => {} };
  let observer: IntersectionObserver | null = null;

  const destroy = (): void => {
    observer?.disconnect();
    video.pause();
    controllers.delete(id);
  };
  ctrl.destroy = destroy;
  signal.addEventListener('abort', destroy, { once: true });

  if (prefersReduced()) {
    showEndStill(video, entry);
    video.preload = 'none';
    video.replaceChildren();
    delete video.dataset.sceneSrc;
    controllers.set(id, ctrl);
    return ctrl;
  }

  const gated = gate === id;
  if (gated) {
    video.preload = 'auto';
    video.autoplay = false;
    video.pause();
    attachSources(video, entry, false, signal);
    const ready = (): void => {
      window.__SCENE_READY__ = window.__SCENE_READY__ || {};
      window.__SCENE_READY__[id] = true;
    };
    if (video.readyState >= 1) ready();
    else video.addEventListener('loadedmetadata', ready, { once: true });
    controllers.set(id, ctrl);
    return ctrl;
  }

  if (gate) {
    controllers.set(id, ctrl);
    return ctrl;
  }

  const small = prefersSmallSource();
  const eager = video.closest('[data-hero]') !== null;
  const load = (): void => {
    if (signal.aborted || video.dataset.sceneSrc) return;
    video.preload = mode === 'loop' ? 'auto' : 'metadata';
    attachSources(video, entry, small, signal);
  };

  if (mode === 'loop') {
    bindLoop(video, signal, eager, load);
  } else if (mode === 'scrub') {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) load();
      },
      { rootMargin: video.dataset.sceneMargin || '30% 0px', threshold: 0 },
    );
    whenIdle(() => {
      if (!signal.aborted) observer?.observe(video);
    });
    bindScrub(video, signal);
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) load();
      },
      { rootMargin: '10% 0px', threshold: [0, 0.6] },
    );
    whenIdle(() => {
      if (!signal.aborted) observer?.observe(video);
    });
    bindPlay(video, signal);
  }

  controllers.set(id, ctrl);
  return ctrl;
}

/** Upgrade every `video[data-scene-video]` on the page. Safe to call once per page load. */
export function initSceneVideos(signal: AbortSignal): () => void {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-scene-video]')];
  if (videos.length === 0) return () => {};
  const gate = sceneGateId();
  if (gate) installGateStyles();
  let dead = false;
  const mounted: SceneController[] = [];
  const watchers: IntersectionObserver[] = [];

  const mountVideo = (video: HTMLVideoElement, manifest: Manifest | null): void => {
    if (dead || signal.aborted) return;
    const id = video.dataset.sceneVideo;
    if (!id || controllers.has(id)) return;
    const entry = manifest?.scenes?.[id] ?? fallbackEntry(id, video);
    mounted.push(mountOne(video, id, entry, gate, signal));
  };

  const mountAll = (list: HTMLVideoElement[]): void => {
    if (list.length === 0 || dead || signal.aborted) return;
    void loadManifest().then((manifest) => {
      if (dead || signal.aborted) return;
      for (const video of list) mountVideo(video, manifest);
    });
  };

  // data-scene-lazy waits until the element is within one viewport, and does
  // not fetch the manifest on a page whose only scene is that band.
  const lazy = gate ? [] : videos.filter((video) => video.dataset.sceneLazy === '1');
  const now = gate ? videos : videos.filter((video) => video.dataset.sceneLazy !== '1');
  mountAll(now);

  for (const video of lazy) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        revealStill(video);
        whenIdle(() => mountAll([video]));
      },
      { rootMargin: '100% 0px', threshold: 0 },
    );
    watchers.push(io);
    io.observe(video);
  }

  const destroy = (): void => {
    if (dead) return;
    dead = true;
    watchers.splice(0).forEach((io) => io.disconnect());
    mounted.splice(0).forEach((ctrl) => ctrl.destroy());
    for (const video of videos) {
      const id = video.dataset.sceneVideo;
      if (id) controllers.get(id)?.destroy();
    }
  };
  signal.addEventListener('abort', destroy, { once: true });
  return destroy;
}
