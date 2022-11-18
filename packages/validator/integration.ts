import type { AstroIntegration } from 'astro';
/* ========================================================================== */

export interface Settings {
  /**
   * Destination directory for the generated checkers.
   *
   * E.g. `src/checkers`
   *
   * **Default**: Colocated with its input schema.
   */
  outDir?: string | undefined;
}

const integration = (settings: Settings = {}): AstroIntegration => ({
  name: 'schemas-to-checkers',
  hooks: {
    'astro:server:setup': async ({ server }) => {
      const { generateChecker, generateAllCheckers } = await import(
        './schema-to-validator'
      );

      await generateAllCheckers(settings.outDir);

      server.watcher.on('all', (_, filePath: string) => {
        if (filePath.endsWith('.schema.yaml')) {
          generateChecker(filePath, settings.outDir).catch((e) =>
            console.log(e),
          );
        }
      });
    },
  },
});

export { integration };
