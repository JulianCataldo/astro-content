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
// import { log } from '../../logger';
import { handleEditorWillMount } from './handlers';
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
  // IDEA: Sync. position both way with assistant? Or provide some lock / unlock
  // const scrollPosition = useAppStore((state) => state.editor_scrollPosition);
  const setScrollPosition = useAppStore(
    (state) => state.editor_setScrollPosition,
  );

  const editorRef = useRef<nsEd.IStandaloneCodeEditor | null>(null);
  const [monacoInst, setMonaco] = useState<MonacoType | null>(null);

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
      // NOTE: Might move this to store
      const propSchema = schemas.content[entity].properties?.[property];

      const frontmatterSchema =
        typeof propSchema === 'object' &&
        typeof propSchema.allOf?.[1] === 'object' &&
        propSchema.allOf[1]?.properties?.frontmatter;

      const schema =
        typeof frontmatterSchema === 'object'
          ? frontmatterSchema
          : typeof propSchema === 'object'
          ? propSchema
          : {};

      await updateContentForValidation(
        entity,
        entry,
        property,
        language,
        model.getValue(),
        schema,
      );
      const propertyReport =
        entity && entry && property && reports[entity]?.[entry]?.[property];
      if (propertyReport) {
        validate(propertyReport, model, monacoInst);
      }
    }
  }

  const [currentScroll, setCurrentScroll] = useState<number>(0);
  const editorWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapperHeight = editorWrapper.current?.clientHeight ?? 0;
    const scrollableHeight = editorRef.current?.getScrollHeight() ?? 0;

    setScrollPosition(wrapperHeight, scrollableHeight, currentScroll);
  }, [currentScroll]);

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

      editorRef.current.onDidScrollChange(({ scrollTop }) =>
        setCurrentScroll(scrollTop),
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
    <div
      id={isMain ? 'main-editor' : ''}
      ref={editorWrapper}
      className="component-editor"
    >
      <Monaco
        language={language}
        value={value}
        options={{
          tabSize: 2,
          automaticLayout: true,
          fontSize: 14,
          readOnly,
          padding: { top: 15, bottom: 15 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
        }}
        path={path}
        theme="vs-dark"
        // TODO: Extract all handlers
        beforeMount={(monaco) => {
          handleEditorWillMount(monaco, types);
          setMonaco(monaco);
        }}
        onMount={handleEditorDidMount}
        onChange={() => {
          handleChange().catch(() => null);
        }}
      />
    </div>
  );
}

Editor.defaultProps = { readOnly: false, isMain: false };
