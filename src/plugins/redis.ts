import { env } from '@/config/env.js';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

export default fp(
  async (app: FastifyInstance) => {
    const redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
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
