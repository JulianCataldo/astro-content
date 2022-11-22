// @ts-ignore

export interface Ufm {
  frontmatter: unknown;
}
export type GenericFrontmatter = Record<string, unknown>;

export interface Module<T> {
  filePath: string | undefined;
  frontmatter: T | undefined;
  content: string | undefined;
  relationsCount?: number | undefined;
  [key: string]: unknown;
}

export interface ModuleCollection<T> {
  entries: Module<T>[] | undefined;
  totalEntries: number | undefined;
  totalPages: number | undefined;
  start: number | undefined;
  end: number | undefined;
  [key: string]: unknown;
}

export type MarkdownTransformer = ({
  markdown,
}: {
  markdown: string;
}) => string;

export type Filters = Record<string, string | undefined | false> | undefined;

export interface GetFileProps<Validator> {
  filePath: string;
  frontmatterValidator?: Validator | undefined;
  markdownTransformers?: MarkdownTransformer[] | undefined;
  useCache?: boolean | undefined;
}

export interface GetContentProps<
  Validator,
  SortKeys extends (...args: any) => any,
> extends Omit<GetFileProps<Validator>, 'filePath'> {
  globPath: string;
  paginate?:
    | {
        entriesCount: number;
        currentPageNumber?: number | undefined;
      }
    | undefined
    | false;
  sortBy?: keyof Awaited<ReturnType<SortKeys>> | undefined;
  order?: 'ascending' | 'descending' | undefined;
  filters?: Filters;
  tag?: string | undefined;
  limit?: number | undefined;
}
