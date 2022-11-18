import fs from 'fs/promises';
import path from 'node:path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsf from 'json-schema-faker';
import { faker } from '@faker-js/faker';
import yaml from 'yaml';
/* ========================================================================== */

export async function generateFakeContent(
  mdTemplatePath: string | undefined = undefined,
  outDir: string | undefined = undefined,
  count: number | undefined = 10,
) {
  let fileContent: string | undefined =
    mdTemplatePath && (await fs.readFile(mdTemplatePath, 'utf-8'));
  let schemaPath: string | undefined;

  fileContent = fileContent?.replaceAll(
    /---\n'\$schema': (.*)\n---\n\n/gi,
    (_, m) => {
      schemaPath = String(m);
      return '';
    },
  );
  if (outDir && schemaPath && fileContent) {
    const schema = await $RefParser.dereference(schemaPath);

    await fs.mkdir(outDir, { recursive: true });
    jsf.option({ useExamplesValue: true });

    await Promise.all(
      Array(count)
        .fill(0)
        .map(async (_) => {
          const generatedMarkdown = fileContent?.replaceAll(
            /```js:faker\n(.*)\n```/gi,
            (__, matched) => {
              const fake = String(
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                new Function('faker', `{ return ${String(matched)} }`)(faker),
              );
              return fake;
            },
          );
          if (!generatedMarkdown) {
            return;
          }
          const fakeFrontmatter = jsf.generate(schema, {});
          const options = {
            length: { min: 5, max: 7 },
            strategy: 'fail' as const,
          };
          const rWord = () => faker.word.noun(options);
          const fileName = `${rWord()}-${rWord()}-${rWord()}.md`;

          const body = `<!-- GENERATED CONTENT -->\n\n${generatedMarkdown}`;

          const content = `---\n${yaml.stringify(
            fakeFrontmatter,
          )}---\n\n${body}`;

          await fs.writeFile(path.join(outDir, fileName), content);
        }),
    );
  }
}
