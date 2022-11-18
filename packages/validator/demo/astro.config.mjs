import { defineConfig } from 'astro/config';
import { schemasToCheckers } from '@astro-content/validator';

// https://astro.build/config
export default defineConfig({
  integrations: [
    //
    schemasToCheckers({ outDir: 'src/checkers' }),
  ],
});
