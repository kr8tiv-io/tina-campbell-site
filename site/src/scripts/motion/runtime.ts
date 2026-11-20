import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

declare global {
  interface Window {
    ScrollTrigger: typeof ScrollTrigger;
  }
}

/** One GSAP/ScrollTrigger registration for the site. Lenis stays in core.ts. Three stays in the webgl modules. */
export function registerMotion(): void {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    SplitText,
    DrawSVGPlugin,
    CustomEase,
    Observer,
    Flip,
  );
  CustomEase.create('cine', '0.22,1,0.36,1');
  if (typeof window !== 'undefined') window.ScrollTrigger = ScrollTrigger;
}

registerMotion();

export function isRecordMode(): boolean {
  if (typeof location === 'undefined') return false;
  return new URLSearchParams(location.search).has('record');
}

export { CustomEase, DrawSVGPlugin, Flip, gsap, Observer, ScrollToPlugin, ScrollTrigger, SplitText };
