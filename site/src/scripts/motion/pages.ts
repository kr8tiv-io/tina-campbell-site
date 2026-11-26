import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function finePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** About, services, book, and journal. Each init no-ops when its root is absent. */
export function initPages(reduced: boolean, signal: AbortSignal): () => void {
  const stops = [
    initAbout(reduced),
    initServices(reduced),
    initBook(signal),
    initJournal(reduced),
  ];
  return () => {
    stops.forEach((stop) => stop());
  };
}

function initAbout(reduced: boolean): () => void {
  const root = document.querySelector<HTMLElement>('[data-about-split]');
  if (!root || reduced) return () => {};
  const far = root.querySelector('[data-layer="far"]');
  const mid = root.querySelector('[data-layer="mid"]');
  const near = root.querySelector('[data-layer="near"]');
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
    },
  });
  if (far) timeline.to(far, { yPercent: -8, ease: 'none' }, 0);
  if (mid) timeline.to(mid, { yPercent: -24, ease: 'none' }, 0);
  if (near) timeline.to(near, { yPercent: -52, ease: 'none' }, 0);

  const fine = finePointer();
  const onMove = (event: PointerEvent): void => {
    if (!fine) return;
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (far) gsap.to(far, { x: x * -12, y: y * -8, duration: 0.6, ease: 'power3.out' });
    if (mid) gsap.to(mid, { x: x * -22, y: y * -14, duration: 0.6, ease: 'power3.out' });
  };
  root.addEventListener('pointermove', onMove);
  return () => {
    timeline.kill();
    root.removeEventListener('pointermove', onMove);
  };
}

function initServices(reduced: boolean): () => void {
  const line = document.querySelector<HTMLElement>('[data-steps-line]');
  if (line && !reduced) {
    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: line.parentElement,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true,
        },
      },
    );
  }

  const fine = finePointer();
  const cleanups: Array<() => void> = [];
  if (fine && !reduced) {
    document.querySelectorAll<HTMLElement>('[data-svc-row]').forEach((row) => {
      const thumb = row.querySelector<HTMLElement>('[data-svc-thumb]');
      if (!thumb) return;
      const xTo = gsap.quickTo(thumb, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(thumb, 'y', { duration: 0.45, ease: 'power3.out' });
      const rot = gsap.quickTo(thumb, 'rotation', { duration: 0.5, ease: 'power3.out' });
      let lastX = 0;
      const move = (event: PointerEvent): void => {
        const rect = row.getBoundingClientRect();
        const dx = event.clientX - lastX;
        lastX = event.clientX;
        xTo(gsap.utils.clamp(-18, 18, event.clientX - (rect.left + rect.width * 0.72)));
        yTo(gsap.utils.clamp(-14, 14, event.clientY - (rect.top + rect.height / 2)));
        rot(gsap.utils.clamp(-6, 6, dx * 0.35));
      };
      const leave = (): void => {
        xTo(0);
        yTo(0);
        rot(0);
      };
      row.addEventListener('pointermove', move);
      row.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        row.removeEventListener('pointermove', move);
        row.removeEventListener('pointerleave', leave);
      });
    });
  }

  document.querySelectorAll<HTMLButtonElement>('[data-faq]').forEach((button) => {
    const panel = button.nextElementSibling as HTMLElement | null;
    if (!panel) return;
    const toggle = (): void => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      const mark = button.querySelector('span');
      if (mark) mark.textContent = open ? '+' : '-';
      if (reduced) {
        panel.style.height = open ? '0px' : 'auto';
        return;
      }
      gsap.to(panel, { height: open ? 0 : 'auto', duration: 0.45, ease: 'power3.out' });
    };
    button.addEventListener('click', toggle);
    cleanups.push(() => button.removeEventListener('click', toggle));
  });

  return () => cleanups.forEach((fn) => fn());
}

function initBook(signal: AbortSignal): () => void {
  const form = document.querySelector<HTMLFormElement>('[data-book-form]');
  const status = document.querySelector<HTMLElement>('[data-book-status]');
  const bg = document.querySelector<HTMLElement>('[data-book-bg]');
  if (bg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to(bg, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: bg.parentElement,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
  if (!form || !status) return () => {};

  const params = new URLSearchParams(window.location.search);
  const prefill = params.get('type');
  if (prefill) {
    const box = form.querySelector<HTMLInputElement>(`input[name="type"][value="${CSS.escape(prefill)}"]`);
    if (box) box.checked = true;
  }

  const onSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const types = data.getAll('type');
    const trap = String(data.get('company') || '');
    if (trap) return;
    if (!name || !email.includes('@') || !message || types.length === 0) {
      status.textContent = 'Add your name, a real email, what we are shooting, and a short note.';
      return;
    }
    status.textContent = 'One moment.';
    let ok = false;
    try {
      const response = await fetch('/api/book.php', { method: 'POST', body: data });
      if (response.ok) {
        const payload = (await response.json()) as { ok?: boolean };
        ok = payload.ok === true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      status.innerHTML =
        'Bookings by form open soon. For now, message me on Instagram <a href="https://www.instagram.com/_tcphoto/">@_tcphoto</a>.';
      return;
    }
    status.textContent = "Thanks! I'll get back to you within two business days.";
    form.reset();
  };
  form.addEventListener('submit', onSubmit);
  signal.addEventListener('abort', () => form.removeEventListener('submit', onSubmit));
  return () => form.removeEventListener('submit', onSubmit);
}

function initJournal(reduced: boolean): () => void {
  if (reduced) return () => {};
  const bars = document.querySelectorAll<HTMLElement>('[data-letterbox-bar]');
  if (bars.length) {
    gsap.fromTo(
      bars,
      { height: '14%' },
      {
        height: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: bars[0].parentElement, start: 'top 80%' },
      },
    );
  }
  document.querySelectorAll<HTMLElement>('[data-journal-row]').forEach((row, index) => {
    gsap.fromTo(
      row,
      { autoAlpha: 0, x: 28 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.7,
        delay: index * 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 90%' },
      },
    );
  });
  return () => {};
}
