/* eslint-disable no-param-reassign */
import type { RehypeRewriteOptions } from 'rehype-rewrite';

const rewriteOptions: RehypeRewriteOptions = {
  rewrite(node) {
    // Some DOM manipulation example
    if (node.type === 'element' && node.tagName === 'p') {
      node.tagName = 'strong';
    }
  },
};

const configuration = {
  helpers: {
    dest: './demo/.build/helpers',
  },
  components: {
    src: './content',
    dest: './demo/.build/content',
  },
  markdown: {
    rewriteOptions,
  },
  vscode: {
    dest: './demo/.build/schemas/vscode',
  },
  types: {
    dest: './demo/.build/types',
  },
};

export default configuration;
