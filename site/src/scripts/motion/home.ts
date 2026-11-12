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
  const band = document.querySelector<HTMLElement>('[data-band]');
  if (!bar || !band) return () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      bar.classList.toggle('is-hidden', entry.isIntersecting);
    },
    { threshold: 0.2 },
  );
  observer.observe(band);
  signal.addEventListener('abort', () => observer.disconnect());
  return () => observer.disconnect();
}

function initRunwayProgress(signal: AbortSignal): () => void {
  const viewport = document.querySelector<HTMLElement>('[data-runway-viewport]');
  const bar = document.querySelector<HTMLElement>('[data-runway-bar]');
  if (!viewport || !bar) return () => {};
  const update = (): void => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const shown = max <= 1 ? 1 : Math.min(1, (viewport.scrollLeft + viewport.clientWidth) / viewport.scrollWidth);
    bar.style.transform = `scaleX(${shown})`;
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
  const zoom = document.querySelector<HTMLElement>('[data-hero-zoom]');
  const shift = document.querySelector<HTMLElement>('[data-hero-shift]');
  const copy = document.querySelector<HTMLElement>('[data-hero-copy]');
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  const triggers: ScrollTrigger[] = [];
  const splits: SplitText[] = [];

  const compact = window.matchMedia('(max-width: 960px)').matches;

  // Load Ken Burns: slow settle, then the scroll tween takes the scale.
  if (zoom) {
    gsap.fromTo(zoom, { scale: 1.08 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
  }

  if (hero && shift && zoom && copy) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    // Photo lags a little. The name stays with the frame, then both leave
    // upward while The Runway rises into the centre (clip 01).
    timeline.to(shift, { yPercent: compact ? 3 : 7, scale: compact ? 1.02 : 1.045, ease: 'none' }, 0);
    timeline.to(copy, { yPercent: compact ? -6 : -10, ease: 'none' }, 0);
    if (timeline.scrollTrigger) triggers.push(timeline.scrollTrigger);
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
  };
}

function initRunwayPin(): () => void {
  const pin = document.querySelector<HTMLElement>('[data-runway-pin]');
  const viewport = document.querySelector<HTMLElement>('[data-runway-viewport]');
  const track = document.querySelector<HTMLElement>('[data-runway-track]');
  if (!pin || !viewport || !track) return () => {};

  const tween = gsap.fromTo(
    track,
    { x: 0 },
    {
      x: () => -Math.max(0, track.scrollWidth - viewport.clientWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'center center',
        end: '+=78%',
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
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
  const arch = document.querySelector<HTMLElement>('[data-band-arch] .band__layer');
  if (!band || !sky || !arch) return () => {};
  // A light nod to clip 06: skyline slow, arch faster. Not the About hero.
  const tween = gsap.timeline({
    scrollTrigger: {
      trigger: band,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
  tween.fromTo(sky, { yPercent: 5 }, { yPercent: -7, ease: 'none' }, 0);
  tween.fromTo(arch, { yPercent: 12 }, { yPercent: -18, ease: 'none' }, 0);
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
    if (motion) releases.push(initRunwayPin());
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
