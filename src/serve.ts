import chalk from 'chalk';
import express from 'express';
import path from 'node:path';
import glob from 'glob-promise';
import * as fs from 'node:fs/promises';
import { kebabCase, set } from 'lodash-es';
/* ·········································································· */
import state from './state';
import { conf } from './config';
import { $log } from './utils';
import { camelCase } from 'change-case';
import { existsSync } from 'node:fs';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function serve() {
  const app = express();

  app.use('/schemas', (req, res) => {
    res.status(200).send(state.schemas);
  });

  app.use('/errors', (req, res) => {
    res.status(200).send(state.errors);
  });

  app.use('**/*.{jpg,jpeg,png}', async (req, res) => {
    const filePath = path.join(process.cwd(), req.baseUrl);
    console.log({ filePath });
    if (existsSync(filePath)) {
      res.status(200).sendFile(filePath);
    } else {
      res.status(404).send({ error: req.baseUrl });
    }
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
        console.log({ file });
        const relPath = path.relative(thePath, file);

        const parts = relPath.split('/');
        parts[parts.length - 1] = parts[parts.length - 1].replace('.json', '');
        const cameled = parts.map((e) => camelCase(e));
        const objPath = cameled.join('.');
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
        `http://${conf.server.host}:${conf.server.port}/content\n` +
          `http://${conf.server.host}:${conf.server.port}/schemas\n` +
          `http://${conf.server.host}:${conf.server.port}/errors\n` +
          `———————————————————————————————————\n`,
      )}`,
    );
  });
}
