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

```sh
pnpx degit \
JulianCataldo/content-components/demo \
my-projects


cd my-projects
pnpm install --recursive

# Terminal A — Content
cd content
# Start content server,
pnpm ccomp
# Happy editing!

# Terminal B — Consumer
cd front-astro
pnpm run dev
```

## Demo

[See the demo workspace](./demo)

## Configuration

[See the Configuration API](./types/config.ts)

## How does it works? An eagle view

[See the diagram here](./docs/how-it-works.md)

## Content ingestion

As for now, supports: pure Markdown\* and YAML.

_\*with advanced features like GFM, directives, TOC…_

### Helper

```ts
import content from 'content/get';

const articles = await content.getArticles();

if (articles) {
  console.log(articles?.someNamedArticle);
  console.log(articles?.someNamedArticle?.main?.body);
}
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

const articles = await content.getArticles();

const content = articles &&
  articles?.someNamedArticle &&
  articles.someNamedArticle?.main?.body;

const components = { Gallery };
---

{ content && <Markup {content} {components} /> }
```

## Consumers

You could really use **anything** on
the other side of the wire, though, Content Maestro is made with the **Astro**
framework in mind, as it provides easy way to
integrate and "**augment**" remote markup.  
Content helpers are just plain typescript functions, with no ties, outside of AJV.
