# Astro Content — Schema validator helpers

A fail-safe way to ingest your project content.

# Features

- Runtime validation
- Precise error reporting
- Static types
- TS Documentation (auto-completion goodness).
- Replace **missing** / **wrong** content with **fake** / **default** / **example**.

# Installation

```sh
pnpm astro add @astro-content/validator
```

—_OR_—

`pnpm i @astro-content/validator`, then add to your `astro.config.mjs`:

```js
import { schemasToCheckers } from '@astro-content/validator';

export default defineConfig({
  // ...
  integrations: [
    //...
    schemasToCheckers({ outDir: 'src/checkers' }),
  ],
});
```

---

Shallow clone demo project:

```sh
pnpx degit JulianCataldo/astro-content/packages/validator/demo ./ac-validator-demo
```

# Integration

It will scan all `src/**/*.schema.yaml` in the Astro project and generate associated runtime validator and static types.

## Settings:

- `outDir`: Central destination for the generated checkers.
  **Default**: None  
  Examples: `src/checkers`, `.astro-content/checkers`, `.astro/checkers`…

If you leave it blank, generated files will be colocated with their input schema, regardless of their containing directory (a bit like a TypeScript declaration file).
E.g. `./src/schemas/post.schema.yaml` → `./src/schemas/post.checker.ts`

## Usage

Gist:

```js
import { checkArticle } from '/src/checkers/article.checker';

const frontmatter = { title: 'Hello world' };

const { result: entry, errors } = await checkArticle(frontmatter);

console.log({ title: entry.title, errors });

if (errors) {
  // We don't want to pursue…
}
// Or maybe we want to!
// E.g. You've set the `default` or `examples` fields as fallbacks,
// or you'll get valid, though fake data.
```

See also [.remarkrc.yaml](./demo/.remarkrc.yaml), [wrong_entry-foo.md](./demo/content/blog-posts/wrong_entry-foo.md), [blog-post.schema.yaml](./demo/src/schemas/blog-post.schema.yaml).

---

In Astro templates:

```astro
---
import { Code } from 'astro/components';
import { checkBlogPost } from '../checkers/blog-post.checker';

// Pre-validate all data upfront. This is not always wanted.
const blogPosts = await Astro.glob('/content/blog-posts/*.md').then((posts) =>
  Promise.all(posts.map((post) => checkBlogPost(post.frontmatter))),
);

console.log(blogPosts);
---

<Code code={JSON.stringify(blogPosts, null, 2)} lang={'json'} />
```

[![](https://res.cloudinary.com/dzfylx93l/image/upload/c_scale,w_1280/astro-content-validator-1c_qy57zt.png)  
](https://res.cloudinary.com/dzfylx93l/image/upload/astro-content-validator-1c_qy57zt.png)

<details>
<summary>🎊 Yields</summary>

```jsonc
[
  {
    "result": {
      "title": "This is a cool title.",
      "description": "My description is long enough to make the schema happy.\nMore text. More text. More text. More text. More text.\n"
    },
    "schema": {
      // ...
    }
  },
  {
    "result": {
      "title": "My untitled blog post",
      "tags": ["Music"],
      "description": "No description found."
    },
    "errors": [
      {
        "instancePath": "/tags/0",
        "schemaPath": "#/allOf/0/properties/tags/items/type",
        "keyword": "type",
        "params": {
          "type": "string"
        },
        "message": "must be string"
      },
      {
        "instancePath": "/tags/0",
        "schemaPath": "#/allOf/0/properties/tags/items/enum",
        "keyword": "enum",
        "params": {
          "allowedValues": [
            "Music",
            "Video",
            "Development",
            "Cooking",
            "Gardening",
            "Sport"
          ]
        },
        "message": "must be equal to one of the allowed values"
      },
      {
        "instancePath": "",
        "schemaPath": "#/allOf/1/required",
        "keyword": "required",
        "params": {
          "missingProperty": "description"
        },
        "message": "must have required property 'description'"
      },
      {
        "instancePath": "/title",
        "schemaPath": "#/allOf/1/properties/title/type",
        "keyword": "type",
        "params": {
          "type": "string"
        },
        "message": "must be string"
      }
    ],
    "original": {
      "title": 123456,
      "tags": [123456]
    },
    "schema": {
      // ...
    }
  }
]
```

</details>

See also the **[demo project](./demo)** to play with.

## Alternative methods for generating checkers

This library is thought primarly as an Astro project integration but in fact, you could
use it with any JS / TS project of yours, and use the helpers in the browser, too.

Moreover, you might want to customize checker generation inside your workflow.  
You can access these helpers with an API and the CLI too.

### API

```js
import { generateChecker, generateAllCheckers } from './schema-to-validator';

const outDir = 'src/checkers';
await generateAllCheckers(outDir);

const schemaPath = 'src/schemas/post.schema.yaml';
await generateChecker(schemaPath, outDir);
```

### CLI

```sh
content-validator "<outdir (optional)>"
```

# Recommendations

For the best experience, use these helpers in combination with [remark-lint-frontmatter-schema](https://github.com/JulianCataldo/remark-lint-frontmatter-schema).
[![](https://res.cloudinary.com/dzfylx93l/image/upload/c_scale,w_1280/eslint-plugin-mdx-1.png)  
](https://res.cloudinary.com/dzfylx93l/image/upload/eslint-plugin-mdx-1.png)

# Why JSON Schema (w. AJV)?

- Schemas are standards, declarative and re-usable.
- **Top-tier performance**: <https://moltar.github.io/typescript-runtime-type-benchmarks>.
- **Biggest eco-system** out there: think data **fakers**, types + **TSDoc** generator, form generators, OpenAPI….

But really, the two main reasons are that:

1. AFAIK, it's the only way to get your hard worked-on TSDoc (from `description` field).
   Which means nice and insightful auto-completion.
2. It allows this lib. to integrate perfectly with **remark-lint-frontmatter-schema**.
   This way, you get an end-to-end schema + types validation experience, from **sources** to **client browser**.

# Ideas

- Refine the way on how fallback data is injected, relating to error handling and user preferences.

---

🔗  [JulianCataldo.com](https://www.juliancataldo.com/)
