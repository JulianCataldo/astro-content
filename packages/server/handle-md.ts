// import { unified } from 'unified';
// import remarkParse from 'remark-parse';
// import yaml from 'yaml';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import rlFmSchema from '@julian_cataldo/remark-lint-frontmatter-schema';
import retextCasePolice from '@julian_cataldo/retext-case-police';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
/* ·········································································· */
import remarkMdx from 'remark-mdx';
import remarkRetext from 'remark-retext';
import remarkGfm from 'remark-gfm';
import retextStringify from 'retext-stringify';
import { Parser } from 'retext-english';
import retextRepeatedWords from 'retext-repeated-words';
import retextReadability from 'retext-readability';
import { visit } from 'unist-util-visit';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
/* ·········································································· */
/* NOTE: TOO HEAVY */
// import dictionary from 'dictionary-en';
// import retextSpell from 'retext-spell';
/* NOTE: Not working */
// import retextSentenceSpacing from 'retext-sentence-spacing';
// import retextOveruse from 'retext-overuse';
/* ·········································································· */
import type { JSONSchema7 } from 'json-schema';

// import type { FrontmatterSchemaMessage } from '@julian_cataldo/remark-lint-frontmatter-schema';
import type {
  ErrorLint,
  MdErrorSchema,
  PropertyReport,
  ReportFootnote,
  ReportLink,
} from '@astro-content/types/reports';
/* ·········································································· */
import type { FrontmatterSchemaMessage } from '@julian_cataldo/remark-lint-frontmatter-schema';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function handleMd(
  content: string,
  schema?: JSONSchema7,
  mdx = false,
) {
  // let frontmatterSchema: JSONSchema7 = {};
  // if (
  //   schema?.allOf?.length &&
  //   typeof schema.allOf[1] === 'object' &&
  //   typeof schema.allOf[1].properties?.frontmatter === 'object'
  // ) {
  //   frontmatterSchema = schema.allOf[1].properties.frontmatter;
  // }
  log('Validate MD', 'debug', 'pretty');

  const footnotes: ReportFootnote = {
    references: [],
    definitions: [],
  };
  const links: ReportLink[] = [];
  const lint: ErrorLint[] = [];
  const schemaErrs: MdErrorSchema[] = [];

  const lintingAndSchema = await remark()
    .use(remarkFrontmatter)
    .use(rlFmSchema, { embed: schema })
    .use(mdx ? remarkMdx : () => (tree) => tree)
    .use(remarkGfm)
    // TODO: extract "validate" to general "handle"?
    .use(() => (tree, file) => {
      log({ data: file }, 'absurd');
      visit(
        tree,
        ['footnoteDefinition', 'footnoteReference', 'link'],
        (node) => {
          if (node.type === 'link') {
            log(node, 'absurd');

            // FIXME: weird typings shifting in IDE
            // @ts-ignore
            const html = toHtml(toHast(node.children[0]));
            links.push({
              url: node.url,
              position: node.position,
              html,
              title: node.title,
            });
          } else if (node.type === 'footnoteDefinition') {
            log({ value: node, level: 'absurd' });

            let html = '';
            if (node.children.length) {
              // FIXME: weird typings shifting in IDE
              // @ts-ignore
              html = toHtml(toHast(node.children[0]));
            }

            footnotes.definitions.push({
              position: node.position,
              label: node.label,
              html,
              // id,
            });
          } else if (node.type === 'footnoteReference') {
            log(node, 'absurd');

            footnotes.references.push({
              position: node.position,
              label: node.label,
              // html: 'HTML',
              // id,
            });
          }
        },
      );
    })
    .use(remarkPresetLintRecommended)
    .use(remarkPresetLintMarkdownStyleGuide)
    .use(remarkPresetLintConsistent)
    .process(content);

  log({ lintingAndSchema }, 'absurd');

  lintingAndSchema.messages.forEach((error) => {
    if (error.ruleId === 'frontmatter-schema') {
      const rlFlSchemaError = error as FrontmatterSchemaMessage;
      const schemaErr = rlFlSchemaError.schema as MdErrorSchema;

      schemaErr.position = rlFlSchemaError.position;
      log(error);

      schemaErrs.push(schemaErr);
    } else {
      lint.push(error);
    }
  });

  const naturalLanguage = await remark()
    .use(remarkFrontmatter)
    .use(mdx ? remarkMdx : () => (tree) => tree)
    .use(remarkRetext, Parser)
    .use(retextCasePolice, { ignore: ['HTTPS', 'HTTP'] })
    .use(retextReadability, { age: 26 })
    .use(retextRepeatedWords)
    // .use(retextSpell, dictionary)
    .use(retextStringify)
    .process(content);

  log({ lint }, 'absurd');
  log({ links });

  const Report: PropertyReport = {
    schema: schemaErrs,
    lint,
    prose: naturalLanguage.messages,
    footnotes,
    links,
  };

  return Report;
}
