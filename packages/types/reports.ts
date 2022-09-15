import type { FrontmatterSchemaMessage } from '@julian_cataldo/remark-lint-frontmatter-schema';
import type { Position as UnistPosition } from 'unist';
import type {
  FootnoteDefinition as MdAstFootnoteDefinition,
  FootnoteReference as MdAstFootnoteReference,
  Link,
} from 'mdast';
import type { ErrorObject as AjvErrorObject } from 'ajv';
import type { VFileMessage } from 'vfile-message';
/* —————————————————————————————————————————————————————————————————————————— */

export interface FootnotesDefinition extends Partial<MdAstFootnoteDefinition> {
  // label: string;
  html: string;
  // position?: UnistPosition;
  // id: string;
}
export interface FootnotesReference extends Partial<MdAstFootnoteReference> {
  // label: string;
  // id: string;
  // html: string;
  // position?: UnistPosition;
}
export interface ReportFootnote {
  references: FootnotesReference[];
  definitions: FootnotesDefinition[];
}

// export interface ReportFootnote {
//   // [key: string]: unknown;
//   position?: UnistPosition;
// }
export interface ReportLink extends Partial<Link> {
  html: string;
}
export interface YamlErrorSchema extends AjvErrorObject {
  // [key: string]: unknown;
  position: UnistPosition | null;
}

type MdSchema = FrontmatterSchemaMessage['schema'];
export interface MdErrorSchema extends MdSchema {
  // [key: string]: unknown;
  position: UnistPosition | null;
}

export interface ErrorLint extends VFileMessage {}
export interface ErrorProse extends VFileMessage {}

export type Reports =
  | YamlErrorSchema[]
  | ErrorLint[]
  | ErrorProse[]
  | FootnotesReference[]
  | FootnotesDefinition[]
  | (FootnotesReference | FootnotesDefinition)[]
  | ReportLink[];

export interface PropertyReport {
  schema?: YamlErrorSchema[] | MdErrorSchema[];
  lint?: ErrorLint[];
  prose?: ErrorProse[];

  footnotes?: ReportFootnote;
  links?: ReportLink[];
}
