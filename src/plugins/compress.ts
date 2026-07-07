import compress from '@fastify/compress';
import fp from 'fastify-plugin';

export default fp(
  async (app) => {
    await app.register(compress, {
      global: true,
      threshold: 1024,
    });
  },
  { name: 'compress' },
);
