---
title: Roadmap
order: 8
---

# Work in progress

<div align="center">

— Scopes: [ **int** · **srv** · **gui** · **ide** · **gui** · **cli** · **doc** ] —

</div>

---

- [ ] Rehaul Astro `MarkdownInstance` <=> `MardownFile` schema definition <=> `MarkdownFile` TS interface. [ **int** · **srv** ]
  - [ ] `Content` Astro component especially, is not propertly typed.
  - [ ] Same for `YamlInstance`, which need some love, generally.
- [ ] Actual runtime JSON Schema validation, not just _reporting_ errors, but pro-actively preventing them to occur, with opt-out capabilities. [ **srv** ]
- [ ] Automatic remark-lint setup. [ **srv** · **ide** · **cli** ]
- [ ] Automatic remark sync. [ **srv** · **ide** · **cli** ]
- [ ] Custom Markdown linting rules -> Should hook up with `.remarkrc.mjs`, so user benefit from both IDE and Web app custom rules. [ **srv** · **ide** ]
- [ ] Add documentation to website [ **doc** ]
- [ ] Fix silent MDX failures breaking entire app. [ **int** · **srv** · **gui** ]
- [ ] MDX support [ **gui** ]
  - [x] Syntax highlighting + configuration for monaco.
  - [ ] Advanced language features.
- [ ] Syntax highlight for MD front matters [ **gui** ]
