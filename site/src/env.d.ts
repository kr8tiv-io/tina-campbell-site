/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_NOINDEX?: string;
  readonly SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
