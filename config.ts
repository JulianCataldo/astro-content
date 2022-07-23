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
  components: {
    src: './content',
    dest: './demo/content',
  },
  markdown: {
    rewriteOptions,
  },
  schemas: {
    dest: './demo/types',
  },
};

export default configuration;
