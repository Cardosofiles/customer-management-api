import { env } from '@/config/env.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export default fp(
  async (app) => {
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
            // Better Auth autentica via cookie de sessão (prefixo `ba`).
            cookieAuth: { type: 'apiKey', in: 'cookie', name: 'ba.session_token' },
          },
        },
      },
    });

    await app.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: true },
    });
  },
  { name: 'swagger' },
);
