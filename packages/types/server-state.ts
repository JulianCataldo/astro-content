/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { JSONSchema7 } from 'json-schema';
import type { Position as UnistPosition } from 'unist';
import type {
  FootnoteDefinition as MdAstFootnoteDefinition,
  FootnoteReference as MdAstFootnoteReference,
  Link,
} from 'mdast';
import type { ErrorObject as AjvErrorObject } from 'ajv';
import type { VFileMessage } from 'vfile-message';
/* ·········································································· */
import type { FileInstance } from './file';
/* —————————————————————————————————————————————————————————————————————————— */

export interface Content {
  [entity: string]:
    | {
        [entry: string]:
          | {
              //
              [property: string]: FileInstance | undefined;
            }
          | undefined;
      }
    | undefined;
}

export interface Schemas {
  internals: { [schemaName: string]: JSONSchema7 };
  content: { [schemaName: string]: JSONSchema7 };
  raw: { [schemaName: string]: string };
}

export interface Errors {
  [entity: string]:
    | {
        [entry: string]:
          | {
              [property: string]: PropertyReport | undefined;
            }
          | undefined;
      }
    | undefined;
}

export interface Types {
  common: string;
  browser: string;
  ide: string;
}

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
export interface ErrorSchema extends AjvErrorObject {
  // [key: string]: unknown;
  position?: UnistPosition;
}
export interface ErrorLint extends VFileMessage {}
export interface ErrorProse extends VFileMessage {}

export type Reports =
  | ErrorSchema[]
  | ErrorLint[]
  | ErrorProse[]
  | FootnotesReference[]
  | FootnotesDefinition[]
  | (FootnotesReference | FootnotesDefinition)[]
  | ReportLink[];

export interface PropertyReport {
  schema?: ErrorSchema[];
  lint?: ErrorLint[];
  prose?: ErrorProse[];

  footnotes?: ReportFootnote;
  links?: ReportLink[];
}

export interface ServerState {
  content: Content;

  schemas: Schemas;

  errors: Errors;

  types: Types;

  config: {
    previewUrl?: string;
  };
}
export type Endpoint = keyof ServerState;
