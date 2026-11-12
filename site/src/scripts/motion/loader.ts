import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const STORAGE_KEY = 'tc-loader';

let played = false;
let running: gsap.core.Timeline | null = null;
let finishNow: (() => void) | null = null;

export function endLoader(): void {
  finishNow?.();
}

function preparePaths(root: ParentNode): void {
  root.querySelectorAll('path').forEach((path) => {
    path.setAttribute('pathLength', '100');
    path.style.fill = '#ffffff';
    if (path.getAttribute('data-draw') === 'stroke') {
      path.style.fillOpacity = '0';
      path.style.stroke = '#ffffff';
      path.style.strokeWidth = '2.4';
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
      path.style.strokeDasharray = '100';
      path.style.strokeDashoffset = '100';
    } else {
      path.style.fillOpacity = '0';
    }
  });
}

function strokeGroup(timeline: gsap.core.Timeline, nodes: Element[], start: number, step: number): void {
  nodes.forEach((node, index) => {
    const at = start + index * step;
    timeline.to(node, { strokeDashoffset: 0, duration: 0.36, ease: 'power2.inOut' }, at);
    timeline.to(node, { fillOpacity: 1, duration: 0.18, ease: 'power1.out' }, at + 0.2);
  });
}

function park(mark: HTMLElement): void {
  const rect = mark.getBoundingClientRect();
  document.body.appendChild(mark);
  mark.style.position = 'fixed';
  mark.style.left = `${rect.left}px`;
  mark.style.top = `${rect.top}px`;
  mark.style.width = `${rect.width}px`;
  mark.style.height = `${rect.height}px`;
  mark.style.margin = '0';
  mark.style.translate = 'none';
  mark.style.zIndex = '45';
  mark.style.pointerEvents = 'none';
}

export function playLoader(reduced: boolean, onDone: () => void): void {
  const root = document.documentElement;
  let seen = false;
  try {
    seen = sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    seen = true;
  }

  const loader = document.getElementById('loader');
  const mark = document.getElementById('loader-mark');
  if (running) return;
  if (reduced || seen || played || !loader || !mark) {
    root.classList.remove('loader-play');
    root.classList.add('loader-skip');
    loader?.remove();
    onDone();
    return;
  }

  played = true;
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* private mode still plays once this load */
  }

  preparePaths(mark);
  const letters = [...mark.querySelectorAll('#letters [data-draw="stroke"]')];
  const letterFades = [...mark.querySelectorAll('#letters [data-draw="fade"]')];
  const slash = [...mark.querySelectorAll('#slash [data-draw="stroke"]')];
  const slashFades = [...mark.querySelectorAll('#slash [data-draw="fade"]')];
  const countEl = loader.querySelector<HTMLElement>('[data-loader-count]');
  const line = loader.querySelector<HTMLElement>('.loader__line span');

  const strokes = gsap.timeline();
  strokeGroup(strokes, letters, 0, 0.028);
  if (letterFades.length > 0) {
    strokes.to(letterFades, { fillOpacity: 1, duration: 0.18, stagger: 0.006 }, 0.16);
  }
  strokeGroup(strokes, slash, 0.26, 0.03);
  if (slashFades.length > 0) {
    strokes.to(slashFades, { fillOpacity: 1, duration: 0.16, stagger: 0.008 }, 0.4);
  }
  const strokeTarget = 0.72;
  if (strokes.duration() > strokeTarget) strokes.timeScale(strokes.duration() / strokeTarget);

  const draw = gsap.timeline();
  draw.add(strokes, 0);
  const counter = { n: 0 };
  // The mark and the crimson rule finish while the counter is still in the 40s,
  // matching the signature frame, then the count climbs to 100.
  draw.to(
    counter,
    {
      n: 100,
      duration: 1.45,
      ease: 'none',
      onUpdate: () => {
        if (countEl) countEl.textContent = String(Math.round(counter.n)).padStart(3, '0');
      },
    },
    0,
  );
  if (line) {
    draw.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.58, ease: 'power2.out' }, 0);
  }

  let finished = false;
  let safety = 0;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    window.clearTimeout(safety);
    finishNow = null;
    const timeline = running;
    running = null;
    timeline?.eventCallback('onComplete', null);
    timeline?.kill();
    root.classList.remove('loader-play');
    root.classList.add('loader-skip');
    gsap.set('.site-reveal', { clearProps: 'opacity,visibility' });
    document.getElementById('loader')?.remove();
    document.getElementById('loader-mark')?.remove();
    onDone();
  };
  finishNow = finish;

  const master = gsap.timeline({ onComplete: finish });
  running = master;
  master.add(draw);
  master.addLabel('land');
  master.to('.loader__rail', { opacity: 0, duration: 0.18 }, 'land');
  master.add(() => {
    const live = document.getElementById('loader-mark');
    const logo = document.getElementById('site-logo');
    if (!live || !logo) return;
    park(live);
    Flip.fit(live, logo, {
      duration: 0.62,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
    });
  }, 'land');
  master.to('#loader', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 'land+=0.18');
  master.add(() => {
    root.classList.remove('loader-play');
  }, 'land+=0.22');
  master.to('#loader-mark', { opacity: 0, duration: 0.16 }, 'land+=0.52');

  safety = window.setTimeout(finish, 2600);
}
