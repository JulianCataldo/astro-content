import type { Monaco as MonacoType } from '@monaco-editor/react';
// import type { editor as nsEd } from 'monaco-editor';
import type { Types } from '@astro-content/types/server-state';
/* ·········································································· */
import { log } from '../../logger';
/* —————————————————————————————————————————————————————————————————————————— */

const handleEditorWillMount = (monaco: MonacoType, types: Types) => {
  log(['Monaco instance:', monaco]);

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

  // IDEA: Implement this globally, synced with CSS
  // monaco.editor.defineTheme('Dracula', cobalt2 as nsEd.IStandaloneThemeData);

  if (types.browser) {
    const global = `${types.common}\n\n${types.browser}`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      global,
      'global.d.ts',
    );
  }
};

export { handleEditorWillMount };
