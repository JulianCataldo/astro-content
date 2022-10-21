import type { Monaco as MonacoType } from '@monaco-editor/react';
// import type { editor as nsEd } from 'monaco-editor';
import type { Types } from '@astro-content/types/server-state';
/* ·········································································· */
import { log } from '../../logger';
import { conf, language as mdx } from './mdx-language';
/* —————————————————————————————————————————————————————————————————————————— */

const handleEditorWillMount = (monaco: MonacoType, types: Types) => {
  log(['Monaco instance:', monaco]);

  /* Setup TypeScript */
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    reactNamespace: 'React',
    isolatedModules: true,
    noImplicitAny: true,
    strictNullChecks: true,
    importsNotUsedAsValues: 'error',
    // allowSyntheticDefaultImports: true,
  });

  /* Setup MDX */

  monaco.languages.register({ id: 'mdx' });
  monaco.languages.setMonarchTokensProvider('mdx', mdx);
  monaco.languages.setLanguageConfiguration('mdx', conf(monaco.languages));

  /* Setup Themes */
  // IDEA: Implement this globally, synced with CSS
  // monaco.editor.defineTheme('Dracula', cobalt2 as nsEd.IStandaloneThemeData);

  if (types.browser) {
    const global = `${types.browser}\n${types.common
      .replaceAll('export type ', 'type ')
      .replaceAll('export interface ', 'interface ')}`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      global,
      'global.d.ts',
    );
  }
};

export { handleEditorWillMount };
