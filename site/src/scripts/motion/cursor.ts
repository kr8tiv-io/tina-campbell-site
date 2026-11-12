import gsap from 'gsap';

export function initCursor(signal: AbortSignal, fine: boolean): void {
  const cursor = document.querySelector<HTMLElement>('[data-cursor-root]');
  if (!cursor || !fine) return;

  const fill = cursor.querySelector<HTMLElement>('.cursor__fill');
  const label = cursor.querySelector<HTMLElement>('.cursor__label');
  if (!fill || !label) return;

  document.documentElement.classList.add('has-cursor');
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
  const scaleTo = gsap.quickTo(fill, 'scale', { duration: 0.35, ease: 'power3.out' });
  scaleTo(0.14);

  const onMove = (event: PointerEvent): void => {
    xTo(event.clientX);
    yTo(event.clientY);
    cursor.classList.add('is-on');
    const target = event.target instanceof Element ? event.target : null;
    const hot = target?.closest('[data-cursor]');
    const text = hot?.getAttribute('data-cursor') ?? '';
    if (text) {
      cursor.classList.add('is-hot');
      label.textContent = text;
      scaleTo(1);
    } else {
      cursor.classList.remove('is-hot');
      label.textContent = '';
      scaleTo(0.14);
    }
  };

  window.addEventListener('pointermove', onMove, { signal });
  document.documentElement.addEventListener(
    'pointerleave',
    () => cursor.classList.remove('is-on'),
    { signal },
  );
  signal.addEventListener('abort', () => {
    document.documentElement.classList.remove('has-cursor');
  });
}
