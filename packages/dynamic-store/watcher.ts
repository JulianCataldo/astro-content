import chokidar from 'chokidar';
/* ========================================================================== */

// IDEA: Cache should be invalidated
// in dev.for any files(jsx, ts, vue, astro…) ?
const watcher = chokidar.watch('**/*.{md,mdx}', { ignored: ['node_modules'] });

const watchers: ((file: string) => void)[] = [];

watcher.on('ready', () => {
  console.log('Watcher is ready');
  watcher.on('all', (event, file) => {
    if (['add', 'change'].includes(event)) {
      console.log(event);
      watchers.map((callback) => callback(file));
    }
  });
});

export { watchers };
