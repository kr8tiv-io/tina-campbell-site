import { gsap } from './runtime';

/**
 * About hero, editorial split.
 * On load the photo opens from the seam and the ink-panel lines rise.
 * The crimson rule draws with that same entrance: the hero is already in
 * view, so a scrub that starts at the top would hide the seam until the
 * panel scrolls away. Scroll owns the 6 percent lag on the photograph.
 * Reduced motion leaves the still, the rule, and the type where they are.
 */
export function initAbout(reduced: boolean, _fine: boolean, signal: AbortSignal): () => void {
  const root = document.querySelector<HTMLElement>('[data-about-split]');
  if (!root) return () => {};

  if (reduced) {
    document.documentElement.classList.remove('about-motion');
    return () => {};
  }

  const clip = root.querySelector<HTMLElement>('[data-about-clip]');
  const drift = root.querySelector<HTMLElement>('[data-about-drift]');
  const rule = root.querySelector<HTMLElement>('[data-about-rule]');
  const lines = [...root.querySelectorAll<HTMLElement>('[data-about-rise]')];
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const ruleProp = narrow ? 'scaleX' : 'scaleY';

  const intro = gsap.timeline({ defaults: { ease: 'cine' } });
  if (clip) {
    intro.fromTo(
      clip,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'cine' },
      0,
    );
  }
  if (lines.length) {
    intro.fromTo(lines, { y: 12 }, { y: 0, duration: 0.8, stagger: 0.08, ease: 'cine' }, 0);
  }
  if (rule) {
    gsap.set(rule, { transformOrigin: narrow ? 'left center' : 'top center' });
    intro.fromTo(rule, { [ruleProp]: 0 }, { [ruleProp]: 1, duration: 0.9, ease: 'cine' }, 0);
  }

  const driftTween = drift
    ? gsap.fromTo(
        drift,
        { yPercent: 0 },
        {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
    : null;

  const kill = (): void => {
    intro.kill();
    const trigger = driftTween?.scrollTrigger;
    trigger?.kill();
    driftTween?.kill();
    if (clip) gsap.set(clip, { clearProps: 'clipPath' });
    if (drift) gsap.set(drift, { clearProps: 'transform' });
    if (rule) gsap.set(rule, { clearProps: 'transform' });
    lines.forEach((line) => gsap.set(line, { clearProps: 'transform' }));
  };

  signal.addEventListener('abort', kill, { once: true });
  return kill;
}
