import crypto from 'node:crypto';

export function createHash(queryOptions: unknown) {
  const optionsHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(queryOptions))
    .digest('hex');

  return optionsHash;
}
