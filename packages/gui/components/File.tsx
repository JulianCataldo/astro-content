import { useEffect } from 'react';
/* ·········································································· */
import { useAppStore } from '../store';
import Editor from './Editor/Editor';
/* —————————————————————————————————————————————————————————————————————————— */

export default function File() {
  const { content, schemas } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const setCurrentLanguage = useAppStore(
    (state) => state.editor_setCurrentLanguage,
  );

  const prop =
    entity && entry && property && content[entity]?.[entry]?.[property];

  useEffect(() => {
    if (prop) {
      setCurrentLanguage(prop.language);
    }
  }, [content, entry, entity, property]);

  return (
    <div className="file-entity">
      {prop && <Editor language={prop.language} value={prop.raw} isMain />}
      {/* Schema Editor */}

      {entity && !entry && content[entity] && (
        <Editor language="yaml" value={schemas.raw[entity]} isMain />
      )}
    </div>
  );
}
