// TODO: Refactor

/* eslint-disable max-lines */
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import mkdirp from 'mkdirp';
import yaml from 'yaml';
import randomWords from 'random-words';
import { sentenceCase } from 'change-case';
import jsf from 'json-schema-faker';
import { faker } from '@faker-js/faker';
import type { JSONSchema7 } from 'json-schema';
import fetch from 'node-fetch';
import Jabber from 'jabber';
/* ·········································································· */
import { apiBase } from './state';
import { log } from './logger';
/* —————————————————————————————————————————————————————————————————————————— */

const jabber = new Jabber();

export async function add(
  collectionOrSingletonName: string,
  singleName: string | null,
) {
  console.log({ collectionOrSingletonName, singleName });

  const base = `${apiBase}`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const userSchemas = await fetch(`${base}/schemas`)
    .then((r) => r.json())
    .catch((e) => {
      console.log('Dev. server not launched');
      console.log(e);
      process.exit();
    });

  console.log({ userSchemas });

  console.log({ collectionOrSingletonName, singleName });
  const baseDest = path.join(
    process.cwd(),
    'content',
    collectionOrSingletonName,
  );
  await mkdirp(baseDest).catch(() => null);

  let schemaFileName: string;
  if (collectionOrSingletonName && singleName) {
    schemaFileName = `${singleName}.schema.yaml`;
  } else {
    schemaFileName = `${collectionOrSingletonName}.schema.yaml`;
  }
  const schemaDest = path.join(baseDest, schemaFileName);

  console.log(schemaDest);

  const defaultSchema = await fs
    .readFile(path.join('content', 'default.schema.yaml'), 'utf-8')
    .then((r) => yaml.parse(r))
    .catch((e) => console.log(e));

  await fs.writeFile(schemaDest, yaml.stringify(defaultSchema));
  // }

  const entryDirName = randomWords(Math.floor(Math.random() * 3) + 1).join('-');
  const entryDest = path.join(baseDest, entryDirName);

  if (existsSync(entryDest)) {
    log('This entry already exist !');
    return;
  }
  await mkdirp(entryDest).catch(() => null);

  const schema = defaultSchema;

  const definitions = {};

  if (typeof schema.properties === 'object') {
    await Promise.all(
      Object.entries(schema.properties).map(
        async ([pKey, pProp]: [string, JSONSchema7]) => {
          console.log({ pKey, pProp });

          let isMarkdown = false;

          if (pProp?.allOf) {
            if (typeof pProp.allOf[0] === 'object') {
              if ('$ref' in pProp.allOf[0]) {
                console.log(pProp.allOf[0].$ref);
                isMarkdown = true;
                // FIXME
                delete pProp.allOf[0].$ref;
              }
            }
          }

          const allSchemas = { definitions, pProp };
          const fakeProp = await jsf.resolve(allSchemas);

          if (fakeProp) {
            if (typeof fakeProp?.pProp === 'object') {
              const prop = fakeProp.pProp;
              if (isMarkdown) {
                const rdmTitle = sentenceCase(randomWords(5).join(' '));
                const rdmBody =
                  `${faker.hacker.phrase()}\n\n` +
                  `${faker.lorem.paragraphs(3).replace(/\. /gi, '.  \n')}\n\n` +
                  `## ${faker.hacker.phrase()}\n\n` +
                  `- ${faker.hacker.phrase()}\n` +
                  `- ${faker.hacker.phrase()}\n` +
                  `- ${faker.hacker.phrase()}\n\n` +
                  `${jabber.createParagraph(50).replace(/\n/gi, '\n\n')}`;

                let baseFrontmatter = '';
                if (fakeProp.pProp.frontmatter) {
                  baseFrontmatter = `---\n${yaml.stringify(
                    fakeProp.pProp.frontmatter,
                  )}---\n\n`;
                }
                const baseMarkdown = `# ${rdmTitle}\n\n${rdmBody}…`;
                const mdFileContent = `${baseFrontmatter}${baseMarkdown}\n`;

                await fs.writeFile(
                  path.join(entryDest, `${pKey}.md`),
                  mdFileContent,
                );
              } else {
                await fs.writeFile(
                  path.join(entryDest, `${pKey}.yaml`),
                  yaml.stringify(prop),
                );
              }
            }
          }

          console.log({ fakeProp });
          return;
        },
      ),
    );
  }
}
