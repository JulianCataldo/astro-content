// TODO: Rehaul file types: align Astro <=> JSONSchema <=> Astro Content

import type { MarkdownHeading, MarkdownInstance, MDXInstance } from 'astro';

export type FileLanguage = 'yaml' | 'markdown' | 'mdx';

interface FileInfo<Lang> {
  language: Lang;
}

export type OriginalInstance =
  | MarkdownInstance<Record<string, unknown>>
  | MDXInstance<Record<string, unknown>>
  | YamlInstance<unknown>;

export type FileInstance =
  | (MarkdownInstance<Record<string, unknown>> & FileInfo<'markdown'>)
  | (MDXInstance<Record<string, unknown>> & FileInfo<'mdx'>)
  | (YamlInstance<unknown> & FileInfo<'yaml'>);

export type FileInstanceExtended =
  | (MarkdownInstance<Record<string, unknown>> & ExtraMd)
  | (MDXInstance<Record<string, unknown>> & ExtraMdx)
  | (YamlInstance<unknown> & ExtraYaml);

interface MdBase {
  headingsCompiled?: MarkdownHeading[];
  excerpt?: { html: string };
}
export interface ExtraMd extends MdBase {
  language: 'markdown';
  raw: string;
  // bodyCompiled?: string;
}
export interface ExtraMdx extends MdBase {
  language: 'mdx';
  raw: string;
}
export interface ExtraYaml {
  language: 'yaml';
}

/* For Vite YAML loader plugin */
export interface YamlInstance<T> {
  data: T;
  /** Absolute file path (e.g. `/home/user/projects/.../file.yaml`) */
  file: string;

  raw: string;
}
