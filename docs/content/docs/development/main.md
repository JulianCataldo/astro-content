---
title: Development
order: 8
---

# Development

## Setup

> **Note**: `pnpm` is the package manager of choice for developing this mono-repo.  
> macOS / Node >= 17 is the most tested environment.
> Please note that end-user can use anything recommended for a typical Astro project while using Astro Content distributables.

```sh
git clone git@github.com:JulianCataldo/astro-content.git
cd astro-content

pnpm -r i

# ———— Watch / build mono-repo. (turbo)
pnpm run dev

# ———— Doc. website (astro)
cd docs && pnpm run dev
```

## Packages

<!-- Man, this table is horribly long -->

| Role                                                                                                                              | Notes                                          | Name                    | Artefact                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| [**Integration** ](https://github.com/JulianCataldo/astro-content/tree/master/packages/integration) <small>_(Entrypoint)_</small> | Extends Astro / Vite capabilities              | `astro-content`         | [![NPM](https://img.shields.io/npm/v/astro-content)](https://www.npmjs.com/package/@astro-content/gui)      |
| [**Server**](https://github.com/JulianCataldo/astro-content/tree/master/packages/server)                                          | Data handlers, API provider, helpers generator | `@astro-content/server` | [![NPM](https://img.shields.io/npm/v/@astro-content/gui)](https://www.npmjs.com/package/@astro-content/gui) |
| [**Command line**](https://github.com/JulianCataldo/astro-content/tree/master/packages/cli)                                       | Project setups and content manipulation        | `@astro-content/cli`    | [![NPM](https://img.shields.io/npm/v/@astro-content/gui)](https://www.npmjs.com/package/@astro-content/gui) |
| [**Web app**](https://github.com/JulianCataldo/astro-content/tree/master/packages/gui) <small>_(Optional)_</small>                | Full-fledge content editor / monitor           | `@astro-content/gui`    | [![NPM](https://img.shields.io/npm/v/@astro-content/gui)](https://www.npmjs.com/package/@astro-content/gui) |
| [TypeScript **typings**](https://github.com/JulianCataldo/astro-content/tree/master/packages/types)                               | Internal types for development use             | `@astro-content/types`  | [![NPM](https://img.shields.io/npm/v/@astro-content/gui)](https://www.npmjs.com/package/@astro-content/gui) |
| [**Docs**](https://github.com/JulianCataldo/astro-content/tree/master/docs) <small>_(Private)_</small>                            | Using and demonstrating all tools above        |                         | [`astro-content.netlify.app`](https://astro-content.netlify.app/)                                           |
| [**Demo**](https://github.com/JulianCataldo/astro-content/tree/master/demo) <small>_(Clonable)_</small>                           | Minimal boilerplate                            |                         | [./demo](https://github.com/JulianCataldo/astro-content/tree/master/demo)                                   |

`@astro-content/*` are all internal dependencies of the main `astro-content` integration package, which act as a bridge for them.  
Web GUI can be opted out by user settings.

## Deployment environments

### Feature (`[feat-branch]`)

Preview experiments or future additions in isolation.

`[branch]--astro-content.netlify.app/__content`

### Production (`master`)

[`astro-content.netlify.app/__content`](https://astro-content.netlify.app/__content/)

### 🆕  Next! (`develop`)

<small>_Les **bugs** glissent sur vous comme les gouttes d'eau sur le plumage d'un canard. 💦🦆_</small>

[`develop--astro-content.netlify.app/__content`](https://develop--astro-content.netlify.app/__content/)
