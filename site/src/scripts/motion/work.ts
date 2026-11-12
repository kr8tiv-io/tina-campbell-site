import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const FILTERS = new Set(['all', 'fashion', 'runway', 'portraits', 'bridal', 'couples', 'edmonton']);

function readFilter(): string {
  const value = new URLSearchParams(window.location.search).get('filter') || 'all';
  return FILTERS.has(value) ? value : 'all';
}

function urlFor(filter: string): string {
  return filter === 'all' ? '/work/' : `/work/?filter=${filter}`;
}

function canWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function initWork(reduced: boolean, fine: boolean, signal: AbortSignal): () => void {
  const root = document.querySelector<HTMLElement>('[data-page="work"]');
  if (!root || signal.aborted) return () => {};

  const grid = root.querySelector<HTMLElement>('[data-work-grid]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  if (!grid || !count || !empty) return () => {};

  const tiles = [...grid.querySelectorAll<HTMLElement>('.tile')];
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-filter-link]')];
  let current = readFilter();
  let gridApi: {
    aim: (id: string, u: number, v: number) => void;
    play: (id: string, to: number) => void;
    destroy: () => void;
  } | null = null;
  let activeId: string | null = null;
  let disposed = false;

  const paintChrome = (filter: string): void => {
    let visible = 0;
    tiles.forEach((tile) => {
      const show = filter === 'all' || tile.dataset.filter === filter;
      tile.classList.toggle('is-filtered', !show);
      if (show) visible += 1;
    });
    count.textContent = String(visible);
    empty.hidden = visible !== 0;
    tiles.forEach((tile) => {
      if (tile.classList.contains('is-filtered')) return;
      const img = tile.querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
    });
    links.forEach((link) => {
      if (link.dataset.filterLink === filter) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    document.documentElement.removeAttribute('data-work-filter');
  };

  const applyFilter = (filter: string, animate: boolean): void => {
    const state = animate ? Flip.getState(tiles) : null;
    paintChrome(filter);
    if (!state) return;
    Flip.from(state, {
      duration: 0.72,
      ease: 'power3.inOut',
      absolute: true,
      stagger: 0.012,
      prune: true,
      onEnter: (elements) => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }),
      onLeave: (elements) => gsap.to(elements, { opacity: 0, duration: 0.35, ease: 'power2.in' }),
    });
  };

  paintChrome(current);

  const onClick = (event: Event): void => {
    const link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement)) return;
    event.preventDefault();
    const filter = link.dataset.filterLink || 'all';
    if (filter === current) return;
    current = filter;
    const url = urlFor(filter);
    window.history.pushState({ filter }, '', url);
    applyFilter(filter, !reduced);
  };

  const onPop = (): void => {
    current = readFilter();
    applyFilter(current, !reduced);
  };

  links.forEach((link) => link.addEventListener('click', onClick));
  window.addEventListener('popstate', onPop);

  const intro = (): void => {
    const narrow = !window.matchMedia('(min-width: 801px)').matches;
    if (reduced || narrow || !fine) {
      document.documentElement.classList.remove('work-intro');
      gsap.set(tiles, { clearProps: 'opacity,visibility' });
      return;
    }
    const first = tiles.filter((tile) => !tile.classList.contains('is-filtered')).slice(0, 8);
    const rest = tiles.filter((tile) => !first.includes(tile));
    gsap.set(rest, { autoAlpha: 1 });
    if (first.length === 0) {
      document.documentElement.classList.remove('work-intro');
      return;
    }
    gsap.fromTo(
      first,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.75,
        stagger: 0.05,
        ease: 'power3.out',
        onComplete: () => {
          document.documentElement.classList.remove('work-intro');
          gsap.set(tiles, { clearProps: 'opacity,visibility' });
        },
      },
    );
  };
  intro();

  const desktopQuery = window.matchMedia('(min-width: 801px)');
  const useGl = fine && !reduced && desktopQuery.matches && canWebGL();

  const pointerUv = (tile: HTMLElement, event: PointerEvent): { u: number; v: number } => {
    const rect = tile.getBoundingClientRect();
    const u = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
    const v = rect.height > 0 ? 1 - (event.clientY - rect.top) / rect.height : 0.5;
    return { u: Math.min(1, Math.max(0, u)), v: Math.min(1, Math.max(0, v)) };
  };

  const onEnter = (event: PointerEvent): void => {
    const tile = event.currentTarget;
    if (!(tile instanceof HTMLElement) || !gridApi || tile.classList.contains('is-filtered')) return;
    const id = tile.dataset.id;
    if (!id) return;
    if (activeId && activeId !== id) {
      gridApi.play(activeId, 0);
      grid.querySelector(`[data-id="${activeId}"]`)?.classList.remove('is-hot');
    }
    activeId = id;
    tile.classList.add('is-hot');
    const uv = pointerUv(tile, event);
    gridApi.aim(id, uv.u, uv.v);
    gridApi.play(id, 1);
  };

  const onLeave = (event: PointerEvent): void => {
    const tile = event.currentTarget;
    if (!(tile instanceof HTMLElement) || !gridApi) return;
    const id = tile.dataset.id;
    if (!id) return;
    tile.classList.remove('is-hot');
    gridApi.play(id, 0);
    if (activeId === id) activeId = null;
  };

  let removeHover = (): void => {};

  const bindHover = (): void => {
    tiles.forEach((tile) => {
      tile.addEventListener('pointerenter', onEnter);
      tile.addEventListener('pointerleave', onLeave);
    });
    removeHover = () => {
      tiles.forEach((tile) => {
        tile.removeEventListener('pointerenter', onEnter);
        tile.removeEventListener('pointerleave', onLeave);
      });
    };
  };

  const readyTimer = window.setTimeout(() => {
    if (!document.documentElement.dataset.workReady) {
      document.documentElement.dataset.workReady = useGl ? 'gl' : 'color';
    }
  }, 4500);

  if (useGl) {
    void import('../webgl/noirGrid')
      .then((mod) => {
        if (disposed || signal.aborted) return;
        gridApi = mod.mountNoirGrid(grid, signal);
        bindHover();
        document.documentElement.dataset.workReady = 'gl';
      })
      .catch(() => {
        document.documentElement.dataset.workReady = 'color';
      });
  } else {
    document.documentElement.dataset.workReady = 'color';
  }

  const stopMedia = (): void => {
    if (!desktopQuery.matches && gridApi) {
      gridApi.destroy();
      gridApi = null;
      document.documentElement.dataset.workReady = 'color';
      removeHover();
    }
  };
  desktopQuery.addEventListener('change', stopMedia);

  return () => {
    disposed = true;
    links.forEach((link) => link.removeEventListener('click', onClick));
    window.removeEventListener('popstate', onPop);
    desktopQuery.removeEventListener('change', stopMedia);
    removeHover();
    window.clearTimeout(readyTimer);
    gridApi?.destroy();
    gsap.killTweensOf(tiles);
    document.documentElement.classList.remove('work-intro', 'work-gl');
    delete document.documentElement.dataset.workReady;
  };
}
