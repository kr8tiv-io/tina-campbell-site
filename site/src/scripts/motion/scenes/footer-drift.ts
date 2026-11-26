/**
 * Scene 10A A-blue-hour-drift.
 * The contact band is a muted loop: poster frame 0, paused off screen.
 * scene-video.ts loads it only once the band is within one viewport, and
 * never on a page the reader has not scrolled toward.
 * Gate mode leaves seeking to that helper. This file only marks the hook.
 */

import { sceneGateId } from '../scene-video';

export function initFooterDrift(_reduced: boolean, signal: AbortSignal): () => void {
  if (sceneGateId() === '10A') document.documentElement.classList.add('is-gate-10A');
  const stop = (): void => {
    document.documentElement.classList.remove('is-gate-10A');
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
