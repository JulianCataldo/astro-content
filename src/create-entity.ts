import * as fs from 'node:fs/promises';
import path from 'node:path';
import mkdirp from 'mkdirp';
import yaml from 'yaml';
import randomWords from 'random-words';
/* ·········································································· */
import { conf } from './config';
// import state from './state';
import { JSONSchema } from 'json-schema-to-typescript';
import { pascalCase, sentenceCase } from 'change-case';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function createEntity(
  collectionOrSingletonName: string,
  singleName: string,
) {
  console.log({ collectionOrSingletonName, singleName });
  const baseDest = path.join(
    process.cwd(),
    conf.components.src,
    collectionOrSingletonName,
  );
  await mkdirp(baseDest).catch(() => null);

  let schemaDest: string;

  let schemaFileName: string;
  if (collectionOrSingletonName && singleName) {
    schemaFileName = `${singleName}.schema.yaml`;
  } else {
    schemaFileName = `${collectionOrSingletonName}.schema.yaml`;
  }
  schemaDest = path.join(baseDest, schemaFileName);

  console.log(schemaDest);

  const schemaContent: JSONSchema = {
    type: 'object',
    title: pascalCase(singleName || collectionOrSingletonName),
    properties: {
      meta: {
        type: 'object',
        properties: {
          baz: { type: 'string' },
          foo: { type: 'string', enum: ['bar', 'moz', 'das'] },
        },
        required: ['foo'],
      },
      content: {
        type: 'object',
        title: 'Content',
        description: 'Markdown content of this entry,\nwith frontmatter',
        properties: {
          frontmatter: {
            type: 'object',
            properties: {
              title: {
                description: 'Entry title',
                type: 'string',
              },
            },
            required: ['title'],
          },
          body: {
            type: 'string',
          },
        },
        required: ['frontmatter', 'body'],
      },
    },
  };
  await fs.writeFile(schemaDest, yaml.stringify(schemaContent));

  const rdmMainTitle = sentenceCase(randomWords(5).join(' '));
  const baseFrontmatter = yaml.stringify({ title: rdmMainTitle });

  const rdmTitle = sentenceCase(randomWords(5).join(' '));
  const rdmBody = sentenceCase(randomWords(10).join(' '));

  const baseMarkdown = `# ${rdmTitle}\n\n${rdmBody}…`;
  const baseMdFileContent = `---\n${baseFrontmatter}---\n\n${baseMarkdown}\n`;

  const baseMeta = yaml.stringify({ baz: 'mea', foo: 'das' });

  const rdmFileName = randomWords(Math.floor(Math.random() * 3) + 1).join('-');
  const firstEntryDest = path.join(baseDest, rdmFileName);

  await mkdirp(firstEntryDest).catch(() => null);
  await fs.writeFile(path.join(firstEntryDest, 'body.md'), baseMdFileContent);
  await fs.writeFile(path.join(firstEntryDest, 'meta.yaml'), baseMeta);
}
