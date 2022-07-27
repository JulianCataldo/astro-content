import express from 'express';
import state from './state';

export default function serve() {
  const app = express();

  app.use('/v1', (req, res) => {
    res.status(200).send(state.content);
  });

  /* OpenAPI */
  // app.use('/$', (req, res) => {
  //   res.status(200).send(state.api);
  // });

  app.use('/schemas', (req, res) => {
    res.status(200).send(state.schemas);
  });
  app.use('*', (req, res) => {
    res.status(404).send({ error: 'not found' });
  });

  const { SERVER_PORT: port = 5010 } = process.env;

  app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://0.0.0.0:${port}`);
  });
}
