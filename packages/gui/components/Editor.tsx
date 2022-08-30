import Monaco from '@monaco-editor/react';
import type { Monaco as MonacoType } from '@monaco-editor/react';
import type { editor as nsEd, editor, languages } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import yaml from 'yaml';
/* ·········································································· */
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Editor({
  value,
  language,
  readOnly,
  isMain,
}: {
  value: string;
  language: string;
  readOnly: boolean;
  isMain: boolean;
}) {
  const { errors, types } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore((state) => state.route);

  const setDefaultEditor = useAppStore((state) => state.setDefaultEditor);

  const editorRef = useRef<nsEd.IStandaloneCodeEditor | null>(null);
  const [monacoInst, setMonaco] = useState<MonacoType | null>(null);

  function validate(model: nsEd.ITextModel, monaco: MonacoType) {
    const errorMessages: languages.ProviderResult<editor.IMarkerData[]> = [];

    if (errors?.[entity]?.[entry]?.[property]) {
      let positions = {};

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
            message: yaml.stringify(err),
            ...positions,
            severity: 2,
            // code: 'Lint',
            // source: 'YAML source',
          });
          if (err.ruleId === 'frontmatter-schema') {
            console.log({ l: err });
          }
        });
      }
      if (Array.isArray(errors[entity][entry][property]?.schema)) {
        errors[entity][entry][property]?.schema?.forEach((err) => {
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
            severity: 3,
            // code: 'Lint',
            // source: 'YAML source',
          });
        });
      }
    }
    monaco.editor.setModelMarkers(model, 'owner', errorMessages);
  }

  function handleChange() {
    const model = editorRef.current?.getModel();
    if (model && monacoInst) {
      console.log('e');
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
    });

    console.log({ types });
    if (types) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        types,
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
