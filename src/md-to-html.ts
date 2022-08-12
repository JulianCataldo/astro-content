import * as fs from 'node:fs/promises';
import chalk from 'chalk';
import yaml from 'yaml';
/* ·········································································· */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeFormat from 'rehype-format';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import rlFmSchema from '@julian_cataldo/remark-lint-frontmatter-schema';
import remarkDirective from 'remark-directive';
/* ·········································································· */
import { reporter } from 'vfile-reporter';
import { h } from 'hastscript';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
/* ·········································································· */
import { $log } from './utils';
// import state from './state.js';
/* —————————————————————————————————————————————————————————————————————————— */

const directiveToNonStandardComponent: Plugin<[], Root> = () => (tree) =>
  visit(tree, (node: Node) => {
    if (
      node.type === 'textDirective' ||
      node.type === 'leafDirective' ||
      node.type === 'containerDirective'
    ) {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes);

        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      }
    }
  });

// FIXME: this function is called too many times
export default async function mdToHtml(path: string, schema) {
  const content = await fs.readFile(path, 'utf-8');

  let frontmatter;

  const output = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(directiveToNonStandardComponent)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(rlFmSchema, {
      embed: schema,
    })
    .use(() => (tree) => {
      if (tree.children[0].type === 'yaml') {
        frontmatter = yaml.parse(tree.children[0].value);
      }
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeFormat)

    .process(content);

  $log(
    `${chalk.bgCyanBright('Markdown')}(${chalk.green(
      'transform',
    )}): ${chalk.yellow(path)}`,
  );

  output.cwd = path;
  output.path = path;
  $log(`\n${reporter([output])}\n`);

  return { frontmatter, body: String(output) };
}
