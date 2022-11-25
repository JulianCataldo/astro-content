// @ts-expect-error

export type GenericFrontmatter = Record<string, unknown>;
export type GenericData = unknown[] | GenericFrontmatter;

export interface Module<T> {
  path: string;
  normalizedPath: string;
  fileType: string;
  fileBaseName: string;
  directory: string;

  data: T | undefined;
  body: string | undefined;

  [key: string]: unknown;
}

export interface ModulesEntries<T> {
  entries: Module<T>[] | undefined;
  totalEntries: number | undefined;
  totalPages: number | undefined;
  start: number | undefined;
  end: number | undefined;
  [key: string]: unknown;
}

export type MarkdownTransformer = ({ body }: { body: string }) => string;

export type Filters = Record<string, string | undefined | false> | undefined;

export interface GetFileProps<Validator> {
  path: string;
  dataValidator?: Validator | undefined;
  markdownTransformers?: MarkdownTransformer[] | undefined;
  useCache?: boolean | undefined;
  log?: boolean | undefined;

  matcherGlob: any;
  matcherName: any;
}

export interface GetContentProps<
  Sources,
  Validator,
  ValFn extends (...args: any) => any,
  ValReturn = Module<Awaited<ReturnType<ValFn>>>,
> extends Omit<
    GetFileProps<Validator>,
    'path' | 'matcherGlob' | 'matcherName'
  > {
  sources: Required<Sources>;

  useFileCache?: boolean | undefined;

  modulesHandler?: ({
    modules,
  }: {
    modules: ValReturn[];
  }) => ValReturn[] | Promise<ValReturn[]>;

  paginate?:
    | {
        entriesCount: number;
        currentPageNumber?: number | undefined;
      }
    | undefined
    | false;

  limit?: number | undefined;
}

export interface ValArgs<Sources> {
  data: unknown;
  path: string;
  pathParts: string[];
  matcherName: keyof Sources | undefined;
  matcherGlob: Sources[keyof Sources] | undefined;
}
export type ValFn<Sources> = (args: ValArgs<Sources>) => any;
