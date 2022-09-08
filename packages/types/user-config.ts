import type { LogLevel } from './logger';

export interface UserConfig {
  previewUrl: string;
  logLevel?: LogLevel;
}
