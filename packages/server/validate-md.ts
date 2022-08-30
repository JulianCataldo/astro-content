import { unified } from 'unified';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import rlFmSchema from '@julian_cataldo/remark-lint-frontmatter-schema';
import retextCasePolice from '@julian_cataldo/retext-case-police/index';
import retextStringify from 'retext-stringify';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import retextEnglish from 'retext-english';
import retextProfanities from 'retext-profanities';
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
  console.log({ content, schema });

  const lintingAndSchema = await remark()
    .use(remarkFrontmatter)
    .use(rlFmSchema, {
      embed: schema,
    })
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

  const naturalLanguage = await unified()
    .use(retextEnglish)
    .use(retextProfanities)
    .use(retextStringify)
    .use(retextCasePolice)
    .process(content);

  return {
    schema: schemaErrs,
    lint,
    prose: naturalLanguage.messages,
  };
}
