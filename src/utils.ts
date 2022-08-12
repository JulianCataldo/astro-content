import { conf } from './config';

// eslint-disable-next-line import/prefer-default-export
export function $log(msg) {
  if (conf.log.verbose) {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
}
