import type { LogLevel } from './logger';

export interface UserConfig {
  /** **Default**: `/` */
  previewUrl?: string;
  /** **Default**: `'info'` */
  logLevel?: LogLevel;
  /** **Default**: `true` */
  gui?: boolean;
}
