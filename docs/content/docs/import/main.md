---
title: Import
order: 4
---

# Template usage

## In an Astro _page_

<!-- prettier-ignore -->
```astro
---
import { get } from '/content';

// Fetch everything
const allContent = await get(Astro.glob('/content/**/*.{md,mdx,yaml}'));

// For auto-completion to show up,
// ✨ start typing a '.' here ——————v
const tryAutoCompletion = allContent ;  

// Narrow fetching to some entities, for performance
const content = await get(
  Astro.glob('/content/{robots,people}/**/*.{md,mdx,yaml}'),
);

// Let's be more specific by getting a single entry
const bigGrumpy = content?.robots?.bigGrumpy;

// Or even get the MD(X) body component directly
const BigGrumpyMainContent = content?.robots?.bigGrumpy?.main.Content;
---

<bigGrumpy.main.Content />

<BigGrumpyMainContent />

<span>{bigGrumpy?.meta?.price}</span>

<!-- Pass data down to component, with end-to-end type safety -->
<Robot feats={bigGrumpy}>
```

## In an Astro _component_

<!-- prettier-ignore -->
```astro
---
import { type Robot } from '/content';

// Augment your <Robot /> `Props`
const { feats } = Astro.props as { feats: Robot };
---

<feats.main.Content />

<!-- As always, you get type safety and auto-completion everywhere! -->
<!-- If it can break here, you'll know it soon while refactoring. -->
<span>{feats?.meta?.price}</span>

```
