export type GenericFrontmatter = Record<string, unknown>;

export interface Module {
  file: string;
  frontmatter: GenericFrontmatter;
  content: string;
  relationsCount?: number | undefined;
}

export interface ModuleCollection {
  entries: Module[] | undefined;
  totalEntries: number | undefined;
  totalPages: number | undefined;
  start: number | undefined;
  end: number | undefined;
}

export type Transform = (markdown: string) => string;

export type Filters =
  | Record<string, string | undefined | false>
  | undefined
  | false;
export interface GetContentProps {
  globPath: string;
  paginate?:
    | {
        entriesCount: number;
        currentPageNumber?: number | undefined;
      }
    | undefined
    | false;
  sortBy?: string | undefined | false;
  filters?: Filters;
  tag?: string | undefined | false;
  transforms?: Transform[] | undefined;
}
