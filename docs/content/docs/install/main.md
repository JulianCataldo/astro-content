---
title: Installation
order: 2
---

## Method 1: Add to Astro project with _CLI_

With `yarn`, `npm` or `pnpm`, run this in your **existing** Astro project:

```sh
# If you want a fresh start ——v
# pnpm create astro && cd ./my-astro-site

pnpm astro add astro-content
pnpm content setup
```

Follow the prompts… 🐇

## Method 2: Clone _demo project_

Shallow **clone** this minimal Astro **starter**, which comes with dummy **content** for you to play with:

```sh
pnpx degit JulianCataldo/astro-content/demo ./ac-demo
cd ./ac-demo && pnpm install

# Clone dummy content
pnpx degit JulianCataldo/astro-content/docs/content/@dummy ./content
# —OR— setup a minimal content base with Astro Content CLI
pnpm content setup

# Open project in VS Code
code .
```

> **Warning**: Only **Node 17** or higher is actually supported by Astro Content.

## _Launch_ project

OK, **project is ready**. It's time to:

```sh
pnpm run dev
```

Now head over to [http://localhost:3000/**\_\_content**](http://localhost:9054/__content) to take a deep dive in Astro Content.

## _TypeScript_ setup

It's OK to use an absolute path, so you don't have to do tedious relative imports:

```tsx
import { get } from '../../content';
// Versus:
import { get } from '/content';
```

Astro / Vite resolve absolute paths from project root.  
That's cool,
but TypeScript language server (in your IDE) will likely break, while showing
red squiggles 🤨.

A very simple fix is adding this to your `tsconfig.json` > `compilerOptions.paths`:

```jsonc
{
  "compilerOptions": {
    // …
    "paths": {
      // Make TS happy with absolute path
      "/content": ["./content"]
    }
  }
}
```
