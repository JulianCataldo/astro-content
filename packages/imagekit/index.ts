import { integration } from './integration.js';
import { pushToRemote } from './file-handlers.js';

// NOTE: This is clashing with integration, must use
// `import Image from 'astro-imagekit/Image.astro';` or setup pjson `exports`?
// import Image from './Image.astro';

export { /* Image, */ pushToRemote };
export default integration;
