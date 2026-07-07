import fp from 'fastify-plugin';

export default fp(
  async (app) => {
    app.addHook('onRequest', async (request) => {
      request.log.info({ method: request.method, url: request.url, ip: request.ip }, 'incoming');
    });

    app.addHook('onResponse', async (request, reply) => {
      request.log.info(
        {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          ms: reply.elapsedTime.toFixed(2),
        },
        'completed',
      );
    });
  },
  { name: 'logger-hooks' },
);
