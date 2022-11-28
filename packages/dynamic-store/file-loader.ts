import nPath from 'node:path';
import type { GenericData, Path } from 'types';
import yaml from 'yaml';
import { cloneDeep } from 'lodash-es';
/* ========================================================================== */

/* ·········································································· */

export function basicInternalDataValidation(incoming: unknown) {
  if (incoming !== null && typeof incoming === 'object') {
    if (Array.isArray(incoming)) {
      return incoming as unknown[];
    }
    return incoming as GenericData;
  }
  return undefined;
}

/* ·········································································· */

export const fileExtMatcher = /\.(md)$/;
// |mdx|yaml|yml|json

export const fileTypes: Record<string, string> = {
  md: 'markdown',
  // mdx: 'mdx',
  // yml: 'yaml',
  // yaml: 'yaml',
  // json: 'json',
};

/* ·········································································· */

/* From https://github.com/jxson/front-matter/blob/master/index.js */
const platform = typeof process !== 'undefined' ? process.platform : '';
const optionalByteOrderMark = '\\ufeff?';
export const fmPattern =
  `^(${optionalByteOrderMark}(= yaml =|---)` +
  `$([\\s\\S]*?)` +
  `^(?:\\2|\\.\\.\\.)\\s*` +
  `$${platform === 'win32' ? '\\r?' : ''}(?:\\n)?)`;

export function parseMd(md: string) {
  let rawFrontmatter;
  let body: string | undefined;
  let data: GenericData | undefined;

  const regex = new RegExp(fmPattern, 'm');
  const match = regex.exec(md);

  if (match) {
    const fmWithFences = match[match.length - 1];
    rawFrontmatter = fmWithFences.replace(/^\s+|\s+$/g, '');
    body = md.replace(match[0], '');
  }

  if (rawFrontmatter) {
    try {
      const unknownFm = yaml.parse(rawFrontmatter) as unknown;
      const validData = basicInternalDataValidation(unknownFm);
      if (validData) {
        data = cloneDeep(validData);
      } else {
        console.warn('Invalid incoming markdown frontmatter data');
      }
    } catch (e) {
      console.warn(e);
    }
  }
  if (body !== undefined) {
    if (body.trim() === '') {
      body = undefined;
    }
  }

  return { body, data };
}

/* ·········································································· */

export function getFileInfos(path: string) {
  const normalized = path.replace(fileExtMatcher, '').replace(/\/index$/, '');

  const dir = nPath.basename(nPath.dirname(normalized));
  const baseName = nPath.basename(normalized);
  const ext = nPath.extname(path).substring(1);
  const language = ext in fileTypes ? fileTypes[ext] : 'unknown';
  const parts = normalized.split('/');

  const pathInfos: Path = {
    normalized,
    baseName,
    dir,
    original: path,
    parts,
    language,
  };
  return pathInfos;
}
