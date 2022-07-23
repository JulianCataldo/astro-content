import * as fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import remarkRewrite from 'rehype-rewrite';
import { reporter } from 'vfile-reporter';
import mkdirp from 'mkdirp';
import type { ContentComponent } from '../types';
import config from '../config';

async function mdToHtml(component: ContentComponent) {
  console.log('GoGOGOG');

  // TODO: `Promise.all` this in `load-files.ts` ———v
  const content = await fs.readFile(component.path, 'utf-8');

  const output = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkRewrite, config.markdown.rewriteOptions)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(content);
  console.log(reporter(output));
  console.log(String(output));

  const directory = `${config.components.dest}/${component.collection}/${component.name}`;
  await mkdirp(directory);
  const destination = `${directory}/${component.role}.html`;

  await fs.writeFile(destination, String(output));
}

async function yamlToJson(component: ContentComponent) {
  console.log('JSON');

  // TODO: `Promise.all` this in `load-files.ts` ———v
  const content = await fs.readFile(component.path, 'utf-8');
  const jsObject = yaml.load(content);

  const comp = `${component.collection}/${component.name}`;
  const directory = `${config.components.dest}/${comp}`;
  await mkdirp(directory);
  const destination = `${directory}/${component.role}.json`;

  await fs.writeFile(destination, JSON.stringify(jsObject, null, 2));
}

export default async function transform(contentComponents: ContentComponent[]) {
  contentComponents.forEach((component) => {
    console.log(component);
    switch (component.type) {
      case 'markdown':
        mdToHtml(component);
        break;
      case 'yaml':
        console.log('json');
        yamlToJson(component);
        break;
      default:
    }
  });
}
