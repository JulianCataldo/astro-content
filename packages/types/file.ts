// TODO: Rehaul file types: align Astro <=> JSONSchema <=> Astro Content

import type { MarkdownHeading, MarkdownInstance } from 'astro';

export type FileInstance =
  | (MarkdownInstance<Record<string, unknown>> & ExtraMd)
  | (YamlInstance<unknown> & ExtraYaml);

export interface ExtraMd {
  rawMd: string;
  bodyCompiled?: string;
  headingsCompiled?: MarkdownHeading[];
  excerpt?: { html: string };
  //   footnotes?: Footnotes;
  //   rawYaml?: string;
  //   data: unknown;
  //   file: unknown
}
export interface ExtraYaml {
  // rawYaml: string;
}

export interface YamlInstance<T> {
  data: T;
  /** Absolute file path (e.g. `/home/user/projects/.../file.yaml`) */
  file: string;

  rawYaml: string;
}

// interface File {
//   file: string;
// }
// interface Markdown {
//   frontmatter: Record<string, unknown>;
// }
// interface YAML {
//   data: unknown;
// }
// type AnyFile = File & (Markdown | YAML);
