import generateTypes from './generate-types';
import loadFiles from './load-files';
import transform from './transform';

await generateTypes();

const contentComponents = await loadFiles();

await transform(contentComponents);
