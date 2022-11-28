// @ts-expect-error

import type { parse } from './get-file';

/* ·········································································· */

export type GenericFrontmatter = Record<string, unknown>;
export type GenericData = unknown[] | GenericFrontmatter;
export type GenericModule = Module<'Generic', GenericData>;

/* ·········································································· */

export interface Path {
  normalized: string;
  baseName: string;
  parts: string[];
  dir: string;
  // file: string;
  language: string;
  original: string;
}

export interface Module<Discriminator, DataType> {
  readonly path: Readonly<Path>;

  data: DataType;
  body: string | undefined;

  source: Discriminator | undefined;

  [key: string]: unknown;
}

export interface ModulesEntries<ModuleType> {
  entries: ModuleType[] | undefined;
  totalEntries: number | undefined;
  totalPages: number | undefined;
  start: number | undefined;
  end: number | undefined;

  [key: string]: unknown;
}

/* —————————————————————————————————————————————————————————————————————————— */

export type MatcherKeyValTuple<Sources> = [
  keyof Sources,
  Sources[keyof Sources],
];

type ModuleParser = typeof parse;

type ModuleHandler<Sources, Input> = ({
  module,
}: {
  readonly module: GenericModule;
  readonly parse: ModuleParser;

  readonly source: keyof Sources;
  readonly glob: Sources[keyof Sources] | undefined;
}) => Input | Promise<Input>;

/* ·········································································· */

export interface GetFileProps<Sources, Input> {
  path: string;

  useCache?: boolean | undefined;
  log?: boolean | undefined;

  moduleHandler?: ModuleHandler<Sources, Input> | undefined;

  readonly source?: keyof Sources | undefined;
  readonly glob?: Sources[keyof Sources] | undefined;
}
export type GetFileReturn<ModuleType> = Promise<ModuleType>;

/* —————————————————————————————————————————————————————————————————————————— */

type ModulesListHandler<Input> =
  | (({
      modules,
    }: {
      modules: Input[];
    }) => Promise<Input[] | undefined> | Input[] | undefined)
  | undefined;

type Paginate =
  | {
      entriesCount: number;
      currentPageNumber: number | undefined;
    }
  | undefined
  | false;

/* ·········································································· */

export interface GetContentProps<Sources, Input>
  extends Omit<GetFileProps<Sources, Input>, 'path'> {
  sources: Required<Sources>;
  useFileCache?: boolean | undefined;

  modulesListHandler?: ModulesListHandler<Input> | undefined;

  paginate?: Paginate;
}
export type GetContentReturn<ModuleType> = Promise<ModulesEntries<ModuleType>>;

/* —————————————————————————————————————————————————————————————————————————— */
