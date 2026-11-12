import gsap from 'gsap';
import {
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderer,
} from 'three';

/**
 * Shared noir canvas for the work grid.
 * Progress 0→1 is linear over 5s after contact (clip 03: cursor arrives at 1s,
 * the bubble fills the frame by the end of the 6s take). The radius eases out.
 * The clip's bubble spills onto the film strip; this one is clamped to the tile.
 */

const TRAVEL = 5;

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uPointer;
uniform vec2 uImage;
uniform vec2 uTile;
uniform float uTime;
uniform float uProgress;
uniform float uFade;
uniform float uBias;
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  float tileAspect = uTile.x / max(uTile.y, 1.0);
  vec2 scale = vec2(1.0);
  vec2 offset = vec2(0.0);
  if (imageAspect > tileAspect) {
    scale.x = tileAspect / imageAspect;
    offset.x = (1.0 - scale.x) * 0.5;
  } else {
    scale.y = imageAspect / tileAspect;
    offset.y = (1.0 - scale.y) * clamp(uBias, 0.0, 1.0);
  }
  return offset + uv * scale;
}

float redMask(vec3 rgb) {
  float maxC = max(rgb.r, max(rgb.g, rgb.b));
  float minC = min(rgb.r, min(rgb.g, rgb.b));
  float delta = maxC - minC;
  float hue = 0.0;
  if (delta > 0.0001) {
    if (maxC == rgb.r) hue = mod((rgb.g - rgb.b) / delta, 6.0);
    else if (maxC == rgb.g) hue = ((rgb.b - rgb.r) / delta) + 2.0;
    else hue = ((rgb.r - rgb.g) / delta) + 4.0;
    hue /= 6.0;
  }
  float sat = maxC <= 0.0001 ? 0.0 : delta / maxC;
  float hueDist = min(hue, 1.0 - hue);
  float redHue = smoothstep(0.075, 0.018, hueDist);
  float satGate = smoothstep(0.28, 0.5, sat);
  float redDom = smoothstep(0.1, 0.26, rgb.r - max(rgb.g, rgb.b));
  return clamp(redHue * max(satGate, redDom), 0.0, 1.0);
}

vec3 gradeNoir(vec3 rgb) {
  float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
  luma = smoothstep(0.05, 0.96, luma);
  return mix(vec3(luma), rgb, redMask(rgb));
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float grow = 1.0 - pow(1.0 - p, 1.65);

  vec2 aspect = vec2(uTile.x / max(uTile.y, 1.0), 1.0);
  vec2 pointer = clamp(uPointer, 0.0, 1.0);
  vec2 d = (vUv - pointer) * aspect;
  float dist = length(d);
  vec2 dir = dist > 0.0008 ? d / dist : vec2(1.0, 0.0);

  vec2 c0 = (vec2(0.0) - pointer) * aspect;
  vec2 c1 = (vec2(1.0, 0.0) - pointer) * aspect;
  vec2 c2 = (vec2(0.0, 1.0) - pointer) * aspect;
  vec2 c3 = (vec2(1.0) - pointer) * aspect;
  float maxR = max(max(length(c0), length(c1)), max(length(c2), length(c3)));
  float radius = max(0.001, maxR * grow);
  float nd = dist / radius;
  float inside = 1.0 - smoothstep(0.96, 1.04, nd);
  float rim = smoothstep(0.58, 0.98, nd) * inside;

  float ndc = clamp(nd, 0.0, 1.0);
  float spin = pow(ndc, 1.85) * 1.25 * inside;
  float s = sin(spin);
  float c = cos(spin);
  vec2 spun = vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  float squeeze = 1.0 - inside * 0.16 * (1.0 - ndc);
  vec2 bent = spun * squeeze;
  float wave = sin(ndc * 11.0 - uTime * 2.0) * 0.02 * pow(ndc, 1.6) * inside;
  bent += dir * wave;

  vec2 tileUv = clamp(pointer + bent / aspect, 0.0, 1.0);

  float shift = 0.012 * smoothstep(0.78, 1.0, ndc) * inside * smoothstep(0.08, 0.4, grow);
  vec2 axis = dir / aspect;
  vec3 raw = texture2D(uMap, coverUv(tileUv)).rgb;
  vec3 split = vec3(
    texture2D(uMap, coverUv(clamp(tileUv + axis * shift, 0.0, 1.0))).r,
    raw.g,
    texture2D(uMap, coverUv(clamp(tileUv - axis * shift, 0.0, 1.0))).b
  );

  vec3 graded = gradeNoir(raw);
  vec3 fringe = mix(graded, split, clamp(rim * 1.25, 0.0, 1.0));
  float colourMix = inside * smoothstep(0.3, 0.88, grow);
  vec3 tinted = mix(fringe, mix(raw, split, clamp(0.35 + rim, 0.0, 1.0)), colourMix);

  vec3 base = gradeNoir(texture2D(uMap, coverUv(vUv)).rgb);
  vec3 colour = mix(base, tinted, inside);
  gl_FragColor = vec4(colour * uFade, uFade);
}
`;

interface TileRecord {
  id: string;
  el: HTMLElement;
  mesh: Mesh;
  uniforms: {
    uMap: { value: Texture | null };
    uPointer: { value: Vector2 };
    uImage: { value: Vector2 };
    uTile: { value: Vector2 };
    uTime: { value: number };
    uProgress: { value: number };
    uFade: { value: number };
    uBias: { value: number };
  };
  texture: Texture | null;
  img: HTMLImageElement | null;
  loading: boolean;
}

export interface NoirGrid {
  aim: (id: string, u: number, v: number) => void;
  play: (id: string, to: number) => void;
  destroy: () => void;
}

function canDraw(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

function makeTexture(img: HTMLImageElement, maxEdge: number): Texture {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const scale = Math.min(1, maxEdge / Math.max(nw, nh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(nw * scale));
  canvas.height = Math.max(1, Math.round(nh * scale));
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
  const source: CanvasImageSource = canvas;
  const texture = new Texture(source);
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function mountNoirGrid(grid: HTMLElement, signal: AbortSignal): NoirGrid {
  const canvas = document.createElement('canvas');
  canvas.className = 'work-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
  });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;
  canvas.style.background = 'transparent';

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
  camera.position.z = 5;
  const geometry = new PlaneGeometry(1, 1);
  const clock = { value: 0 };
  const records = new Map<string, TileRecord>();

  const nodes = [...grid.querySelectorAll<HTMLElement>('.tile')];
  nodes.forEach((el) => {
    const id = el.dataset.id;
    if (!id) return;
    const uniforms = {
      uMap: { value: null as Texture | null },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uImage: { value: new Vector2(1, 1) },
      uTile: { value: new Vector2(1, 1) },
      uTime: clock,
      uProgress: { value: 0 },
      uFade: { value: 0 },
      uBias: { value: el.dataset.orient === 'landscape' ? 0.5 : 0.32 },
    };
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    mesh.frustumCulled = false;
    scene.add(mesh);
    records.set(id, {
      id,
      el,
      mesh,
      uniforms,
      texture: null,
      img: el.querySelector('img'),
      loading: false,
    });
  });

  let running = true;
  let last = 0;
  let revealed = false;

  const resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  };

  const ensureTexture = (record: TileRecord, displayWidth: number): void => {
    if (record.texture || record.loading || !record.img) return;
    const img = record.img;
    const upload = (): void => {
      if (signal.aborted || record.texture) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const maxEdge = Math.min(1024, Math.max(480, Math.ceil(displayWidth * dpr)));
      const texture = makeTexture(img, maxEdge);
      record.texture = texture;
      record.uniforms.uMap.value = texture;
      record.uniforms.uImage.value.set(img.naturalWidth, img.naturalHeight);
      record.loading = false;
      record.uniforms.uFade.value = 1;
      record.el.classList.add('is-gl');
      if (!revealed) {
        revealed = true;
        document.documentElement.classList.add('work-gl');
      }
    };
    const whenReady = (): void => {
      if (signal.aborted || record.texture) return;
      const draw = (): void => upload();
      if (typeof img.decode === 'function') img.decode().then(draw).catch(draw);
      else draw();
    };
    if (canDraw(img)) {
      record.loading = true;
      whenReady();
      return;
    }
    record.loading = true;
    img.addEventListener('load', () => whenReady(), { once: true });
    img.addEventListener(
      'error',
      () => {
        record.loading = false;
      },
      { once: true },
    );
  };

  const sync = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = height * 0.45;
    records.forEach((record) => {
      const filtered = record.el.classList.contains('is-filtered');
      const rect = record.el.getBoundingClientRect();
      const onScreen = rect.bottom > -margin && rect.top < height + margin && rect.width > 2 && rect.height > 2;
      if (filtered || !onScreen) {
        record.mesh.visible = false;
        if (filtered) record.el.classList.remove('is-gl');
        return;
      }
      const img = record.img;
      if (img && img.loading === 'lazy') img.loading = 'eager';
      ensureTexture(record, rect.width);
      if (!record.texture) {
        record.mesh.visible = false;
        record.el.classList.remove('is-gl');
        return;
      }
      record.mesh.visible = true;
      record.el.classList.add('is-gl');
      record.mesh.position.set(rect.left + rect.width / 2 - width / 2, height / 2 - (rect.top + rect.height / 2), 0);
      record.mesh.scale.set(rect.width, rect.height, 1);
      record.uniforms.uTile.value.set(rect.width, rect.height);
      record.el.dataset.ripple = record.uniforms.uProgress.value.toFixed(3);
    });
  };

  const tick = (time: number): void => {
    if (!running || signal.aborted) return;
    const seconds = time;
    const delta = last === 0 ? 0.016 : Math.min(0.05, seconds - last);
    last = seconds;
    clock.value += delta;
    sync();
    const drawing = [...records.values()].some((record) => record.mesh.visible);
    if (drawing) renderer.render(scene, camera);
    else renderer.clear();
  };

  resize();
  const onResize = (): void => resize();
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  });
  gsap.ticker.add(tick);

  const api: NoirGrid = {
    aim(id, u, v) {
      const record = records.get(id);
      if (!record) return;
      record.uniforms.uPointer.value.set(u, v);
    },
    play(id, to) {
      const record = records.get(id);
      if (!record) return;
      const uniform = record.uniforms.uProgress;
      const distance = Math.abs(to - uniform.value);
      gsap.to(uniform, {
        value: to,
        duration: Math.max(0.12, TRAVEL * distance),
        ease: 'none',
        overwrite: true,
        onUpdate: () => {
          const value = uniform.value;
          record.el.dataset.ripple = value.toFixed(3);
          record.el.classList.toggle('is-rippling', value > 0.02 && value < 0.985);
          record.el.classList.toggle('is-colour', value >= 0.985);
        },
      });
    },
    destroy() {
      running = false;
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      records.forEach((record) => {
        gsap.killTweensOf(record.uniforms.uProgress);
        gsap.killTweensOf(record.uniforms.uFade);
        record.texture?.dispose();
        (record.mesh.material as ShaderMaterial).dispose();
        record.el.classList.remove('is-gl', 'is-rippling', 'is-colour');
      });
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      document.documentElement.classList.remove('work-gl');
    },
  };

  signal.addEventListener('abort', () => api.destroy(), { once: true });
  return api;
}
