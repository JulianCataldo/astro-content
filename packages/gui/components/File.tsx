import { useEffect } from 'react';
/* ·········································································· */
import useAppStore from '../store';
import Editor from './Editor/Editor';
/* —————————————————————————————————————————————————————————————————————————— */

export default function File() {
  const { content, schemas } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const language = useAppStore((state) => state.editor_language);
  const setCurrentLanguage = useAppStore(
    (state) => state.editor_setCurrentLanguage,
  );

  const prop =
    entity && entry && property && content[entity]?.[entry]?.[property];

  useEffect(() => {
    let isMd = false;
    if (prop && 'rawMd' in prop) {
      isMd = true;
    }

    setCurrentLanguage(isMd ? 'markdown' : 'yaml');
  }, [content, entry, entity, property]);

  return (
    <div className="file-entity">
      {prop && (
        <>
          {'rawMd' in prop && (
            <Editor language="markdown" value={prop.rawMd} isMain />
          )}
          {'rawYaml' in prop && (
            <Editor language="yaml" value={prop.rawYaml} isMain />
          )}
        </>
      )}
      {entity && content[entity] && !entry && language === 'yaml' && (
        <Editor language="yaml" value={schemas.raw[entity]} isMain />
      )}
    </div>
  );
}
