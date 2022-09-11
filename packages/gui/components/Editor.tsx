// REFACTOR: Split into sub-components
/* eslint-disable max-lines */

import Monaco from '@monaco-editor/react';
import type { Monaco as MonacoType } from '@monaco-editor/react';
import type { editor as nsEd, editor, languages } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
/* ·········································································· */
import type { EditorLanguage } from '@astro-content/types/gui-state';
import useAppStore from '../store';
import { log } from '../utils';
/* ·········································································· */
// import dracula from '../layouts/themes/dracula.json';
// import cobalt2 from '../layouts/themes/cobalt2.json';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Editor({
  value,
  language,
  readOnly,
  isMain,
}: {
  value: string;
  language: EditorLanguage;
  readOnly?: boolean;
  isMain?: boolean;
}) {
  const { schemas, reports, types } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const updateContentForValidation = useAppStore(
    (state) => state.editor_updateContentForValidation,
  );

  const setDefaultEditor = useAppStore((state) => state.editor_setDefault);

  const editorRef = useRef<nsEd.IStandaloneCodeEditor | null>(null);
  const [monacoInst, setMonaco] = useState<MonacoType | null>(null);

  function validate(model: nsEd.ITextModel, monaco: MonacoType) {
    const errorMessages: languages.ProviderResult<editor.IMarkerData[]> = [];

    if (entity && entry && property) {
      let positions = {
        startLineNumber: 0,
        startColumn: 0,
        endLineNumber: 0,
        endColumn: 0,
      };
      // TODO: Refactor all

      const propertyReport = reports[entity]?.[entry]?.[property];

      if (
        propertyReport?.schema?.length ||
        propertyReport?.lint?.length ||
        propertyReport?.prose?.length
      ) {
        [
          ...(propertyReport.schema ?? []),
          ...(propertyReport.lint ?? []),
          ...(propertyReport.prose ?? []),
        ].forEach((err) => {
          if (err.position) {
            positions = {
              startLineNumber: err.position.start.line,
              startColumn: err.position.start.column,
              endLineNumber: err.position.end.line || err.position.start.line,
              endColumn: err.position.end.column || err.position.start.column,
            };
          }
          let severity = 8;
          if ('ruleId' in err) {
            if (err.ruleId !== 'frontmatter-schema') {
              severity = 4;
            }
            if (err.ruleId?.startsWith('retext-')) {
              severity = 2;
            }
          }
          errorMessages.push({
            message: err.message ?? '',
            severity,
            code: 'ruleId' in err ? String(err.ruleId) : undefined,
            source: 'source' in err ? String(err.source) : 'Root',
            ...positions,
          });
        });
      }
    }

    monaco.editor.setModelMarkers(model, 'owner', errorMessages);
  }

  async function handleChange() {
    const model = editorRef.current?.getModel();
    if (
      model &&
      monacoInst &&
      entity &&
      entry &&
      property &&
      (language === 'markdown' || language === 'yaml')
    ) {
      const propSchema =
        typeof schemas.content[entity] === 'object' &&
        schemas.content[entity].properties?.[property];

      const frontmatterSchema =
        typeof propSchema === 'object' &&
        typeof propSchema.allOf?.[1] === 'object' &&
        propSchema.allOf[1]?.properties?.frontmatter;

      await updateContentForValidation(
        entity,
        entry,
        property,
        language,
        model.getValue(),
        frontmatterSchema,
      );
      validate(model, monacoInst);
    }
  }
  const handleEditorDidMount = (
    passedEd: nsEd.IStandaloneCodeEditor,
    monaco: MonacoType,
  ) => {
    if (isMain) {
      editorRef.current = passedEd;
      setDefaultEditor(passedEd);

      const model = editorRef.current.getModel();
      if (model) {
        validate(model, monaco);
      }
    }
  };

  const handleEditorWillMount = (monaco: MonacoType) => {
    log(['Monaco instance:', monaco]);
    setMonaco(monaco);

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

  useEffect(() => {
    if (isMain && value) {
      handleChange().catch(() => null);
    }
  }, [reports, value]);

  let path = '';
  if (isMain) {
    const pathParts = [
      entity ?? undefined,
      entry ?? undefined,
      property ?? undefined,
    ];
    // TODO: Map `language` to correct file extensions
    path = `./${pathParts.join('/')}.${language}`;
  }
  return (
    <div style={{ height: '100%' }} id={isMain ? 'main-editor' : 's'}>
      <Monaco
        options={{
          tabSize: 2,
          automaticLayout: true,
          fontSize: 14,
          readOnly,
          padding: { top: 15, bottom: 15 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
        }}
        theme="vs-dark"
        language={language}
        value={value}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        path={path}
        onChange={() => {
          handleChange().catch(() => null);
        }}
      />
    </div>
  );
}

Editor.defaultProps = {
  readOnly: false,
  isMain: false,
};
