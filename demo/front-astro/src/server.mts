import express from 'express';
import { handler as ssrHandler } from '../dist/server/entry.mjs';

const app = express();
app.use(ssrHandler);
app.use(express.static('./dist/client'));

const port = 9054;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
