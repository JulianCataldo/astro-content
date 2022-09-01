import Monaco from '@monaco-editor/react';
import type { Monaco as MonacoType } from '@monaco-editor/react';
import type { editor as nsEd, editor, languages } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import yaml from 'yaml';
/* ·········································································· */
import type { Language } from '@astro-content/types/gui-state';
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Editor({
  value,
  language,
  readOnly,
  isMain,
}: {
  value: string;
  language: Language | ('typescript' | 'json' | 'html');
  readOnly: boolean;
  isMain: boolean;
}) {
  const { schemas, errors, types } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );
  const updateContentForValidation = useAppStore(
    (state) => state.updateContentForValidation,
  );

  const setDefaultEditor = useAppStore((state) => state.setDefaultEditor);
  const setCurrentLanguage = useAppStore((state) => state.setCurrentLanguage);

  const editorRef = useRef<nsEd.IStandaloneCodeEditor | null>(null);
  const [monacoInst, setMonaco] = useState<MonacoType | null>(null);

  function validate(model: nsEd.ITextModel, monaco: MonacoType) {
    const errorMessages: languages.ProviderResult<editor.IMarkerData[]> = [];

    if (errors?.[entity]?.[entry]?.[property]) {
      let positions = {};
      // TODO: Refactor all
      if (errors[entity][entry][property]?.lint) {
        errors[entity][entry][property]?.lint.forEach((err) => {
          if (err.position) {
            positions = {
              startLineNumber: err.position.start.line,
              startColumn: err.position.start.column,
              endLineNumber: err.position.end.line || err.position.start.line,
              endColumn: err.position.end.column || err.position.start.column,
            };
          }
          errorMessages.push({
            message: err.message, // yaml.stringify(err),
            ...positions,
            severity: 4,
            code: err.ruleId,
            source: err.source,
          });
          if (err.ruleId === 'frontmatter-schema') {
            console.log({ l: err });
          }
        });
      }
      if (Array.isArray(errors[entity][entry][property]?.schema)) {
        errors[entity][entry][property]?.schema?.forEach((err) => {
          // TODO: Refactor
          if (err.position) {
            positions = {
              startLineNumber: err.position.start.line,
              startColumn: err.position.start.column,
              endLineNumber: err.position.end.line || err.position.start.line,
              endColumn: err.position.end.column || err.position.start.column,
            };
          }
          errorMessages.push({
            message: yaml.stringify(err),

            ...positions,
            severity: 8,
            code: err.ruleId || 'YAML',
            source: err.source || 'schema',
          });
        });
      }
      if (Array.isArray(errors[entity][entry][property]?.prose)) {
        errors[entity][entry][property]?.prose?.forEach((err) => {
          if (err.position) {
            positions = {
              startLineNumber: err.position.start.line,
              startColumn: err.position.start.column,
              endLineNumber: err.position.end.line || err.position.start.line,
              endColumn: err.position.end.column || err.position.start.column,
            };
          }
          errorMessages.push({
            message: err.message, // yaml.stringify(err),
            ...positions,
            severity: 2,
            code: err.ruleId,
            source: err.source,
          });
        });
      }
    }
    monaco.editor.setModelMarkers(model, 'owner', errorMessages);
  }

  async function handleChange() {
    const model = editorRef.current?.getModel();
    if (model && monacoInst) {
      console.log('e');
      setCurrentLanguage(language);
      await updateContentForValidation(
        entity,
        entry,
        property,
        language,
        model.getValue(),
        schemas?.content?.[entity]?.properties?.[property],
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

      console.log(monaco);
      const model = editorRef.current?.getModel();
      if (model && monaco) {
        setCurrentLanguage(model?.getLanguageId() as Languages);
        validate(model, monaco);
      }
    }
  };

  const handleEditorWillMount = (monaco: MonacoType) => {
    console.log('here is the monaco instance:', monaco);
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

    console.log({ typesB: types });
    if (types?.browser) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        types.browser,
        'global.d.ts',
      );
    }
  };

  useEffect(() => {
    if (isMain && value) {
      handleChange();
    }
  }, [errors, value]);

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
        path={isMain ? `${entity}/${entry}/${property}.${language}` : ''}
        onChange={handleChange}
      />
    </div>
  );
}
