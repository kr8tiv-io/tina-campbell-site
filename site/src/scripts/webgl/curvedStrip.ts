import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  LinearFilter,
  MathUtils,
  Mesh,
  NoToneMapping,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

/**
 * Runway film strip.
 *
 * The barrel is a function of view-space x only: the centre is tallest, the
 * top edge is highest at the centre, the bottom edge is lowest at the centre,
 * and the left side mirrors the right at every scroll position. An earlier
 * arch lifted the whole ribbon, so the visible end rose toward the right.
 * Home can reuse frameLook() for a CSS stand-in.
 */
export const STRIP = {
  /** Photo window width / height. Tuned so one frame is ~265 px wide at 1280x720. */
  photoAspect: 0.73,
  /** Each sprocket band, as a fraction of the full frame height. */
  band: 0.09,
  /** Dark gutter between frames, as a fraction of the full frame height. */
  gutter: 0.016,
  /** Centre frame height / viewport height. Clip 02 centre is ~0.60 vh. */
  centerVH: 0.6,
  /** Frame index sitting on the viewport centre at progress 0. */
  focusIndex: 3,
  /** Looped frames drawn past each end so the viewport never shows empty ink. */
  pad: 6,
  /** First frames are the dark-stage run. Negative indices loop inside it. */
  darkRun: 14,
};

export interface FrameLook {
  scale: number;
  scaleX: number;
  dim: number;
  blur: number;
  z: number;
  rotateY: number;
  rotateZ: number;
  y: number;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Height scale of the barrel. 1 at the centre, 0.60 at the screen edge. */
export function barrelScale(nx: number): number {
  const x = Math.min(Math.abs(nx), 1.25);
  const x2 = x * x;
  // Matches clip 02: ~0.89 at half-width, ~0.76 at 0.75, 0.60 at the edge.
  return MathUtils.clamp(1 - 0.48 * x2 + 0.08 * x2 * x, 0.48, 1);
}

/** nx is view x / half the visible width. 0 is the centre of the screen. */
export function frameLook(nx: number, velocity = 0): FrameLook {
  const ad = Math.min(Math.abs(nx), 1.25);
  const t = smoothstep(0.02, 1, ad);
  const speed = Math.min(Math.abs(velocity), 1);
  return {
    scale: barrelScale(nx),
    scaleX: 1,
    dim: MathUtils.lerp(1, 0.57, t),
    blur: t * (0.42 + speed * 0.5),
    z: 0,
    rotateY: 0,
    rotateZ: 0,
    y: 0,
  };
}

export interface CurvedFrame {
  url: string;
  aspect: number;
}

export interface CurvedStrip {
  setProgress: (progress: number) => void;
  setVelocity: (velocity: number) => void;
  resize: () => void;
  destroy: () => void;
}

export interface MountOptions {
  signal: AbortSignal;
  onReady?: () => void;
}

export interface StripMetrics {
  frameH: number;
  pitchPx: number;
  focus: number;
  span: number;
  travelPx: number;
}

/** Pixel size of the strip for this viewport. Travel is 1 vertical px per horizontal px. */
export function stripMetrics(
  viewWidth: number,
  viewHeight: number,
  canvasHeight: number,
  count: number,
): StripMetrics {
  const width = Math.max(viewWidth, 1);
  const height = Math.max(viewHeight, 1);
  const stageH = Math.max(canvasHeight, 1);
  const frameH = Math.min(STRIP.centerVH * height, stageH - 4);
  const photoH = frameH * (1 - STRIP.band * 2);
  const pitchPx = photoH * STRIP.photoAspect + frameH * STRIP.gutter;
  const focus = Math.min(STRIP.focusIndex, Math.max(0, count - 1));
  const span = Math.max(1, count - 1 - focus);
  const travelPx = Math.max(1, Math.round(span * pitchPx));
  void width;
  return { frameH, pitchPx, focus, span, travelPx };
}

export function horizontalTravelPx(
  viewWidth: number,
  viewHeight: number,
  canvasHeight: number,
  count: number,
): number {
  return stripMetrics(viewWidth, viewHeight, canvasHeight, count).travelPx;
}

const vert = /* glsl */ `
uniform float uPitch;
uniform float uHalfW;
uniform float uHalfH;
uniform float uMidY;
varying vec2 vUv;
varying float vLocalX;
varying float vNx;

void main() {
  vec4 world = modelMatrix * vec4(position.x, 0.0, 0.0, 1.0);
  float xPx = world.x * uPitch;
  float nx = xPx / max(uHalfW, 0.001);
  float x = min(abs(nx), 1.25);
  float x2 = x * x;
  // Symmetric barrel about the midline. Top rises at the centre, bottom drops.
  float scale = clamp(1.0 - 0.48 * x2 + 0.08 * x2 * x, 0.48, 1.0);
  float y = uMidY + position.y * uHalfH * scale;
  gl_Position = projectionMatrix * viewMatrix * vec4(xPx, y, 0.0, 1.0);
  vUv = uv;
  vLocalX = position.x;
  vNx = nx;
}
`;

const frag = /* glsl */ `
uniform sampler2D uMap;
uniform float uPitch;
uniform float uGutter;
uniform float uBand;
uniform float uHole;
uniform float uCols;
uniform float uRows;
uniform float uCount;
uniform float uDark;
uniform float uSpeed;
varying vec2 vUv;
varying float vLocalX;
varying float vNx;

vec4 soft(vec2 uv, vec2 cmin, vec2 cmax, float amount) {
  vec2 uv0 = clamp(uv, cmin, cmax);
  vec4 c = texture2D(uMap, uv0);
  if (amount < 0.03) return c;
  // Stay inside this atlas cell. A wide kernel was pulling the next photo in.
  float dx = amount * 0.005;
  float dy = amount * 0.006;
  vec4 s = c * 0.40;
  s += texture2D(uMap, clamp(uv0 + vec2(dx, 0.0), cmin, cmax)) * 0.15;
  s += texture2D(uMap, clamp(uv0 - vec2(dx, 0.0), cmin, cmax)) * 0.15;
  s += texture2D(uMap, clamp(uv0 + vec2(0.0, dy), cmin, cmax)) * 0.10;
  s += texture2D(uMap, clamp(uv0 - vec2(0.0, dy), cmin, cmax)) * 0.10;
  s += texture2D(uMap, clamp(uv0 + vec2(dx, dy), cmin, cmax)) * 0.05;
  s += texture2D(uMap, clamp(uv0 + vec2(-dx, dy), cmin, cmax)) * 0.05;
  s += texture2D(uMap, clamp(uv0 + vec2(dx, -dy), cmin, cmax)) * 0.05;
  s += texture2D(uMap, clamp(uv0 + vec2(-dx, -dy), cmin, cmax)) * 0.05;
  return s;
}

float wrapIndex(float idx) {
  if (idx < 0.0) {
    float w = mod(idx, uDark);
    return w < 0.0 ? w + uDark : w;
  }
  float w = mod(idx, uCount);
  return w < 0.0 ? w + uCount : w;
}

void main() {
  // #151517 and a darker hole, in linear, so the sRGB target survives colorspace_fragment.
  vec3 band = vec3(0.00755, 0.00755, 0.00855);
  vec3 hole = vec3(0.00155, 0.00155, 0.00170);
  vec3 gutter = vec3(0.00135, 0.00135, 0.00145);
  float edge = vUv.y < 0.5 ? vUv.y : 1.0 - vUv.y;
  float frame = vLocalX + 0.5;
  float idx = floor(frame);
  float within = frame - idx;
  if (edge < uBand) {
    float v = edge / max(uBand, 0.001);
    float u = fract(vLocalX / uHole);
    float inU = smoothstep(0.38, 0.44, u) * smoothstep(0.62, 0.56, u);
    float inV = smoothstep(0.34, 0.42, v) * smoothstep(0.66, 0.58, v);
    gl_FragColor = vec4(mix(band, hole, inU * inV), 1.0);
    #include <colorspace_fragment>
    return;
  }
  float halfG = uGutter * 0.5;
  if (within < halfG || within > 1.0 - halfG) {
    gl_FragColor = vec4(gutter, 1.0);
    #include <colorspace_fragment>
    return;
  }
  float wrapped = wrapIndex(idx);
  float photoU = (within - halfG) / max(1.0 - uGutter, 0.001);
  float photoV = (vUv.y - uBand) / max(1.0 - 2.0 * uBand, 0.001);
  int colCount = int(uCols);
  int index = int(wrapped + 0.5);
  int col = index - (index / colCount) * colCount;
  int row = index / colCount;
  vec2 atlas = vec2(
    (float(col) + photoU) / uCols,
    (float(row) + (1.0 - photoV)) / uRows
  );
  float ad = min(abs(vNx), 1.25);
  float t = smoothstep(0.02, 1.0, ad);
  // Linear multiplier. 0.30 encodes to about 0.58 displayed brightness.
  float dim = mix(1.0, 0.30, t);
  // Centre (t = 0) stays sharp. Edges soften, a little more while moving.
  float amount = t * (0.42 + uSpeed * 0.5);
  vec2 cell = vec2(1.0 / uCols, 1.0 / uRows);
  vec2 cmin = vec2(float(col), float(row)) * cell + vec2(0.0008);
  vec2 cmax = cmin + cell - vec2(0.0016);
  vec3 color = soft(atlas, cmin, cmax, amount).rgb * dim;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const ir = img.width / img.height;
  const box = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > box) {
    sw = img.height * box;
    sx = (img.width - sw) * 0.5;
  } else {
    sh = img.width / box;
    sy = (img.height - sh) * 0.18;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function mountCurvedStrip(
  canvas: HTMLCanvasElement,
  frames: CurvedFrame[],
  options: MountOptions,
): CurvedStrip {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x0c0c0f, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const count = Math.max(frames.length, 1);
  const cols = Math.min(4, count);
  const rows = Math.ceil(count / cols);
  const cellW = 440;
  const cellH = Math.round(cellW / STRIP.photoAspect);
  const atlas = document.createElement('canvas');
  atlas.width = cellW * cols;
  atlas.height = cellH * rows;
  const ctx = atlas.getContext('2d');
  if (!ctx) throw new Error('Could not draw runway atlas');
  ctx.fillStyle = '#050506';
  ctx.fillRect(0, 0, atlas.width, atlas.height);

  const texture = new CanvasTexture(atlas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;

  const pad = STRIP.pad;
  const samples = Math.max(1, (count + pad * 2) * 16);
  const positions = new Float32Array((samples + 1) * 2 * 3);
  const uvs = new Float32Array((samples + 1) * 2 * 2);
  const indices: number[] = [];
  const x0 = -pad - 0.5;
  const x1 = count + pad - 0.5;
  for (let i = 0; i <= samples; i += 1) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const v = i * 2;
    positions[v * 3] = x;
    positions[v * 3 + 1] = -1;
    positions[(v + 1) * 3] = x;
    positions[(v + 1) * 3 + 1] = 1;
    uvs[v * 2 + 1] = 0;
    uvs[(v + 1) * 2 + 1] = 1;
    if (i < samples) {
      const a = v;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const gutterFrac = STRIP.gutter / (STRIP.photoAspect * (1 - STRIP.band * 2) + STRIP.gutter);
  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uPitch: { value: 260 },
      uHalfW: { value: 640 },
      uHalfH: { value: 200 },
      uMidY: { value: 0 },
      uGutter: { value: gutterFrac },
      uBand: { value: STRIP.band },
      uHole: { value: 0.22 },
      uCols: { value: cols },
      uRows: { value: rows },
      uCount: { value: count },
      uDark: { value: Math.min(STRIP.darkRun, count) },
      uSpeed: { value: 0 },
    },
    vertexShader: vert,
    fragmentShader: frag,
    toneMapped: false,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  let progress = 0;
  let velocity = 0;
  let focus = Math.min(STRIP.focusIndex, count - 1);
  let span = Math.max(1, count - 1 - focus);
  let dirty = true;
  let stopped = false;
  let onScreen = true;
  let raf = 0;

  function resize(): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;
    const metrics = stripMetrics(window.innerWidth, window.innerHeight, height, count);
    focus = metrics.focus;
    span = metrics.span;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    material.uniforms.uPitch.value = metrics.pitchPx;
    material.uniforms.uHalfW.value = width / 2;
    material.uniforms.uHalfH.value = metrics.frameH / 2;
    const padPx = Math.min(10, height * 0.02);
    material.uniforms.uMidY.value = height / 2 - padPx - metrics.frameH / 2;
    dirty = true;
  }

  function layout(): void {
    mesh.position.x = -focus - progress * span;
    material.uniforms.uSpeed.value = Math.min(Math.abs(velocity), 1);
  }

  function frame(): void {
    if (stopped) return;
    raf = window.requestAnimationFrame(frame);
    if (!onScreen || document.hidden) return;
    if (canvas.clientWidth < 2) resize();
    if (canvas.clientWidth < 2) return;
    velocity *= 0.86;
    if (!dirty && Math.abs(velocity) < 0.004) return;
    layout();
    renderer.render(scene, camera);
    dirty = Math.abs(velocity) >= 0.004;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (onScreen) dirty = true;
    },
    { threshold: 0.01 },
  );
  observer.observe(canvas);

  resize();
  layout();
  renderer.render(scene, camera);
  raf = window.requestAnimationFrame(frame);

  void Promise.all(frames.map((item) => loadImage(item.url))).then((images) => {
    if (stopped) return;
    images.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      if (!img) return;
      drawCover(ctx, img, col * cellW, row * cellH, cellW, cellH);
    });
    texture.needsUpdate = true;
    dirty = true;
    options.onReady?.();
  });

  const onAbort = (): void => api.destroy();
  options.signal.addEventListener('abort', onAbort);

  const api: CurvedStrip = {
    setProgress(next: number): void {
      progress = MathUtils.clamp(next, 0, 1);
      dirty = true;
    },
    setVelocity(next: number): void {
      velocity = next;
      dirty = true;
    },
    resize(): void {
      resize();
    },
    destroy(): void {
      if (stopped) return;
      stopped = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      options.signal.removeEventListener('abort', onAbort);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };

  return api;
}
