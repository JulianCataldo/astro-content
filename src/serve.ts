import chalk from 'chalk';
import express from 'express';
import path from 'node:path';
import glob from 'glob-promise';
import * as fs from 'node:fs/promises';
import { set } from 'lodash-es';
/* ·········································································· */
import state from './state';
import { conf } from './config';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function serve() {
  const app = express();

  app.use('/schemas', (req, res) => {
    res.status(200).send(state.schemas);
  });

  app.use('/errors', (req, res) => {
    res.status(200).send(state.errors);
  });

  app.use('*', async (req, res) => {
    $log(`Access url: ${req.baseUrl}`);
    // FIXME:
    const basePath = path.join(process.cwd(), '.ccomp/build');
    const thePath = path.join(basePath, req.baseUrl);
    const pattern = `${thePath}/**/*.json`;
    const files = await glob(pattern);

    const data = {};

    // TODO: alphanum. sorting
    await Promise.all(
      files.map(async (file) => {
        const relPath = path.relative(thePath, file);

        const parts = relPath.split('/');
        parts[parts.length - 1] = parts[parts.length - 1].replace('.json', '');
        const objPath = parts.join('.');
        const fileData = JSON.parse(await fs.readFile(file, 'utf-8'));
        set(data, objPath, fileData);
      }),
    );
    // console.log({ files, data });
    res.status(200).type('application/json').send(data);
  });

  app.listen(conf.server.port, conf.server.host, () => {
    // http://${conf.server.host}:${conf.server.port}/ui
    console.log(
      `\n\n📑  Content-Components - Server\n\nReady at:\n${chalk.green(
        `http://${conf.server.host}:${conf.server.port}/v1\n` +
          `http://${conf.server.host}:${conf.server.port}/schemas\n` +
          `———————————————————————————————————\n`,
      )}`,
    );
  });
}
