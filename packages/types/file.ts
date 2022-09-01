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
