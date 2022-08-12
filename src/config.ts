// /* eslint-disable no-param-reassign */
import chalk from 'chalk';
import mkdirp from 'mkdirp';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { RehypeRewriteOptions } from 'rehype-rewrite';
import ts from 'typescript';
import { CcConfig } from '../types/config';
// /* —————————————————————————————————————————————————————————————————————————— */

const rewriteOptions: RehypeRewriteOptions = {
  rewrite(/* node */) {
    // Some DOM manipulation example
    // if (node.type === 'element' && node.tagName === 'p') {
    //   node.tagName = 'strong';
    // }
  },
};

let userConfig: CcConfig;

const ccompPath = './.ccomp';

const conf: CcConfig = {
  get server() {
    return {
      host: userConfig?.server?.host || 'localhost',
      port: userConfig?.server?.port || 5010,
    };
  },
  get helpers() {
    return { dest: userConfig?.helpers?.dest || `${ccompPath}/helpers` };
  },
  get components() {
    return {
      src: userConfig?.components?.src || './content',
      dest: userConfig?.components?.dest || `${ccompPath}/build/content`,
    };
  },
  get errors() {
    return { dest: userConfig?.errors?.dest || './errors' };
  },
  get dev() {
    return {
      triggerFile:
        userConfig?.dev?.triggerFile || `${ccompPath}/.timestamp.json`,
    };
  },
  get vscode() {
    return { dest: userConfig?.vscode?.dest || `${ccompPath}/schemas/vscode` };
  },
  get types() {
    return { dest: userConfig?.types?.dest || `${ccompPath}/types` };
  },
  get markdown() {
    return {
      rewriteOptions: userConfig?.markdown?.rewriteOptions || rewriteOptions,
    };
  },
  get fake() {
    return {
      entriesCount: userConfig?.fake?.entriesCount || 1200,
    };
  },
  get remote() {
    return {
      dest: userConfig?.remote?.dest || null,
    };
  },
};

async function loadConfig() {
  // TODO: dynamic reloading of config thanks to a watcher
  // eslint-disable-next-line no-console
  console.log('Loading user config…');

  const source = await fs
    .readFile(path.join(process.cwd(), './cc-config.ts'), 'utf-8')
    .then((file) => file)
    .catch(() => null);

  if (source) {
    // eslint-disable-next-line no-console
    console.log(chalk.cyan('User TS configuration detected'));

    const jsCompiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    });
    const confJsDir = path.join(process.cwd(), ccompPath);
    const confJsPath = path.join(confJsDir, 'conf.mjs');

    await mkdirp(confJsDir);
    await fs.writeFile(confJsPath, jsCompiled.outputText);

    userConfig = await import(confJsPath)
      .then((module) => module.default)
      .catch(() => null);
  }
}

export { loadConfig, conf };
