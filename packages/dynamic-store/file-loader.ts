import nPath from 'node:path';
/* ========================================================================== */

/* ·········································································· */

export function basicInternalDataValidation(incoming: unknown) {
  if (incoming !== null && typeof incoming === 'object') {
    if (Array.isArray(incoming)) {
      return incoming as unknown[];
    }
    return incoming as Record<string, unknown>;
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

/* ·········································································· */

export function getFileInfos(path: string) {
  const normalizedPath = path
    .replace(fileExtMatcher, '')
    .replace(/\/index$/, '');
  const directory = nPath.basename(nPath.dirname(normalizedPath));
  const fileBaseName = nPath.basename(normalizedPath);
  const ext = nPath.extname(path).substring(1);
  const fileType = ext in fileTypes ? fileTypes[ext] : 'unknown';

  return {
    normalizedPath,
    directory,
    fileBaseName,
    fileType,
  };
}
