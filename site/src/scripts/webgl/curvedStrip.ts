import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

/**
 * Curved runway strip.
 * Home can reuse frameLook() for a lighter CSS version: pass a frame's
 * normalised distance from centre and map scale, dim and blur to CSS.
 */
export const STRIP = {
  photoW: 0.62,
  photoH: 1,
  gap: 0.055,
  viewFrames: 6.15,
  focusStart: 3.02,
  focusEnd: 6.55,
  fov: 22,
  /** Small rise. Measured against the layout: edge tops sit only slightly below the centre. */
  arch: 0.06,
};

export interface FrameLook {
  /** Height scale. Home can map this, plus dim and blur, onto CSS. */
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

/** nx is world-x divided by half the visible width. 0 is the centre. */
export function frameLook(nx: number, velocity = 0): FrameLook {
  const ad = Math.abs(nx);
  const t = smoothstep(0.08, 1.45, ad);
  const speed = Math.min(Math.abs(velocity), 1);
  return {
    scale: MathUtils.lerp(1.24, 0.9, t),
    scaleX: 1,
    dim: MathUtils.lerp(1, 0.66, t),
    blur: t * 0.4 + speed * 0.22,
    z: -(t * t) * 0.28,
    rotateY: 0,
    rotateZ: 0,
    y: STRIP.arch * (1 - Math.min(nx * nx, 1.15)),
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

const vert = /* glsl */ `
uniform float uHalf;
uniform float uArch;
uniform float uPhotoH;
varying vec2 vUv;
varying float vLocalX;
varying float vBlur;
varying float vDim;
varying float vNx;

void main() {
  vec4 world = modelMatrix * vec4(position.x, 0.0, 0.0, 1.0);
  float nx = world.x / max(uHalf, 0.001);
  float ad = abs(nx);
  // Wide falloff so a single frame barely keystones, while the centre stays taller.
  float t = smoothstep(0.08, 1.45, ad);
  float scale = mix(1.24, 0.90, t);
  float yArch = uArch * (1.0 - min(nx * nx, 1.15));
  float halfOuter = uPhotoH * scale * 0.72;
  float y = yArch + position.y * halfOuter + modelMatrix[3].y;
  float z = -(t * t) * 0.28;
  gl_Position = projectionMatrix * viewMatrix * vec4(world.x, y, z, 1.0);
  vUv = uv;
  vLocalX = position.x;
  vNx = nx;
  vBlur = t * 0.4;
  vDim = mix(1.0, 0.66, t);
}
`;

const frag = /* glsl */ `
uniform sampler2D uMap;
uniform float uPitch;
uniform float uMargin;
uniform float uBand;
uniform float uHole;
uniform float uCols;
uniform float uRows;
uniform float uCount;
uniform float uSpeed;
varying vec2 vUv;
varying float vLocalX;
varying float vBlur;
varying float vDim;
varying float vNx;

vec4 soft(vec2 uv, float amount) {
  vec4 c = texture2D(uMap, uv);
  if (amount < 0.04) return c;
  float dx = amount * 0.0032;
  float dy = amount * 0.0048;
  vec4 s = c * 0.36;
  s += texture2D(uMap, uv + vec2(dx, 0.0)) * 0.12;
  s += texture2D(uMap, uv - vec2(dx, 0.0)) * 0.12;
  s += texture2D(uMap, uv + vec2(0.0, dy)) * 0.12;
  s += texture2D(uMap, uv - vec2(0.0, dy)) * 0.12;
  s += texture2D(uMap, uv + vec2(dx, dy)) * 0.07;
  s += texture2D(uMap, uv + vec2(-dx, dy)) * 0.07;
  s += texture2D(uMap, uv + vec2(dx, -dy)) * 0.07;
  s += texture2D(uMap, uv + vec2(-dx, -dy)) * 0.07;
  return s;
}

void main() {
  vec3 film = vec3(0.0015, 0.0015, 0.0017);
  float edge = vUv.y < 0.5 ? vUv.y : 1.0 - vUv.y;
  float frame = (vLocalX + uPitch * 0.5) / uPitch;
  int index = int(floor(frame));
  if (edge < uBand) {
    float v = edge / max(uBand, 0.001);
    float u = fract(vLocalX / uHole);
    float inU = smoothstep(0.16, 0.22, u) * smoothstep(0.84, 0.78, u);
    float inV = smoothstep(0.16, 0.24, v) * smoothstep(0.84, 0.74, v);
    vec3 gray = vec3(0.055, 0.055, 0.06);
    gl_FragColor = vec4(mix(film, gray, inU * inV), 1.0);
    #include <colorspace_fragment>
    return;
  }
  float within = fract(frame);
  if (float(index) < 0.0 || float(index) >= uCount || within < uMargin || within > 1.0 - uMargin) {
    gl_FragColor = vec4(film, 1.0);
    #include <colorspace_fragment>
    return;
  }
  float photoU = (within - uMargin) / (1.0 - 2.0 * uMargin);
  float photoV = (vUv.y - uBand) / (1.0 - 2.0 * uBand);
  int colCount = int(uCols);
  int col = index - (index / colCount) * colCount;
  int row = index / colCount;
  vec2 atlas = vec2(
    (float(col) + photoU) / uCols,
    (float(row) + (1.0 - photoV)) / uRows
  );
  float amount = vBlur + uSpeed * 0.25;
  vec3 color = soft(clamp(atlas, vec2(0.001), vec2(0.999)), amount).rgb * vDim;
  float focus = 1.0 - smoothstep(0.05, 1.22, abs(vNx));
  color = mix(color, color * 1.07, focus);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

function pitchOf(): number {
  return STRIP.photoW + STRIP.gap;
}

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
    sy = (img.height - sh) * 0.22;
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
  const camera = new PerspectiveCamera(STRIP.fov, 1, 0.1, 80);
  const group = new Group();
  scene.add(group);

  const count = Math.max(frames.length, 1);
  const cols = Math.min(4, count);
  const rows = Math.ceil(count / cols);
  const cellW = 760;
  const cellH = Math.round(cellW / (STRIP.photoW / STRIP.photoH));
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

  const pitch = pitchOf();
  const margin = STRIP.gap / 2 / pitch;
  const samples = count * 18;
  const positions = new Float32Array((samples + 1) * 2 * 3);
  const uvs = new Float32Array((samples + 1) * 2 * 2);
  const indices: number[] = [];
  const x0 = -pitch * 0.5;
  const x1 = (count - 0.5) * pitch;
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

  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uHalf: { value: 1 },
      uArch: { value: STRIP.arch },
      uPhotoH: { value: STRIP.photoH },
      uPitch: { value: pitch },
      uMargin: { value: margin },
      uBand: { value: 0.102 },
      uHole: { value: pitch / 3.55 },
      uCols: { value: cols },
      uRows: { value: rows },
      uCount: { value: count },
      uSpeed: { value: 0 },
    },
    vertexShader: vert,
    fragmentShader: frag,
    side: DoubleSide,
    toneMapped: false,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  group.add(mesh);

  const travel = (STRIP.focusEnd - STRIP.focusStart) * pitch;
  let progress = 0;
  let velocity = 0;
  let dirty = true;
  let stopped = false;
  let onScreen = true;
  let raf = 0;

  function resize(): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = MathUtils.degToRad(STRIP.fov / 2);
    const target = pitch * STRIP.viewFrames;
    const distance = (target / (2 * Math.tan(halfFov) * camera.aspect)) * 1.04;
    camera.position.set(0, 0.22, distance);
    camera.lookAt(0, 0.22, 0);
    camera.updateProjectionMatrix();
    const visible = 2 * Math.tan(halfFov) * camera.position.z * camera.aspect;
    material.uniforms.uHalf.value = visible * 0.5;
    dirty = true;
  }

  function layout(): void {
    group.position.x = -STRIP.focusStart * pitch - progress * travel;
    // Sit the film just under the progress rail, with black left below the strip.
    group.position.y = 0.34;
    material.uniforms.uSpeed.value = Math.min(Math.abs(velocity), 1);
  }

  function frame(): void {
    if (stopped) return;
    raf = window.requestAnimationFrame(frame);
    if (!onScreen || document.hidden) return;
    if (camera.position.z < 0.05) resize();
    if (camera.position.z < 0.05) return;
    velocity *= 0.84;
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

  void Promise.all(frames.map((frame) => loadImage(frame.url))).then((images) => {
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
