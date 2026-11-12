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

function headerOffset(): number {
  const header = document.querySelector<HTMLElement>('.site-header');
  return header?.offsetHeight || 96;
}

function unmask(el: HTMLElement, reduced: boolean, mobile: boolean): void {
  if (reduced) return;
  const dir = el.dataset.unmaskDir;
  const from =
    dir === 'left' ? 'inset(0 100% 0 0)' : dir === 'right' ? 'inset(0 0 0 100%)' : 'inset(0 0 100% 0)';
  const img = el.querySelector('img');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 86%',
      toggleActions: 'play none none reverse',
    },
  });
  tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0 0 0% 0)', duration: mobile ? 0.55 : 0.9, ease: 'power3.out' }, 0);
  if (img) {
    tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: mobile ? 0.7 : 1.05, ease: 'power3.out' }, 0);
  }
}

function playFashionIntro(splits: SplitText[]): void {
  const root = document.documentElement;
  const title = document.querySelector<HTMLElement>('[data-fe-title]');
  const mark = document.querySelector<HTMLElement>('[data-fe-mark]');
  const leads = [...document.querySelectorAll<HTMLElement>('[data-fe-lead]')];
  const rows = [...document.querySelectorAll<HTMLElement>('[data-series-link]')];
  const rule = document.querySelector<HTMLElement>('[data-fe-rule]');
  const view = document.querySelector<HTMLElement>('[data-fe-view]');
  const photos = [...document.querySelectorAll<HTMLElement>('.fe-shot img')];
  if (!title || !view) return;

  const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto' });
  splits.push(split);
  padMasks(split);
  gsap.set(split.lines, { yPercent: 130 });
  gsap.set(title, { autoAlpha: 1 });
  if (photos.length) gsap.set(photos, { scale: 1.08, transformOrigin: 'center center' });

  root.dataset.fePhase = 'play';
  const tl = gsap.timeline({
    onComplete: () => {
      root.dataset.fePhase = 'done';
      root.classList.remove('fe-intro');
    },
  });
  if (mark) tl.fromTo(mark, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.35);
  if (rule) tl.fromTo(rule, { scaleY: 0 }, { scaleY: 1, duration: 0.85, ease: 'power2.out' }, 0.28);
  tl.to(split.lines, { yPercent: 0, duration: 0.9, stagger: 0.4, ease: 'power3.out' }, 0.55);
  leads.forEach((lead, index) => {
    tl.fromTo(lead, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, 1.15 + index * 0.25);
  });
  if (rows.length) {
    tl.fromTo(
      rows,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.38, ease: 'power2.out' },
      2,
    );
  }
  tl.fromTo(
    view,
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 1.65, ease: 'power2.inOut' },
    2.7,
  );
  if (photos.length) tl.to(photos, { scale: 1, duration: 1.8, ease: 'power2.out' }, 2.7);
}

function pinFashionColumn(): void {
  const section = document.querySelector<HTMLElement>('[data-fe-split]');
  const view = document.querySelector<HTMLElement>('[data-fe-view]');
  const track = document.querySelector<HTMLElement>('[data-fe-track]');
  if (!section || !view || !track) return;
  const shots = [...track.querySelectorAll<HTMLElement>('[data-series]')];
  const links = [...document.querySelectorAll<HTMLElement>('[data-series-link]')];

  const setActive = (slug: string | undefined): void => {
    if (!slug) return;
    links.forEach((link) => {
      const on = link.dataset.seriesLink === slug;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    section.dataset.activeSeries = slug;
  };

  const extra = (): number => Math.max(0, track.scrollHeight - view.clientHeight);
  if (extra() < 24) {
    section.dataset.pinDistance = '0';
    return;
  }

  section.dataset.pinDistance = String(Math.round(extra()));
  gsap.to(track, {
    y: () => -extra(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${extra()}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        section.dataset.pinProgress = self.progress.toFixed(4);
        const travel = extra();
        const probe = travel * self.progress + view.clientHeight * 0.42;
        let best = shots[0];
        let bestDist = Number.POSITIVE_INFINITY;
        shots.forEach((shot) => {
          const mid = shot.offsetTop + shot.offsetHeight / 2;
          const dist = Math.abs(mid - probe);
          if (dist < bestDist) {
            bestDist = dist;
            best = shot;
          }
        });
        setActive(best?.dataset.series);
      },
    },
  });
}

function initFashion(reduced: boolean, fine: boolean, mobile: boolean, splits: SplitText[]): void {
  const quote = document.querySelector<HTMLElement>('[data-fe-quote]');
  if (quote && !reduced) {
    const split = SplitText.create(quote, { type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto' });
    splits.push(split);
    padMasks(split);
    gsap.from(split.lines, {
      yPercent: 120,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: quote,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  document.querySelectorAll<HTMLElement>('.fe-strip [data-unmask]').forEach((el) => unmask(el, reduced, mobile));

  const magnet = document.querySelector<HTMLElement>('[data-magnet]');
  if (magnet && fine && !reduced && !mobile) {
    const xTo = gsap.quickTo(magnet, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(magnet, 'y', { duration: 0.45, ease: 'power3.out' });
    const onMove = (event: PointerEvent): void => {
      const rect = magnet.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) < 150) {
        xTo(dx * 0.28);
        yTo(dy * 0.28);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener('pointermove', onMove);
    magnet.dataset.magnetBound = '1';
  }

  if (reduced || mobile || !fine || !document.documentElement.classList.contains('fe-intro')) {
    document.documentElement.classList.remove('fe-intro');
    document.documentElement.dataset.fePhase = 'static';
    return;
  }

  playFashionIntro(splits);
  pinFashionColumn();
}

function initSeries(reduced: boolean, fine: boolean, mobile: boolean, splits: SplitText[]): void {
  const title = document.querySelector<HTMLElement>('[data-series-title]');
  if (title && !reduced) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto' });
    splits.push(split);
    padMasks(split);
    gsap.set(title, { autoAlpha: 1 });
    gsap.from(split.lines, {
      yPercent: 120,
      duration: mobile ? 0.7 : 0.95,
      stagger: 0.08,
      ease: 'power3.out',
    });
  }
  document.documentElement.classList.remove('series-intro');

  const cover = document.querySelector<HTMLElement>('[data-cover]');
  const zoom = document.querySelector<HTMLElement>('[data-cover-zoom]');
  if (cover && zoom && !reduced && fine && !mobile) {
    gsap.fromTo(
      zoom,
      { scale: 1.1 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: cover,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }

  if (!reduced) {
    gsap.from('[data-credit]', {
      autoAlpha: 0,
      y: mobile ? 10 : 18,
      duration: mobile ? 0.55 : 0.8,
      stagger: 0.09,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.spread',
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  document.querySelectorAll<HTMLElement>('[data-unmask]').forEach((el) => unmask(el, reduced, mobile));
}

function initPortraits(reduced: boolean, fine: boolean, mobile: boolean): void {
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
  const desktop = !reduced && fine && !mobile && document.documentElement.classList.contains('pbc-motion');
  if (!desktop) document.documentElement.classList.remove('pbc-motion');

  chapters.forEach((chapter) => {
    const copy = chapter.querySelector<HTMLElement>('.chapter__copy');
    if (copy && !reduced) {
      gsap.from(copy, {
        autoAlpha: 0,
        y: mobile ? 12 : 26,
        duration: mobile ? 0.6 : 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });
    }
    if (!desktop) return;

    const shots = [...chapter.querySelectorAll<HTMLElement>('.chapter__shot')];
    if (shots.length < 2) return;
    gsap.set(shots, { autoAlpha: (index) => (index === 0 ? 1 : 0) });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: () => `top ${headerOffset()}px`,
        end: '+=110%',
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    shots.forEach((shot, index) => {
      if (index === 0) return;
      const at = index - 1;
      const prev = shots[index - 1];
      if (!prev) return;
      tl.to(prev, { autoAlpha: 0, duration: 1, ease: 'sine.inOut' }, at);
      tl.to(shot, { autoAlpha: 1, duration: 1, ease: 'sine.inOut' }, at);
    });
  });
}

export function initEditorial(reduced: boolean, fine: boolean, _signal: AbortSignal): () => void {
  const splits: SplitText[] = [];
  const page = document.querySelector('main')?.dataset.page;
  const mobile = window.innerWidth <= 960;

  if (page !== 'fashion') document.documentElement.classList.remove('fe-intro');
  if (page !== 'series') document.documentElement.classList.remove('series-intro');
  if (page !== 'portraits') document.documentElement.classList.remove('pbc-motion');

  if (page === 'fashion') initFashion(reduced, fine, mobile, splits);
  if (page === 'series') initSeries(reduced, fine, mobile, splits);
  if (page === 'portraits') initPortraits(reduced, fine, mobile);

  return () => {
    splits.forEach((split) => split.revert());
    document.documentElement.classList.remove('fe-intro', 'series-intro', 'pbc-motion');
  };
}
