import create from 'zustand';
/* ·········································································· */
import type { AppState } from '@astro-content/types/gui-state';

import ui from './ui';
import editor from './editor';
import data from './data';
/* —————————————————————————————————————————————————————————————————————————— */

const useAppStore = create<AppState>()((set) => ({
  ...ui(set),

  ...data(set),

  ...editor(set),
}));

export default useAppStore;
