#! /usr/bin/env node --no-warnings

/* eslint-disable import/no-relative-packages */
// TODO: Refactor
import { program } from 'commander';
import inquirer from 'inquirer';
import pkg from './package.json' assert { type: 'json' };
/* ·········································································· */

// IDEA: Force embedding in dist. with Parcel?
/* `bin` is forwarded from `/packages/integration/package.json`,
   so we're using sub `node_modules` import  */
import add from './node_modules/@astro-content/server/create-entity';
import {
  // setupRemark,
  setupContentBase,
  setupUnifiedVsCode,
  isValidContentBase,
} from './node_modules/@astro-content/server/setup';

/* —————————————————————————————————————————————————————————————————————————— */

// eslint-disable-next-line no-console
console.log(`Astro Content — CLI — ${pkg.version}\n`);

const addHelp = `
Usage examples

pnpm content add zebras zebra
=> New entity "zebras" with the singular name of "zebra"

Note: An entity act as collection of entries or singletons
Entry have common schema, singletons have their own schemas
It's up to user to decorrelate singletons in their schema

pnpm content add zebras doody
=> Add a "zebra" entry with an unique name "doody" in "zebras" entity
`;

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
  contentFilesExist: isValidContentBase(),
};

// console.log({ contentInfos });

program
  .command('setup')
  .description('Setup Astro Content for your project')
  .action(async (str: string, options: string) => {
    // const limit = options.first ? 1 : undefined;
    // console.log({ str, options });
    // console.log(str.split(options.separator, limit));
    const response = await inquirer.prompt({
      type: 'checkbox',
      name: 'installations',
      message: 'Choose setup(s):',
      choices: [
        new inquirer.Separator('\n Adds `./content` folder + default schema'),
        {
          name: 'Minimal content base',
          value: 'content-base',
          checked: !contentInfos.contentFilesExist,
          disabled: contentInfos.contentFilesExist && 'already exist',
          // description: ,
        },
        // new inquirer.Separator('Adds `remark` + CLI + base configuration'),
        // {
        //   name: 'Markdown linter: CLI',
        //   value: 'remark',
        //   checked: true,
        //   disabled: false,
        // },
        // new inquirer.Separator('Adds `unified` VS Code extension for `remark`'),
        // {
        //   name: 'Markdown linter: IDE',
        //   value: 'unified-vscode',
        //   checked: true,
        //   disabled: false,
        // },
        // TODO: `yaml-language-server` bridge. Or make it available in integration options
        // TODO: retext (not used with remark ide/cli because it breaks some stuff)
      ],
    });
    // console.log({ response });
    if (response.installations.some((i) => i === 'content-base')) {
      // console.log('add');
      await setupContentBase();
    }
    if (response.installations.some((i) => i === 'unified-vscode')) {
      // console.log('add');
      await setupUnifiedVsCode();
    }
  });

program.parse();
