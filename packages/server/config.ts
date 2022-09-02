/* ·········································································· */
import type { UserConfig } from '@astro-content/types/user-config';
/* —————————————————————————————————————————————————————————————————————————— */

let userConfig: Partial<UserConfig>;

const ccompPath = './.ccomp';

const conf: UserConfig = {
  get server() {
    return {
      host: userConfig?.server?.host || 'localhost',
      port: userConfig?.server?.port || 5010,
    };
  },
  get helpers() {
    return { dest: userConfig?.helpers?.dest || `${ccompPath}/helpers` };
  },
  get components() {
    return {
      src: userConfig?.components?.src || './src/content',
      dest: userConfig?.components?.dest || `${ccompPath}/build/content`,
    };
  },
  get errors() {
    return { dest: userConfig?.errors?.dest || './errors' };
  },
  get dev() {
    return {
      triggerFile:
        userConfig?.dev?.triggerFile || `${ccompPath}/.timestamp.json`,
    };
  },
  get vscode() {
    return { dest: userConfig?.vscode?.dest || `${ccompPath}/schemas/vscode` };
  },
  get types() {
    return { dest: userConfig?.types?.dest || `${ccompPath}/types` };
  },
  get markdown() {
    return {
      remarkPlugins: userConfig?.markdown?.remarkPlugins || [],
    };
  },
  get fake() {
    return {
      entriesCount: userConfig?.fake?.entriesCount || 1200,
    };
  },
  get remote() {
    return {
      dest: userConfig?.remote?.dest || null,
    };
  },
  get log() {
    return {
      verbose: userConfig?.log?.verbose || true,
    };
  },
  get previewUrl() {
    return userConfig?.previewUrl || '/';
  },
};

export { conf };
