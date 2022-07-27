// import generateApi from './gen-api';
import state from './state';
import serve from './serve';

import loadSchemas from './load-schemas';
import loadFiles from './load-files';
import generateHelper from './generate-client-helper';
import updateVsCode from './update-vscode';

await loadSchemas();
// console.log({ schemas: state.schemas });

setTimeout(async () => {
  await loadFiles();
  // console.log({ content: state.content });
}, 200);

setTimeout(async () => {
  await generateHelper();
  // console.log({ content: state.content });
}, 500);

setTimeout(async () => {
  await updateVsCode();
  // console.log({ content: state.content });
}, 500);

// generateApi();
// console.log({ api });

serve();
