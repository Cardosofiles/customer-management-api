import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { env } from '@/config/env.js';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API',
        description: 'Documentação da API',
        version: '1.0.0',
      },
      servers: [{ url: env.API_URL ?? `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });
}, { name: 'swagger' });
