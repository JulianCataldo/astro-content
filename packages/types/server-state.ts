/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import type { FileInstance } from './file';
import type { PropertyReport } from './reports';
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

export interface Reports {
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

export interface ServerState {
  content: Content;

  schemas: Schemas;

  reports: Reports;

  types: Types;

  config: {
    previewUrl?: string;
  };
}
export type Endpoint = keyof ServerState;

// NOTE: Unused for now
// export type Action = 'save' | 'validate';
