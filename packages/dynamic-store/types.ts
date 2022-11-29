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

  language: string;
  original: string;
}

export interface Module<Discriminator, DataType> {
  readonly path: Readonly<Path>;

  data: DataType;
  body: string | undefined;

  from: Discriminator | undefined;

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

type ModuleParser = typeof parse;

type ModuleHandler<From, Glob, Input> = ({
  module,
}: {
  readonly module: GenericModule;
  readonly parse: ModuleParser;

  readonly from: From;
  readonly glob: Glob;
}) => Input | Promise<Input>;

/* ·········································································· */

export interface GetFileProps<Input, UniquePath, From, Glob> {
  baseDir?: string | undefined;
  path: UniquePath;

  useCache?: boolean | undefined;
  log?: boolean | undefined;

  moduleHandler?: ModuleHandler<From, Glob, Input> | undefined;

  readonly from?: From | undefined;
  readonly glob?: Glob | undefined;
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

export interface GetContentProps<Sources, Input, From, Glob>
  extends Omit<GetFileProps<Input, undefined, From, Glob>, 'path'> {
  sources: Required<Sources>;
  useFileCache?: boolean | undefined;

  modulesListHandler?: ModulesListHandler<Input> | undefined;

  paginate?: Paginate;
}
export type GetContentReturn<ModuleType> = Promise<ModulesEntries<ModuleType>>;

/* —————————————————————————————————————————————————————————————————————————— */
