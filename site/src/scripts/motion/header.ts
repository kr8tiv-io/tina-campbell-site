import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lockScroll: (locked: boolean) => void = () => {};

export function bindScrollLock(fn: (locked: boolean) => void): void {
  lockScroll = fn;
}

function trapFocus(event: KeyboardEvent, panel: HTMLElement): void {
  const items = [...panel.querySelectorAll<HTMLElement>('a, button')];
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initHeader(signal: AbortSignal): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const panel = document.querySelector<HTMLElement>('#mobile-menu');
  if (!header || !button || !panel) return;

  const main = document.getElementById('content');
  const footer = document.querySelector('footer');
  let open = false;

  const setOpen = (next: boolean): void => {
    open = next;
    button.setAttribute('aria-expanded', String(next));
    panel.hidden = !next;
    document.documentElement.classList.toggle('menu-open', next);
    main?.toggleAttribute('inert', next);
    footer?.toggleAttribute('inert', next);
    lockScroll(next);
    if (next) {
      header.classList.remove('is-hidden');
      const close = panel.querySelector<HTMLElement>('[data-menu-close]');
      close?.focus();
    } else if (panel.contains(document.activeElement)) {
      button.focus();
    }
  };

  button.addEventListener('click', () => setOpen(!open), { signal });
  panel.querySelector('[data-menu-close]')?.addEventListener('click', () => setOpen(false), { signal });
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false), { signal });
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (!open) return;
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') trapFocus(event, panel);
    },
    { signal },
  );

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (open) {
        header.classList.remove('is-hidden');
        return;
      }
      if (self.scroll() < 24) header.classList.remove('is-hidden');
      else if (self.direction === 1) header.classList.add('is-hidden');
      else if (self.direction === -1) header.classList.remove('is-hidden');
    },
  });

  signal.addEventListener('abort', () => {
    if (!open) return;
    open = false;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open', 'scroll-lock');
    main?.removeAttribute('inert');
    footer?.removeAttribute('inert');
    lockScroll(false);
  });
}
