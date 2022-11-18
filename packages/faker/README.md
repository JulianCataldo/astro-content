# Astro Content — Content faker for Markdown + front matter

Quickly populate content collections from your schemas.

Perfect match with [remark-lint-frontmatter-schema](https://github.com/JulianCataldo/remark-lint-frontmatter-schema) and [@astro-content/validator](https://github.com/JulianCataldo/astro-content/tree/develop/packages/validator).

# Installation

```sh
pnpm i @astro-content/faker
```

—_OR_—

Shallow clone [demo project](./demo):

```sh
pnpx degit JulianCataldo/astro-content/packages/faker/demo ./ac-faker-demo
```

# Usage

### CLI

```sh
# content-faker $SOURCE_TEMPLATE $DESTINATION_DIR $ENTRIES_COUNT
#                             Default to 1 if unset ———^

# E.g.
content-faker src/mocks/blog-post.template.md content/blog-posts 20
```

#### Example template

Gist:

<div align="center">

[<img width="640" src="https://res.cloudinary.com/dzfylx93l/image/upload/w_800/astro-content-faker-1_auxvod.png"/>](https://res.cloudinary.com/dzfylx93l/image/upload/astro-content-faker-1_auxvod.png)

</div>

Complete example:

````markdown
---
'$schema': src/schemas/blog-post.schema.yaml
---

```js:faker
'# ' + faker.lorem.sentence(10)
```

```js:faker
'## ' + faker.lorem.sentence(9)
```

```js:faker
`**${faker.address.city()}**`
```

```js:faker
faker.lorem.sentence(12)
```

```js:faker
'### ' + faker.lorem.sentence(9)
```

```js:faker
`<SomeMap address="${faker.address.city()}" />`
```

---

```js:faker
'> ' + faker.lorem.sentence(10)
```

---

```js:faker
`- ${faker.lorem.sentence(6)}\n- ${faker.lorem.sentence(8)}\n- ${faker.lorem.sentence(10)}`
```

```js:faker
`<SomeTweet id="${faker.helpers.arrayElement(['1590042307163717635','1593680639005315073','1587901468585205760','1578871432700125185'])}" />`
```

```js:faker
'## ' + faker.lorem.sentence(9)
```

```js:faker
faker.lorem.paragraphs(2)
```

```js:faker
'### ' + faker.lorem.sentence(9)
```

```js:faker
`<SomeYoutubeVideo id="${faker.helpers.arrayElement(['xtTy5nKay_Y','BZZ9rGN4GK8','GPelHyt7iJ8','py8nD37SVDU'])}" />`
```

```js:faker
faker.lorem.paragraphs(1)
```

---

```js:faker
faker.date.recent().toLocaleDateString()
```
````

🎊 Yields:

```markdown
---
title: dolor
description: deseruntut laboris sit laborumin labore ullamcovoluptate laboris
  occaecat nisi fugiatfugiat labore dolore in
tags:
  - Music
  - Cooking
  - Gardening
  - Video
  - Sport
  - Development
---

<!-- GENERATED CONTENT -->

# Aperiam tempora animi necessitatibus eligendi quas explicabo reprehenderit fugiat nobis.

## Iure delectus sapiente voluptas possimus provident maiores ipsam mollitia.

**Wizaberg**

Ullam voluptatibus perspiciatis placeat in officiis odio laborum cumque excepturi ut eveniet.

### Dolor assumenda similique aspernatur soluta provident exercitationem dolorum reiciendis.

<SomeMap address="Coleborough" />

---

> Vitae quibusdam doloremque consequuntur facilis quisquam corporis saepe aperiam adipisci.

---

- Autem vitae voluptate modi vero pariatur.
- Unde fuga iure eos assumenda iste atque voluptas.
- Aliquid est harum quod explicabo facilis quidem placeat error unde.

<SomeTweet id="1587901468585205760" />

## Quia perspiciatis laborum quasi nostrum dolor molestiae ex consequuntur.

Cupiditate quam labore aliquam at quisquam natus molestiae laboriosam. Ullam harum occaecati quidem dolorem sint libero. Reiciendis incidunt illo repudiandae nostrum quidem. Saepe beatae sequi quasi culpa quas cum quo. Odit perspiciatis reprehenderit quos id quae autem ab beatae. Corrupti nemo perferendis mollitia facilis.
Nostrum ad laboriosam. Rerum libero possimus est expedita possimus placeat veniam necessitatibus voluptas. Exercitationem blanditiis odio illum totam id repudiandae.

### Tenetur similique cupiditate illo doloremque similique commodi reiciendis est.

<SomeYoutubeVideo id="GPelHyt7iJ8" />

Repudiandae distinctio exercitationem. Quo totam esse debitis. Nihil velit a expedita laboriosam. Minus quas itaque iusto quis non quod. Aut sapiente soluta voluptate ipsum ducimus mollitia commodi veniam animi.

---

18/11/2022
```

### API

Alternatively from the CLI, you can use this library programmatically:

```ts
import { generateFakeContent } from '@astro-content/faker';

await generateFakeContent(mdTemplatePath, outDir, count).catch((error) => {
  console.log(error);
});
```

See also the **[demo project](./demo)** to play with.

# Recommendations

For the best experience, use these helpers in combination with [remark-lint-frontmatter-schema](https://github.com/JulianCataldo/remark-lint-frontmatter-schema).
[![](https://res.cloudinary.com/dzfylx93l/image/upload/c_scale,w_1280/eslint-plugin-mdx-1.png)](https://res.cloudinary.com/dzfylx93l/image/upload/eslint-plugin-mdx-1.png)

---

🔗  [JulianCataldo.com](https://www.juliancataldo.com/)
