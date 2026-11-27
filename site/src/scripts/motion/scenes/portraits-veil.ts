/**
 * Scene 11B B-veil-wipe.
 * The bridal chapter opens with the picked clip, full-bleed, between the
 * portrait stills and the bridal stills. Scroll progress maps straight onto
 * currentTime: the veil drifts through about 2.0 s, sweeps hard from about
 * 3.0 s to 5.5 s, then brightens to the end.
 * The chapter title uses core SplitText (chars, mask, cine). Gate mode does
 * not seek and does not pin: scene-video.ts owns the element.
 * Seam 10A-11B stays on the harness. On this route the footer band follows
 * the chapter, so the pair is not inserted.
 */

import { gsap, ScrollTrigger, SplitText } from '../runtime';
import { getSceneVideo, sceneGateId } from '../scene-video';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function splitTitle(title: HTMLElement, splits: SplitText[]): void {
  const created = SplitText.create(title, {
    type: 'chars,words,lines',
    mask: 'chars',
    aria: 'auto',
  });
  splits.push(created);
  created.masks?.forEach((mask) => {
    if (!(mask instanceof HTMLElement)) return;
    mask.style.paddingBlock = '0.28em';
    mask.style.marginBlock = '-0.28em';
  });
  const box = title.getBoundingClientRect();
  if (box.top < window.innerHeight * 0.92 && box.bottom > 0) return;
  gsap.from(created.chars, {
    yPercent: 110,
    duration: 0.55,
    stagger: 0.03,
    ease: 'cine',
    scrollTrigger: {
      trigger: title,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    },
  });
}

export function initPortraitsVeil(reduced: boolean, signal: AbortSignal): () => void {
  const gate = sceneGateId();
  if (gate === '11B') document.documentElement.classList.add('is-gate-11B');

  const clear = (): void => {
    document.documentElement.classList.remove('is-gate-11B');
  };

  if (reduced || gate) {
    signal.addEventListener('abort', clear, { once: true });
    return clear;
  }

  const stage = document.querySelector<HTMLElement>('[data-veil]');
  if (!stage) return clear;

  const splits: SplitText[] = [];
  const title = stage.querySelector<HTMLElement>('h2');
  if (title) splitTitle(title, splits);

  let dead = false;
  const mm = gsap.matchMedia();

  const bind = (pin: boolean): (() => void) => {
    let last = -1;
    let frame = 0;
    const apply = (progress: number): void => {
      const value = clamp01(progress);
      if (last >= 0 && Math.abs(value - last) < 0.0004) return;
      last = value;
      stage.dataset.sceneProgress = value.toFixed(4);
      getSceneVideo('11B')?.scrub(value);
    };
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: pin ? 'top top' : 'top 85%',
      end: pin ? '+=170%' : 'bottom 15%',
      pin: pin ? stage : false,
      pinSpacing: pin,
      scrub: true,
      anticipatePin: pin ? 1 : 0,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
    });
    const kick = (): void => {
      if (dead) return;
      apply(trigger.progress);
      if (!getSceneVideo('11B')) frame = requestAnimationFrame(kick);
    };
    kick();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      trigger.kill();
    };
  };

  mm.add('(min-width: 961px)', () => {
    const release = bind(true);
    return release;
  });
  mm.add('(max-width: 960px)', () => {
    const release = bind(false);
    return release;
  });

  const stop = (): void => {
    if (dead) return;
    dead = true;
    mm.revert();
    splits.forEach((item) => item.revert());
    clear();
    delete stage.dataset.sceneProgress;
  };
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}
