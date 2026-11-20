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
  // 05C owns the entrance on the opening prints. The old fade would fight it.
  const hasPrints = Boolean(root.querySelector('[data-light-print]'));
  const record = new URLSearchParams(window.location.search).has('record');
  if (!hasPrints) intro();
  else if (reduced || record || !window.matchMedia('(min-width: 801px)').matches) {
    document.documentElement.classList.remove('work-intro');
  }

  const desktopQuery = window.matchMedia('(min-width: 801px)');
  // Same noir grade at 390 and on a coarse pointer. Ripple stays fine and wide.
  const useGl = !reduced && canWebGL();
  const allowRipple = (): boolean => fine && desktopQuery.matches;

  const frameOf = (tile: HTMLElement): HTMLElement => tile.querySelector<HTMLElement>('.tile__link') ?? tile;

  const pointerPx = (tile: HTMLElement, event: PointerEvent): { x: number; y: number } => {
    const rect = frameOf(tile).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
      x: Math.min(Math.max(0, x), Math.max(0, rect.width)),
      y: Math.min(Math.max(0, y), Math.max(0, rect.height)),
    };
  };

  const aimTile = (tile: HTMLElement, event: PointerEvent): void => {
    const id = tile.dataset.id;
    if (!id || !gridApi) return;
    const point = pointerPx(tile, event);
    gridApi.aim(id, point.x, point.y);
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
    aimTile(tile, event);
    gridApi.play(id, 1);
  };

  const onMove = (event: PointerEvent): void => {
    const tile = event.currentTarget;
    if (!(tile instanceof HTMLElement) || !gridApi) return;
    if (tile.dataset.id !== activeId) return;
    aimTile(tile, event);
  };

  const onWindowMove = (event: PointerEvent): void => {
    if (!activeId || !gridApi) return;
    const tile = grid.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    if (!tile || tile.classList.contains('is-filtered')) return;
    const rect = frameOf(tile).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    gridApi.aim(activeId, x, y);
  };

  const onLeave = (event: PointerEvent): void => {
    const tile = event.currentTarget;
    if (!(tile instanceof HTMLElement) || !gridApi) return;
    const id = tile.dataset.id;
    if (!id) return;
    const next = event.relatedTarget;
    if (next instanceof Node && tile.contains(next)) return;
    tile.classList.remove('is-hot');
    gridApi.play(id, 0);
    if (activeId === id) activeId = null;
  };

  let removeHover = (): void => {};
  let hoverBound = false;

  const bindHover = (): void => {
    if (hoverBound) return;
    tiles.forEach((tile) => {
      tile.addEventListener('pointerenter', onEnter);
      tile.addEventListener('pointermove', onMove);
      tile.addEventListener('pointerleave', onLeave);
    });
    window.addEventListener('pointermove', onWindowMove);
    hoverBound = true;
    removeHover = () => {
      if (!hoverBound) return;
      tiles.forEach((tile) => {
        tile.removeEventListener('pointerenter', onEnter);
        tile.removeEventListener('pointermove', onMove);
        tile.removeEventListener('pointerleave', onLeave);
      });
      window.removeEventListener('pointermove', onWindowMove);
      hoverBound = false;
    };
  };

  const syncRipple = (): void => {
    if (allowRipple() && gridApi) {
      bindHover();
      return;
    }
    if (activeId && gridApi) gridApi.play(activeId, 0);
    tiles.forEach((tile) => tile.classList.remove('is-hot'));
    activeId = null;
    removeHover();
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
        syncRipple();
        document.documentElement.dataset.workReady = 'gl';
      })
      .catch(() => {
        document.documentElement.dataset.workReady = 'color';
      });
  } else {
    document.documentElement.dataset.workReady = 'color';
  }

  const onLayout = (): void => {
    syncRipple();
  };
  desktopQuery.addEventListener('change', onLayout);

  return () => {
    disposed = true;
    links.forEach((link) => link.removeEventListener('click', onClick));
    window.removeEventListener('popstate', onPop);
    desktopQuery.removeEventListener('change', onLayout);
    removeHover();
    window.clearTimeout(readyTimer);
    gridApi?.destroy();
    gsap.killTweensOf(tiles);
    document.documentElement.classList.remove('work-intro', 'work-gl');
    delete document.documentElement.dataset.workReady;
  };
}
