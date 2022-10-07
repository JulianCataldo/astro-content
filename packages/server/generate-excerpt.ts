// NOTE: WORK IN PROGRESS

import { remark } from 'remark';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
// import { visit } from 'unist-util-visit';
/* ·········································································· */
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

// TODO: Fallback for comment-defined excerpt splitting
// From: https://github.com/manovotny/remark-excerpt
//
// const isComment = new RegExp('<!--(.*?)-->');
// const getComment = new RegExp('<!--([\\s\\S]*?)-->');
// const remarkExcerpt = (options = {}) => {
//   const transformer = (tree) => {
//     const excerpts =
//       options.identifier && options.identifier.length
//         ? [options.identifier]
//         : ['excerpt', 'more', 'preview', 'teaser'];

//     let excerptIndex = -1;

//     visit(tree, 'html', (node) => {
//       if (excerptIndex === -1 && isComment.test(node.value)) {
//         const comment = getComment.exec(node.value);

//         if (comment) {
//           const text = comment[1].trim();

//           if (excerpts.includes(text)) {
//             excerptIndex = tree.children.indexOf(node);
//           }
//         }
//       }
//     });

//     if (excerptIndex > -1) {
//       tree.children.splice(excerptIndex);
//     }
//   };

//   return transformer;
// };

export default async function generateExcerpt(raw: string) {
  // FIXME: Using an hard substring for now, could generate unwanted results
  const mdLiteral = await remark()
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(raw);

  // FIXME: Doubling pipeline for now (preserve HTML)
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeStringify)
    .process(String(mdLiteral.value).substring(0, 350));

  log(result, 'absurd');

  return { html: String(result.value) };
}
