import { redis } from '@/lib/redis.js';
import type { FastifyInstance } from 'fastify';
import type { Redis } from 'ioredis';
import fp from 'fastify-plugin';

export default fp(
  async (app: FastifyInstance) => {
    // Trata erros de conexão para que uma instabilidade do Redis não derrube o
    // processo com um evento 'error' não capturado. O rate-limiter degrada com
    // `skipOnError`; aqui apenas registramos a indisponibilidade do store.
    redis.on('error', (err) => {
      app.log.error({ err }, 'Redis error');
    });

    await redis.connect();

    app.decorate('redis', redis);

    app.addHook('onClose', async () => {
      await redis.quit();
    });
  },
  { name: 'redis' },
);

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}
