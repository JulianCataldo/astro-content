---
title: Modeling
order: 3
---

# Schema

Astro Content uses JSON Schema under the hood for all your content lifetime:  
From designing, to importing then finally, rendering in your templates.

## How does it compare to X. schema?

Other projects relies on GraphQL, zod, their own systems…
Astro Content is built with JSON Schema because your content is text,
and it's ultimately going to be rendered as text.  
That's means you don't need intricate imperative / dynamic setup where
it shouldn't be.
You can leave all that logic to your <strong>Astro / React / Vue… components</strong> or inside your <strong>MDX documents</strong>.

# Imperative versus declarative

Assumption is made that static content, when
modeled <strong>imperatively</strong> is difficult to maintain and prone to errors.

Gatsby boosted the interest for static websites,
bringing MD(X) ecosystem to new levels.  
That's not because of GraphQL, which was over the top for most websites.  
Of course it's powerful, but had steep learning curve, compared to "classic" APIs.  
In fact, nuxt/content was designed with a simple JS API which was
refreshing, though you'll lose end-to-end strictness, with no schema whatsoever.  
When consuming content, inside your app, an imperative API is the most flexible.

## API comparison

| GraphQL | Astro Content | Astro Content | Astro Content | Astro Content |
| ------- | ------------- | ------------- | ------------- | ------------- |
|         |               |               |               |               |

:

- Modeling: ✨ Imperative / 📝 Declarative
- Consuming: Declarative (with `queries`)

Astro Content:

- Declarative for modeling
- Imperative for consuming (`queries`)
