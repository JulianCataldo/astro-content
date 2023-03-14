# Astro — ImageKit integration + component

An opinionated toolset for using ImageKit.io with your Astro website.

> **Warning**: Experimental

---

- [Astro — ImageKit integration + component](#astro--imagekit-integration--component)
- [Installation](#installation)
- [Behaviors](#behaviors)
  - [Precepts](#precepts)
  - [Once, at project launch (dev.)](#once-at-project-launch-dev)
  - [During development](#during-development)
  - [With image component](#with-image-component)
  - [During local build / CI](#during-local-build--ci)
  - [Synchronization model](#synchronization-model)
    - [Local](#local)
    - [Remote](#remote)
- [Image component](#image-component)
  - [Interface](#interface)
- [Integration](#integration)
- [Environment](#environment)
- [CLI](#cli)
- [For whom?](#for-whom)
- [Why?](#why)
  - [ImageKit](#imagekit)

---

# Installation

```sh
pnpm astro add astro-imagekit
```

—_OR_—

```sh
pnpm i astro-imagekit
```

And in `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

// /!\ You need to source variables from here,
// as integration are isolated from Vite dev. server process.
import dotenv from 'dotenv';
dotenv.config();

import imagekit from 'astro-imagekit';

// https://astro.build/config
export default defineConfig({
	integrations: [
		//
		imagekit(),
	],
});
```

Don't forget to setup the [environment variables](#environment).

# Behaviors

## Precepts

- Media library is transparently mapped between **remote** and **local**
- No versionning awareness
- No unique file-name id. appending (e.g `/path/to/my-img_g1bB3riIsSH.png`)
- Local files are the single source of truth
- `./content` base folder (configurable) is ignored in git repo.
- Purposedly dumbed down workflow (ImageKit is very powerful)

## Once, at project launch (dev.)

<!-- -  Get remote inde -->

- Scan local files
- Check if each local file path for presence in remote inde
- If **missing**, upload it

## During development

- A media in `./content` is changed by user (captured by Vite server)
- File is uploaded, hard replacing the old one

## With image component

- Retrieval options are passed:
  - File path, relative to `./content`
  - Image provider **transforms**

## During local build / CI

- Nothing is done, everything is already outsourced!

## Synchronization model

Project architecture can look like this:

#### Local

```
./my-astro-project/
├── src/
├── ...
├── content/       <—— .gitignore'd (Independent content delivery life-cycle)
│   │
│   ├── posts/
│   ├── ...
│   │   ├── foo.md        <—— Ignored, only media binaries are handled
│   │   ├── poster.png
│   ├── ...
│   │
│   ├── global
│   │   ├── logo.png
│   │
│   └── ...
└── ...
```

Your free to [use](#environment) `./src/content` or anything. It is just a suggestion workflow.  
I like to co-locate content assets by **purpose**, not by arbitrary file format or distribution constraints.  
MDs, SVGs or anything are static content too, not the source code (as **logic**),
which is running your website.  
E.g. you might want to outsource your content (CMS / external repo. fetching…) for editors and designers to live their lives (see [astro-remote](https://github.com/natemoo-re/astro-remote)).

#### Remote

```
/my-remote-provider-base (ImageKit)
│
├── my-designer-sources_my-astro-project/    <—— Separate sources from distributables
│   │
│   ├── my-img_g1bBer1sH.png     <—— Default IK behavior (versions, uniqueness…)
├── ...
│
├── dist_content/           <—— Mirrors local `./content` (/!\ force-push to remote)
│   │
│   ├── posts/
│   ├── ...
│   │   ├── poster.png      <—— 1:1, clean paths
│   ├── ...
│   │
│   ├── global/
│   │   ├── logo.png
│   │
│   └── ...
└── ...
```

<!-- collaboration ≠ production. -->

The first (sources) folder is only for a more real-world demonstration, you can omit it.  
E.g. you're not collaborating or don't need sources in the cloud,
you do all your design locally and use ImageKit as a distributables receptacle.

# Image component

> **Note**: Work in progress.  
> A local content index is needed for minimizing API roundtrips (metadata retrieval).

- Smooth default transition: **blurred low-res + cross-fade**
- Preloading **placeholder**
- JavaScript disabled **fallback**
- Automatic **ratios** (for that, needs to implement local JSON index)
- …

Goal is to make the API as terse as possible, with automatic configurations  
relying on provider metadatas.

```astro
---
import Image from 'astro-imagekit/Image.astro';
---

<Image
	path="posts/poster.png"
	width="400px"
	widths={[100, 400, 800]}
	sizes="100vw"
/>
```

## Interface

See [./Props.ts](../Props.ts).

# Integration

Example of a CLI output, when you launch `astro dev`:

![](https://user-images.githubusercontent.com/603498/213700780-49c9289e-d508-481e-9119-67cdcbcfb5af.png)

Yields:

![](https://user-images.githubusercontent.com/603498/213702750-7070570f-779e-4510-8ecd-632d1515a9ae.png)

# Environment

Those secrets are used by both the integration and the `Image` component.

```
# REQUIRED

IMAGEKIT_URL_ENDPOINT='https://ik.imagekit.io/$USERNAME/$PUBLISH_DIR'
IMAGEKIT_PUBLIC_KEY='public_**************'
IMAGEKIT_PRIVATE_KEY='private_**************'

# OPTIONAL

IMAGEKIT_BASE_LOCAL_DIR='./content' # <- Default
```

> **Note**:  
> `./content/**` —> `$PUBLISH_DIR/**`
> Setting a publication directory is optional,
> but useful, as you probably want to use your media library for multiple purposes (preproduction files, other projects…).

If a required variable is missing, the integration will throw an error at startup.

See [how to obtain API keys](https://docs.imagekit.io/api-reference/api-introduction/api-keys).

# CLI

It's not necessary to launch Astro dev. server in order to push sync. medias.  
You can do it from the command line:

```
Usage: imagekit index [options]

Manage library index.

Options:
  -e, --env-file <path>  Choose which env. file to use. Useful if sourcing from
                         parent (mono-repo.).
  -r, --pull             Pull remote index to local cache folder.
  -v, --verbose          Dump all outputs.
  -h, --help             display help for command

```

```
Usage: imagekit medias [options]

Manage library medias.

Options:
  -s, --push             Push local files to ImageKit configured distributable
                         directory.
  -e, --env-file <path>  Choose which env. file to use.
                         Useful if sourcing from parent (mono-repo.).
  -h, --help             display help for command
```

<!-- # TODO

- globalize it, with .some-ignore files
- explain the process

-->

# For whom?

Featureset is focused, it may not suit your workflow.  
It is aimed at **heavy media databases**, think GBs, not MBs.
Nonetheless, you can benefit from it in different scenarios, too.

Goal is to manage your static assets life-cycle **independently from code**.  
That way, you don't have to do convoluted setups, affecting your repo. (Git LFS and alike), while bloating your
CI / Vite builds with tons of redundant medias transformations, uploads…

> **Note**: Syncing mechanism is pretty basic, so at least, it is more fail-proof vs. a full fledged one.  
> That means manual interventions if things goes unsynced (you can still go nuclear-mode).  
> See [Behaviors](#behaviors) for more insights.

# Why?

I've started this as the **less painful** solution I could think of for my specific
uses cases, consolidating tricks from years of experience chasing the holy grail.
Like many of us, I've struggled with
large binaries management, in **close relation** to source code.
Reason is they're total antagonists in their own nature.  
One have still to wait before a perfect and universal solution to arise 🤞.

## ImageKit

I've chosen this provider because I couldn't wrap my head with some of the
Cloudinary behaviors, and overall the DX was much better with ImageKit.  
I don't endorse any of these companies: I'm just seeking for the best
bang-for-the-bucks media service provider,
with the possibility to change at any time if it does not fit the bill anymore.  
Originally, I'm reluctant to handing over original, copyrighted assets to
third-parties, but regarding web medias diffusion (images, videos), we can hardly do without
big providers for now, sadly. Self-hosting is hard.  
Anyway, ImageKit.io have done some enjoyable APIs, and I'm thankful for that.

**TL;DR**: I think the fact that ImageKit is more recent helps a lot, DX-wise.

See <https://imagekit.io> (_not affiliated_).

---

🔗  [JulianCataldo.com](https://www.juliancataldo.com/)
