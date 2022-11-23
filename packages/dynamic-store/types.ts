// @ts-ignore

export type GenericFrontmatter = Record<string, unknown>;
export type GenericData = [] | GenericFrontmatter;

export interface Module<T> {
  path: string | undefined;
  data: T | undefined;
  body: string | undefined;
  relationsCount?: number | undefined;
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
}

export interface GetContentProps<
  Validator,
  ValFn extends (...args: any) => any,
  ValReturn = Module<Awaited<ReturnType<ValFn>>>,
> extends Omit<GetFileProps<Validator>, 'path'> {
  glob: string;

  modulesProcessor?: ({
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
}

export interface ValArgs {
  data: unknown;
  path: string;
}
export type ValFn = (args: ValArgs) => any;
