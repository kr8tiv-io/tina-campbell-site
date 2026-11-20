/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_NOINDEX?: string;
  readonly SITE?: string;
  readonly TC_MOTION_LAB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'three' {
  class AnyThree {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export class BufferAttribute extends AnyThree {}
  export class BufferGeometry extends AnyThree {}
  export class CanvasTexture extends AnyThree {}
  export class Mesh extends AnyThree {}
  export class OrthographicCamera extends AnyThree {}
  export class PlaneGeometry extends AnyThree {}
  export class Scene extends AnyThree {}
  export class ShaderMaterial extends AnyThree {}
  export class Texture extends AnyThree {}
  export class Vector2 extends AnyThree {}
  export class WebGLRenderer extends AnyThree {}
  export const LinearFilter: any;
  export const LinearSRGBColorSpace: any;
  export const MathUtils: any;
  export const NoColorSpace: any;
  export const NoToneMapping: any;
  export const SRGBColorSpace: any;
}
