import type { RehypeRewriteOptions } from 'rehype-rewrite';

export interface CcConfig {
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
    rewriteOptions: RehypeRewriteOptions;
  };
  fake: {
    /** **Default**: `1200` */
    entriesCount: number;
  };
  remote: {
    /** **Default**: `null` */
    dest: string;
  };
}
