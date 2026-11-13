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
 * Shared noir canvas. The grade runs at every width. Ripple is concentric rings
 * in tile pixels, centred on the pointer, and is only driven for a fine pointer
 * on a wide layout. Site pace is ripple 0-1s then colour 1-1.6s. When the replay
 * slows GSAP, durations stretch by the same factor so clip time and the rings line up.
 */

const vert = /* glsl */ `
uniform vec2 uMesh;
varying vec2 vPx;
void main() {
  vPx = vec2(uv.x, 1.0 - uv.y) * uMesh;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;

uniform sampler2D uMap;
uniform vec2 uPointer;
uniform vec2 uImage;
uniform vec2 uTile;
uniform float uSpill;
uniform float uRipple;
uniform float uWave;
uniform float uColour;
uniform float uFade;
uniform float uBias;
uniform float uPxScale;
varying vec2 vPx;

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
  float redHue = smoothstep(0.08, 0.02, hueDist);
  float satGate = smoothstep(0.32, 0.55, sat);
  float redDom = smoothstep(0.12, 0.28, rgb.r - max(rgb.g, rgb.b));
  return clamp(redHue * max(satGate, redDom), 0.0, 1.0);
}

float gradeLuma(float luma) {
  float x = clamp((luma - 0.055) / 0.86, 0.0, 1.0);
  x = pow(x, 1.22);
  x = 1.0 - exp(-x * 1.85);
  return clamp(x * 0.78, 0.0, 0.78);
}

vec3 gradeNoir(vec3 rgb) {
  float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(gradeLuma(luma)), rgb, redMask(rgb));
}

bool insideTile(vec2 px) {
  return px.x >= -0.5 && px.y >= -0.5 && px.x <= uTile.x + 0.5 && px.y <= uTile.y + 0.5;
}

vec3 sampleAt(vec2 tilePx) {
  vec2 clamped = clamp(tilePx, vec2(0.0), uTile);
  vec2 uv = vec2(clamped.x / max(uTile.x, 1.0), 1.0 - clamped.y / max(uTile.y, 1.0));
  return texture2D(uMap, coverUv(uv)).rgb;
}

void main() {
  vec2 tilePx = vPx - vec2(uSpill);
  float ripple = clamp(uRipple, 0.0, 1.0);
  float wave = clamp(uWave, 0.0, 1.0);
  float colourMix = clamp(uColour, 0.0, 1.0);
  bool fragIn = insideTile(tilePx);

  vec2 delta = tilePx - uPointer;
  float dist = length(delta);
  vec2 dir = dist > 0.8 ? delta / dist : vec2(0.0);
  float scale = max(uPxScale, 0.5);
  // Radius curve and 18px spacing are measured. Do not grow them to fake strength.
  float radius = 210.0 * scale * pow(max(ripple, 0.0001), 0.72);
  float spacing = max(8.0, 18.0 * scale);
  float behind = max(radius - dist, 0.0);
  // Same falloff as the measured radius curve. Crest locked to the front so a
  // scrolling phase cannot hide the outer ring one spacing inside.
  float front = smoothstep(radius + 14.0 * scale, radius - 1.0 * scale, dist);
  float fill = 0.78 + 0.22 * exp(-behind / (260.0 * scale));
  float center = smoothstep(8.0 * scale, 36.0 * scale, dist);
  float live = smoothstep(0.0, 0.04, wave) * smoothstep(0.0, 0.015, ripple);
  float phase = (radius - dist) / spacing * 6.2831853 + 1.5707963;
  float bands = sin(phase);
  float edge = abs(cos(phase));
  // In-ring refraction. ~11px bows a straight slat. Not an outer-only lens bubble.
  float amp = 11.0 * scale * bands * front * fill * center * live;
  float lip = smoothstep(radius - 6.0 * scale, radius + 1.0 * scale, dist)
            * smoothstep(radius + 16.0 * scale, radius + 2.0 * scale, dist);
  amp += 8.0 * scale * lip * fill * center * live;
  if (wave < 0.001 || ripple < 0.001) amp = 0.0;

  vec2 src = tilePx - dir * amp;
  bool srcIn = insideTile(src);
  float shift = 4.6 * scale * edge * front * fill * center * live;
  float feather = 3.4 * scale * edge * front * fill * center * live;
  vec3 tap = sampleAt(src);
  vec3 sideA = sampleAt(src + dir * feather);
  vec3 sideB = sampleAt(src - dir * feather);
  tap = mix(tap, (tap + sideA + sideB) / 3.0, smoothstep(0.2, 1.2, feather));
  vec3 splitR = sampleAt(src + dir * shift);
  vec3 splitB = sampleAt(src - dir * shift);
  // Fringe after the grade, or the noir curve turns the red/cyan edge back to grey.
  float chroma = edge * front * fill * center * live * 0.5;
  vec3 graded = gradeNoir(tap);
  vec3 gradedR = gradeNoir(splitR);
  vec3 gradedB = gradeNoir(splitB);
  vec3 noir = mix(graded, vec3(gradedR.r, graded.g, gradedB.b), chroma);
  vec3 rawCol = mix(tap, vec3(splitR.r, tap.g, splitB.b), chroma);
  vec3 tone = mix(noir, rawCol, colourMix);
  tone *= 1.0 + 0.04 * bands * front * fill * center * live;

  float alpha = 0.0;
  if (fragIn) {
    alpha = 1.0;
  } else if (live > 0.05 && srcIn && dist < radius + 8.0 * scale) {
    alpha = front * 0.94;
  }

  alpha *= uFade;
  if (alpha < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }
  gl_FragColor = vec4(tone * alpha, alpha);
}
`;

interface TileUniforms {
  uMap: { value: Texture | null };
  uPointer: { value: Vector2 };
  uImage: { value: Vector2 };
  uTile: { value: Vector2 };
  uMesh: { value: Vector2 };
  uSpill: { value: number };
  uRipple: { value: number };
  uWave: { value: number };
  uColour: { value: number };
  uFade: { value: number };
  uBias: { value: number };
  uPxScale: { value: number };
}

interface TileRecord {
  id: string;
  el: HTMLElement;
  frame: HTMLElement;
  mesh: Mesh;
  uniforms: TileUniforms;
  texture: Texture | null;
  img: HTMLImageElement | null;
  loading: boolean;
}

export interface NoirGrid {
  aim: (id: string, x: number, y: number) => void;
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
  const texture = new Texture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function clipStretch(): number {
  const scale = gsap.globalTimeline.timeScale();
  if (!(scale > 0)) return 1;
  return 1 / scale;
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
  const records = new Map<string, TileRecord>();
  const pxScale = (): number => Math.max(0.7, window.innerWidth / 1280);

  const nodes = [...grid.querySelectorAll<HTMLElement>('.tile')];
  nodes.forEach((el) => {
    const id = el.dataset.id;
    if (!id) return;
    const bias = Number(el.dataset.bias);
    const uniforms: TileUniforms = {
      uMap: { value: null },
      uPointer: { value: new Vector2(0, 0) },
      uImage: { value: new Vector2(1, 1) },
      uTile: { value: new Vector2(1, 1) },
      uMesh: { value: new Vector2(1, 1) },
      uSpill: { value: 0 },
      uRipple: { value: 0 },
      uWave: { value: 0 },
      uColour: { value: 0 },
      uFade: { value: 0 },
      uBias: { value: Number.isFinite(bias) ? bias : 0.58 },
      uPxScale: { value: pxScale() },
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
    mesh.renderOrder = 1;
    scene.add(mesh);
    records.set(id, {
      id,
      el,
      frame: el.querySelector<HTMLElement>('.tile__link') ?? el,
      mesh,
      uniforms,
      texture: null,
      img: el.querySelector('img'),
      loading: false,
    });
  });

  let running = true;
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
      const maxEdge = Math.min(1280, Math.max(640, Math.ceil(displayWidth * dpr)));
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

  const paintFlags = (record: TileRecord): void => {
    const ripple = record.uniforms.uRipple.value;
    const colour = record.uniforms.uColour.value;
    const radius = 210 * pxScale() * Math.pow(Math.max(ripple, 0.0001), 0.72);
    record.el.dataset.ripple = ripple.toFixed(3);
    record.el.dataset.colour = colour.toFixed(3);
    record.el.dataset.radius = ripple > 0.02 ? radius.toFixed(0) : '0';
    record.el.classList.toggle('is-rippling', ripple > 0.02 && colour < 0.98);
    record.el.classList.toggle('is-colour', colour >= 0.98 && ripple >= 0.98);
    record.mesh.renderOrder = ripple > 0.02 ? 8 : 1;
  };

  const sync = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = height * 0.55;
    const scale = pxScale();
    const spillBase = 240 * scale;
    records.forEach((record) => {
      const filtered = record.el.classList.contains('is-filtered');
      const rect = record.frame.getBoundingClientRect();
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
      const spill = spillBase;
      const meshW = rect.width + spill * 2;
      const meshH = rect.height + spill * 2;
      record.mesh.visible = true;
      record.el.classList.add('is-gl');
      record.mesh.position.set(rect.left + rect.width / 2 - width / 2, height / 2 - (rect.top + rect.height / 2), 0);
      record.mesh.scale.set(meshW, meshH, 1);
      record.uniforms.uTile.value.set(rect.width, rect.height);
      record.uniforms.uMesh.value.set(meshW, meshH);
      record.uniforms.uSpill.value = spill;
      record.uniforms.uPxScale.value = scale;
      paintFlags(record);
    });
  };

  const tick = (): void => {
    if (!running || signal.aborted) return;
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

  const stopTweens = (record: TileRecord): void => {
    gsap.killTweensOf(record.uniforms.uRipple);
    gsap.killTweensOf(record.uniforms.uWave);
    gsap.killTweensOf(record.uniforms.uColour);
  };

  const api: NoirGrid = {
    aim(id, x, y) {
      const record = records.get(id);
      if (!record) return;
      record.uniforms.uPointer.value.set(x, y);
      record.el.dataset.pointer = `${x.toFixed(1)},${y.toFixed(1)}`;
    },
    play(id, to) {
      const record = records.get(id);
      if (!record) return;
      stopTweens(record);
      const stretch = clipStretch();
      if (to >= 1) {
        const tl = gsap.timeline({ overwrite: true });
        tl.to(record.uniforms.uWave, { value: 1, duration: 0.08 * stretch, ease: 'power2.out' }, 0);
        tl.to(record.uniforms.uRipple, { value: 1, duration: 1 * stretch, ease: 'none' }, 0);
        tl.to(
          record.uniforms.uColour,
          { value: 1, duration: 0.6 * stretch, ease: 'power2.out' },
          1 * stretch,
        );
        tl.to(record.uniforms.uWave, { value: 0, duration: 0.55 * stretch, ease: 'power1.in' }, 0.95 * stretch);
        return;
      }
      gsap.to(record.uniforms.uWave, {
        value: 0,
        duration: 0.32 * stretch,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => {
          record.uniforms.uWave.value = 0;
        },
      });
      gsap.to(record.uniforms.uRipple, {
        value: 0,
        duration: 0.48 * stretch,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => {
          record.uniforms.uRipple.value = 0;
        },
      });
      gsap.to(record.uniforms.uColour, {
        value: 0,
        duration: 0.55 * stretch,
        ease: 'power2.out',
        overwrite: true,
        onComplete: () => {
          record.uniforms.uColour.value = 0;
        },
      });
    },
    destroy() {
      running = false;
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      records.forEach((record) => {
        stopTweens(record);
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
