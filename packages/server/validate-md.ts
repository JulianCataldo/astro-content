// import { unified } from 'unified';
// import remarkParse from 'remark-parse';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import rlFmSchema from '@julian_cataldo/remark-lint-frontmatter-schema';
// FIXME: Module "file:///home/runner/work/astro-content/astro-content/node_modules/.pnpm/case-police@0.5.9/node_modules/case-police/dict/abbreviates.json" needs an import assertion of type "json"
import retextCasePolice from '@julian_cataldo/retext-case-police';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
/* ·········································································· */
import remarkRetext from 'remark-retext';
import retextStringify from 'retext-stringify';
import { Parser } from 'retext-english';
// import retextProfanities from 'retext-profanities';
import retextRepeatedWords from 'retext-repeated-words';
import retextReadability from 'retext-readability';
/* ·········································································· */
/* NOTE: TOO HEAVY */
// import dictionary from 'dictionary-en';
// import retextSpell from 'retext-spell';
/* NOTE: Not working */
// import retextSentenceSpacing from 'retext-sentence-spacing';
// import retextOveruse from 'retext-overuse';
/* ·········································································· */
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
// import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function validateMd(
  // mdPath: string,
  content: string,
  schema?: JSONSchema7,
) {
  const lintingAndSchema = await remark()
    .use(remarkFrontmatter)
    .use(rlFmSchema, { embed: schema })
    .use(remarkPresetLintRecommended)
    .use(remarkPresetLintMarkdownStyleGuide)
    .use(remarkPresetLintConsistent)
    .process(content);

  const lint = [];
  const schemaErrs = [];

  lintingAndSchema.messages.forEach((error) => {
    if (error.ruleId === 'frontmatter-schema') {
      schemaErrs.push(error);
    } else {
      lint.push(error);
    }
  });

  const naturalLanguage = await remark()
    .use(remarkFrontmatter)
    .use(remarkRetext, Parser)
    // .use(retextProfanities)
    .use(retextCasePolice)
    .use(retextReadability, { age: 26 })
    .use(retextRepeatedWords)
    // .use(retextSpell, dictionary)
    .use(retextStringify)
    .process(content);

  return {
    schema: schemaErrs,
    lint,
    prose: naturalLanguage.messages,
  };
}
