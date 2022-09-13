#! /usr/bin/env node --no-warnings

// NOTE: WORK IN PROGRESS
/* `bin` is forwarded from `/packages/integration/package.json`,
   so we're using sub `node_modules` import  */

import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs/promises';
/* —————————————————————————————————————————————————————————————————————————— */
import { add } from '@astro-content/server/add';
import * as setup from '@astro-content/server/setup';
// NOTE: `.js` extensions are needed with CLI, why?
import { addHelp } from './help.js';
/* —————————————————————————————————————————————————————————————————————————— */

const pkg = await fs
  .readFile('./package.json', 'utf-8')
  .then((r) => JSON.parse(r) as { version: string })
  .catch(() => ({ version: '' }));

// eslint-disable-next-line no-console
console.log(`Astro Content — CLI — ${pkg.version}\n`);

/* ·········································································· */

program
  .command('add')
  .description('Create an new entity or add an entry to existing one')
  .argument('<entity>', 'Entity')
  .argument('<entry>', 'Entry singular name')
  .addHelpText('after', addHelp)
  // .option('--first', 'display just the first substring')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(async (str: string, options: string) => {
    // const limit = options.first ? 1 : undefined;
    // console.log(str.split(options.separator, limit));
    // console.log({ str, options });
    await add(str, options);
  });

const contentInfos = {
  contentFilesExist: setup.isValidContentBase(),
};
/* —————————————————————————————————————————————————————————————————————————— */
program
  .command('setup')
  .description('Setup Astro Content for your project')
  .action(async () => {
    const response = await inquirer.prompt<{ installations: string[] }>({
      type: 'checkbox',
      name: 'installations',
      message: 'Choose setup(s):',
      choices: [
        /* —————————————————————————————————————————————————————————————————— */
        new inquirer.Separator('\n Adds `./content` folder + default schema'),
        {
          name: 'Minimal content base',
          value: 'content-base',
          checked: !contentInfos.contentFilesExist,
          disabled: contentInfos.contentFilesExist && 'already exist',
          // description: '',
        },
        /* —————————————————————————————————————————————————————————————————— */
        // new inquirer.Separator('Adds `remark` + CLI + base configuration'),
        // {
        //   name: 'Markdown linter: CLI',
        //   value: 'remark-lint',
        //   checked: true,
        //   disabled: false,
        // },
        /* —————————————————————————————————————————————————————————————————— */
        // new inquirer.Separator('Adds `unified` VS Code extension for `remark`'),
        // {
        //   name: 'Markdown linter: IDE (VS Code ext.)',
        //   value: 'unified-vscode',
        //   checked: true,
        //   disabled: false,
        // },
        /* —————————————————————————————————————————————————————————————————— */
        // TODO: `yaml-language-server` bridge. Or make it available in integration options
        // TODO: retext (not used with remark ide/cli because it breaks some stuff)
      ],
    });

    if (response.installations.some((i) => i === 'content-base')) {
      await setup.contentBase();
    }
    // if (response.installations.some((i) => i === 'unified-vscode')) {
    //   await setup.unifiedVsCode();
    // }
    // if (response.installations.some((i) => i === 'remark-lint')) {
    //   await setup.remarkLint();
    // }
    // if (response.installations.some((i) => i === 'yaml-vscode')) {
    // }
  });

program.parse();
