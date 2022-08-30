export interface UserConfig {
  server: {
    /** **Default**: `'localhost'` */
    host: string;
    /** **Default**: `5010` */
    port: number;
  };
  helpers: {
    /** **Default**: `'./.ccomp/helpers'` */
    dest: string;
  };
  components: {
    /** **Default**: `'./content'` */
    src: string;
    /** **Default**: `'./.ccomp/build/content'` */
    dest: string;
  };
  errors: {
    /** **Default**: `'./errors'` */
    dest: string;
  };
  dev: {
    /** **Default**: `'./.ccomp/.timestamp.json'` */
    triggerFile: string;
  };
  vscode: {
    /** **Default**: `'./.vscode'` */
    dest: string;
  };
  types: {
    /** **Default**: `'./.ccomp/types'` */
    dest: string;
  };
  markdown: {
    /**
     * **Default**: `{ rewrite(node) {} }`
     *
     * See https://github.com/jaywcjlove/rehype-rewrite
     * */
    remarkPlugins: [];
  };
  fake: {
    /** **Default**: `1200` */
    entriesCount: number;
  };
  remote: {
    /** **Default**: `null` */
    dest?: string | null;
  };
  log: {
    verbose: boolean;
  };
  previewUrl: string;
}
