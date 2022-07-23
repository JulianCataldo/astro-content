export interface ContentComponent {
  name: string;
  collection: string;
  type: 'markdown' | 'yaml' | 'unknown';
  role: 'body' | 'frontmatter' | 'unknown';
  path: string;
  content?: string;
}
