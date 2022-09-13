import Monaco from '@monaco-editor/react';
import type { Monaco as MonacoType } from '@monaco-editor/react';
import type { editor as nsEd } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
/* ·········································································· */
import type { EditorLanguage } from '@astro-content/types/gui-state';
// import './Editor.scss';
/* ·········································································· */
import { validate } from './validation';
import useAppStore from '../../store';
import { log } from '../../logger';
/* ·········································································· */
// import dracula from '../layouts/themes/dracula.json';
// import cobalt2 from '../layouts/themes/cobalt2.json';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  value: string;
  language: EditorLanguage;
  readOnly?: boolean;
  isMain?: boolean;
}
export default function Editor({ value, language, readOnly, isMain }: Props) {
  const { schemas, reports, types } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const updateContentForValidation = useAppStore(
    (state) => state.editor_updateContentForValidation,
  );
  const setDefaultEditor = useAppStore((state) => state.editor_setDefault);

  const editorRef = useRef<nsEd.IStandaloneCodeEditor | null>(null);
  const [monacoInst, setMonaco] = useState<MonacoType | null>(null);

  // const propertyReport =
  //   entity && entry && property && reports[entity]?.[entry]?.[property];

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
      const propertyReport =
        entity && entry && property && reports[entity]?.[entry]?.[property];
      if (propertyReport) {
        validate(propertyReport, model, monacoInst);
      }
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
      const propertyReport =
        entity && entry && property && reports[entity]?.[entry]?.[property];
      if (model && propertyReport) {
        validate(propertyReport, model, monaco);
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
