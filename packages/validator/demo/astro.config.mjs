import { defineConfig } from 'astro/config';
import contentValidator from '@astro-content/validator';

// https://astro.build/config
export default defineConfig({
  integrations: [
    //
    contentValidator({ outDir: 'src/checkers' }),
  ],
});
