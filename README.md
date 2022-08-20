# Content Maestro 💁‍♂️📚

A **text** based, **structured content** framework, for **edition** and **consumption**.

> **Warning**: Under heavy development

- [Content Maestro 💁‍♂️📚](#content-maestro-️)
  - [Highlights](#highlights)
  - [For whom?](#for-whom)
- [Let's get into the details](#lets-get-into-the-details)
  - [What's in the box?](#whats-in-the-box)
  - [Installation](#installation)
  - [Demo](#demo)
  - [Configuration](#configuration)
    - [Recommended VS Code extensions](#recommended-vs-code-extensions)
  - [How does it works? An eagle view](#how-does-it-works-an-eagle-view)
  - [Content ingestion](#content-ingestion)
    - [Helper](#helper)
    - [Markdown](#markdown)
      - [Checking (linting + validation)](#checking-linting--validation)
      - [Transformer](#transformer)
      - [Astro template](#astro-template)
  - [Consumers](#consumers)

## Highlights

- Manage your content in a predictable way
- Prevents entropy for ever growing knowledge base
- Future-proof: based on standards, idioms and popular tools
- Transform and serve your content
- Generate type-safe import Helpers
- Agnostic API: target any consumer type

You might have 10 wiki entries, it's easy to refactor for a category name typo.  
But what if we have hundreds of entries accross dozens of differents collections types?

That's where Content Maestro intervene, by giving a schema first based approach.  
The whole pipeline originate from a seed: your schemas definitions.

> **Current state of DX for code edition is phenomenal** thanks to TypeScript, languages servers, linting tools, smart IDEs…  
> Thankfully, we are making some progress regarding content edition.

## For whom?

Mainly for us, **developers** 🤓.  
We enjoy building tools that make content editing simpler for non-technical people.  
Still, for us, text-based editing is unbeatable.  
However, this presents a challenge: how do we keep track of structural changes?  
How can we make this predictable for content consumers like your wiki,
documentation, blog, web garden, or any server-rendered or static website?

# Let's get into the details

## What's in the box?

- Sensible defaults for a quick new project bootstrap
- State-of-the-art Markdown (and friends) environment
- A command line initializer, with options
- A command line editing server
- Fake entries mock server, with valid content for _lorem ipsum_ purposes
- A command line assistant for scaffolding new entries
- An open gate for adding your own transformers
- A graphical interface for content preview / problems reviews
- Linting / checking pre-configured and orchestrated for you
- Refactoring assistance, thanks to all your IDE toolings

## Installation

<!-- > **Note**: for using **NPM** insteadof **PNPM**, just remove the **`"p"`** prepended on commands -->

Example project setup is:

- A package folder where all your **content** with its dedicated environment lives.
  - The **content server**, which can act both for **dev**. and **prod**.
  - **Content helpers**, exported as a package for consumers to import
  - Pre-configured local dev. tooling for **edition**
- A folder with your **front end** consumer, could be anything:  
  Nuxt, Next, Gatsby, Astro, plain TypeScript…  
  Here we use Astro.

Boilerplate below gives you a package which can be imported
by your own means: mono-repos with linked package, separate repos, multiple consumers,…
We won't get in details here.  
Content Maestro is really just a version-able, independent Node package for your data.  
File structure is for demonstration purpose.

```sh
# Create the parent housing folder for your project
mkdir ./my-project && cd ./my-project

# Content Maestro boilerplate + CLI
pnpx degit \
JulianCataldo/content-maestro/demo/content-base ./content-base

# (Optional) Demo front-end content consumer
# `content-base` package is linked-imported in this front-end
pnpx degit \
JulianCataldo/content-maestro/demo/front-astro ./front-astro

# Bootstrap all dependencies
pnpm install --recursive

# Terminal A — Content server
cd content-base
pnpm run start

# Terminal B — Consumer web GUI
cd front-astro
# Development mode
pnpm run dev

# -OR- pack + launch server side rendered website
pnpm run build:start

# ——————————————————————————————————————————————————————————————————————————————

# Terminal C — Content creation CLI utilities

# Bootstrap a singleton entity
pnpm maestro create profile

# Bootstrap a collection of entities
pnpm maestro create people person
#                       ↑      ↑
# Collection name ——————·      |
# Entity singular name ————————·
#
# Yields:
#
# content/people
# ├── person.schema.yaml     (basic schema)
# └── voice-hay-lif          (random words)
#     ├── body.md            (basic frontmatter + markdown)
#     └── meta.yaml          (basic extra metadata)

# ··············································································

# Create a new entity inside an existing collection
pnpm maestro create people elisabeth
#                       ↑        ↑
# Collection name ——————·        |
# New entity name ———————————————·
#
# Yields:
#
# content/people
# └── elisabeth
#     ├── […].md            (schema generated fake data frontmatter + markdown)
#     └── […].yaml          (schema generated fake metadata)

```

## Demo

[See the demo workspace](./demo)

## Configuration

[See the Configuration API](./types/config.ts)

### Recommended VS Code extensions

```sh
code --install-extension redhat.vscode-yaml
code --install-extension unifiedjs.vscode-remark
```

## How does it works? An eagle view

[See the diagram here](./docs/how-it-works.md)

## Content ingestion

As for now, supports: pure Markdown\* and YAML.

_\*with advanced features like GFM, directives, TOC…_

### Helper

```ts
import content from 'content/get';

const articles = await content.getArticles();

console.log(articles?.someNamedArticle);
console.log(articles?.someNamedArticle?.main?.body);
```

### Markdown

These are the already bundled Mardown transformers

#### Checking (linting + validation)

- Preset — Recommended
- Preset — Style Guide
- Preset — Consistent
- YAML frontmatter schema validation
<!-- - Case police -->

#### Transformer

- Transform markdown directives to custom components
- Load GitHub-flavored Markdown features
- Extract YAML frontmatter
- Convert to formatted HTML
- Pass `<Components />` for front-end to handle
- Bundle and build entries static JSONs

#### Astro template

[See demo project](./demo/front-astro).  
Pre-configured for SSR bundling then serve.

Front-end works in concert with **content server**
and will fast-refresh its changes in dev. mode.

```astro
---
import content from 'content/get';

import { Markup } from 'astro-remote';
import Gallery from 'src/components/Gallery.astro';
import Link from 'src/components/Link.astro';

const articles = await content.getArticles();

const someNamedArticle = articles?.someNamedArticle
const content = someNamedArticle?.main?.body;
const title = someNamedArticle?.main?.frontmatter?.title;
const someMeta = someNamedArticle?.meta?.foo;

/* Augment markup by mapping your Astro / React / Vue / Svelte components
   Server-side rendering only (no client-side hydration) */
const components = { Gallery, 'a': Link, /* … */ };
---

{ title && <h1>{title}</h1> }

{ content && <Markup {content} {components} /> }

{ someMeta || 'nothing…' }

<!-- ... -->
```

## Consumers

You could really use **anything** on
the other side of the wire, though, Content Maestro is made with the **Astro**
framework in mind, as it provides easy way to
integrate and "**augment**" remote markup.  
Content helpers are just plain typescript functions, with no ties, outside of AJV.
