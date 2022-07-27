import * as fs from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import remarkRewrite from 'rehype-rewrite';

import config from '../config';

export default async function mdToHtml(path: string) {
  const content = await fs.readFile(path, 'utf-8');

  const output = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkRewrite, config.markdown.rewriteOptions)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(content);

  return String(output);
}
