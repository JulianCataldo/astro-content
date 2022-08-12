import remarkFrontmatter from 'remark-frontmatter';
import remarkLintFrontmatterSchema from '@julian_cataldo/remark-lint-frontmatter-schema';

import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
/* —————————————————————————————————————————————————————————————————————————— */

const remarkConfig = {
  plugins: [
    remarkPresetLintRecommended,
    remarkPresetLintMarkdownStyleGuide,
    remarkPresetLintConsistent,
    remarkFrontmatter,
    [
      remarkLintFrontmatterSchema,
      {
        schemas: {
          './.ccomp/schemas/vscode/articles-main.schema.yaml': [
            'content/articles/*/main.md',
          ],
        },
      },
    ],
  ],
};

export default remarkConfig;
