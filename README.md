# Content components transformer

TS / JSON Schema / VS Code / Markdown / Astro — Synchronization

# Usage

```zsh

pnpm i -r
pnpm run dev & pnpm run demo

```

Make sure to have `redhat.vscode-yaml` extension installed, this will enable YAML schema support.

# Quick demo

---

https://user-images.githubusercontent.com/603498/180596260-83e8624e-6c43-448d-a957-49420677d73e.mp4

---

> **Note**  
> Astro demo site is not configured yet for SSR, but should work with live content updates without problems

## Edition

1. `./content/<collection>/<type>.schema.json`
   1. Generate types in `./demo/types/<type>.ts`  
      **Example**: [`./demo/types/boat.ts`](./demo/types/boat.ts)
      - Provides type awareness in Astro files.  
        **Example**: [`./demo/src/pages/index.astro`](./demo/src/pages/index.astro)
   2. Generate VSCode settings `./.vscode/settings.json`
      - Provides schema auto-completion and validation in `./content/<collection>/<name>/frontmatter.yaml`  
        **Example**: [`./content/boats/the-huge-yellow-one/frontmatter.yaml`](./content/boats/the-huge-yellow-one/frontmatter.yaml)
2. `./content/**/*/*.md`.
   1. Generate HTML in `demo/content/<collection>/<name>/body.html`
      1. Provides content in Astro files.  
         **Example**: [`./demo/src/pages/index.astro`](./demo/src/pages/index.astro)
3. `./content/**/*/*.yaml`
   1. Generate JSON in `demo/content/<collection>/<name>/frontmatter.json`
      1. Provides metadata in Astro files.  
         **Example**: [`./demo/src/pages/index.astro`](./demo/src/pages/index.astro)

## Configuration

[`./config.ts`](./config.ts)

# WIP

Expected goal:

```ts
interface ContentComponent {
  name: string;
  collection: string;
  path: string;

  frontmatter: {
    [key: string]: unknown;
  };
  body: string;

  assets: {
    path: string;
    // type
    // ...
  };
}
```
