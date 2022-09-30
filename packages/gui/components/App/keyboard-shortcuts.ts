import { useEffect } from 'react';
/* ·········································································· */
import { log } from '../../logger';
import { useAppStore } from '../../store';
/* —————————————————————————————————————————————————————————————————————————— */

export function useKeyBoardShortcuts() {
  const save = useAppStore((state) => state.editor_save);
  useEffect(() => {
    /* Save — Keyboard shortcut */
    function handleAction(e: KeyboardEvent) {
      const metaKey = e.metaKey || e.ctrlKey;
      if (e.key === 's' && metaKey) {
        e.preventDefault();
        save();
        log('Keyboard: CtrlCmd+S fired!');
      }
      // // if (e.key === 'p' && metaKey) {
      // //   e.preventDefault();
      // //   showCommandPalette();
      // //   log('Keyboard: Meta+P fired!');
      // // }
      // if (e.key === '/' && metaKey) {
      //   // e.preventDefault();

      //   log('Keyboard: CtrlCmd+/ fired!');
      //   return false;
      // }
      return false;
    }

    document.addEventListener('keydown', handleAction);
    return () => {
      document.removeEventListener('keydown', handleAction);
    };
  });
}
