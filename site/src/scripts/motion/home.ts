import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

function padMasks(split: SplitText): void {
  split.masks?.forEach((mask) => {
    if (!(mask instanceof HTMLElement)) return;
    mask.style.paddingBlock = '0.28em';
    mask.style.marginBlock = '-0.28em';
  });
}

function initBookBar(signal: AbortSignal): () => void {
  const bar = document.querySelector<HTMLElement>('[data-book-bar]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!bar || !hero) return () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      bar.classList.toggle('is-hidden', !entry.isIntersecting);
    },
    { threshold: 0.28 },
  );
  observer.observe(hero);
  signal.addEventListener('abort', () => observer.disconnect());
  return () => observer.disconnect();
}

function initRunwayProgress(signal: AbortSignal): () => void {
  const viewport = document.querySelector<HTMLElement>('[data-runway-viewport]');
  const bar = document.querySelector<HTMLElement>('[data-runway-bar]');
  if (!viewport || !bar) return () => {};
  const no = document.querySelector<HTMLElement>('[data-runway-no]');
  const loc = document.querySelector<HTMLElement>('[data-runway-loc]');
  const update = (): void => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const shown = max <= 1 ? 1 : Math.min(1, (viewport.scrollLeft + viewport.clientWidth) / viewport.scrollWidth);
    bar.style.transform = `scaleX(${Math.max(0.08, shown)})`;
    const items = [...viewport.querySelectorAll<HTMLElement>('.runway__item')];
    const mid = viewport.scrollLeft + viewport.clientWidth / 2;
    let best: HTMLElement | undefined;
    let bestDist = Number.POSITIVE_INFINITY;
    items.forEach((item) => {
      const center = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = item;
      }
    });
    if (!best) return;
    const num = best.dataset.no ?? '01';
    if (no) no.textContent = `No. ${num.padStart(3, '0')}`;
    if (loc) loc.textContent = best.dataset.location ?? '';
  };
  viewport.addEventListener('scroll', update, { signal, passive: true });
  update();
  return () => viewport.removeEventListener('scroll', update);
}

function initHeaderSolid(signal: AbortSignal): () => void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return () => {};
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-solid', self.scroll() > 12);
    },
  });
  return () => trigger.kill();
}

function initHero(): () => void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const shift = document.querySelector<HTMLElement>('[data-hero-shift]');
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  const triggers: ScrollTrigger[] = [];
  const splits: SplitText[] = [];

  const compact = window.matchMedia('(max-width: 960px)').matches;

  if (hero && shift && !compact) {
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const t = Math.min(1, self.progress / 0.5);
        gsap.set(shift, { y: -hero.offsetHeight * 0.18 * t });
        if (title) gsap.set(title, { scale: 1 + 0.15 * t, transformOrigin: 'center bottom' });
      },
    });
    triggers.push(trigger);
  }

  if (title) {
    try {
      const split = SplitText.create(title, {
        type: 'lines,chars',
        mask: 'lines',
        linesClass: 'line',
        charsClass: 'char',
        aria: 'auto',
      });
      splits.push(split);
      padMasks(split);
      gsap.fromTo(
        split.chars,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.7, stagger: 0.012, ease: 'power3.out' },
      );
    } catch {
      /* heading stays as written */
    }
  }

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    splits.forEach((split) => split.revert());
    if (shift) gsap.set(shift, { clearProps: 'transform' });
    if (title) gsap.set(title, { clearProps: 'transform' });
  };
}

function initRunwayRise(): () => void {
  const section = document.querySelector<HTMLElement>('[data-runway-pin]');
  const track = document.querySelector<HTMLElement>('[data-runway-track]');
  if (!section || !track) return () => {};
  const tween = gsap.fromTo(
    track,
    { y: 96 },
    {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 92%',
        end: 'top 48%',
        scrub: true,
      },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(track, { clearProps: 'transform' });
  };
}

function initStatement(): () => void {
  const heading = document.querySelector<HTMLElement>('[data-statement]');
  const sub = document.querySelector<HTMLElement>('[data-statement-sub]');
  const triggers: ScrollTrigger[] = [];
  const splits: SplitText[] = [];

  if (heading) {
    try {
      const split = SplitText.create(heading, {
        type: 'words',
        wordsClass: 'word',
        aria: 'auto',
      });
      splits.push(split);
      const tween = gsap.fromTo(
        split.words,
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: {
            trigger: heading,
            start: 'top 92%',
            end: 'top 52%',
            scrub: true,
          },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    } catch {
      /* heading stays as written */
    }
  }

  if (sub) {
    const tween = gsap.fromTo(
      sub,
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sub,
          start: 'top 88%',
          end: 'top 62%',
          scrub: true,
        },
      },
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    splits.forEach((split) => split.revert());
  };
}

function initBand(): () => void {
  const band = document.querySelector<HTMLElement>('[data-band]');
  const sky = document.querySelector<HTMLElement>('[data-band-sky] .band__layer');
  if (!band || !sky) return () => {};
  const tween = gsap.fromTo(
    sky,
    { yPercent: 6 },
    {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: band,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

function initTeaser(): () => void {
  const media = document.querySelector<HTMLElement>('[data-parallax-mask]');
  const photo = document.querySelector<HTMLElement>('[data-parallax-photo]');
  if (!media || !photo) return () => {};
  const tween = gsap.fromTo(
    photo,
    { yPercent: -4 },
    {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: media,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

export function initHome(reduced: boolean, fine: boolean, signal: AbortSignal): () => void {
  if (!document.querySelector('[data-page="home"]')) return () => {};

  const releases = [initBookBar(signal), initRunwayProgress(signal), initHeaderSolid(signal)];

  const wide = window.matchMedia('(min-width: 961px)').matches;
  const motion = !reduced && wide && fine;
  if (motion) document.documentElement.classList.add('is-motion');

  if (!reduced) {
    releases.push(initHero());
    if (motion) releases.push(initRunwayRise());
    releases.push(initStatement());
    releases.push(initTeaser());
    releases.push(initBand());
  }

  const releaseMotionClass = (): void => {
    document.documentElement.classList.remove('is-motion');
  };

  const refresh = (): void => ScrollTrigger.refresh();
  window.addEventListener('load', refresh, { once: true });

  return () => {
    window.removeEventListener('load', refresh);
    releaseMotionClass();
    releases.forEach((release) => release());
  };
}
