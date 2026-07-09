import { RATE_LIMIT } from '@/config/constants.js';
import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';

export default fp(
  async (app) => {
    await app.register(rateLimit, {
      global: true,
      max: RATE_LIMIT.GLOBAL.max,
      timeWindow: RATE_LIMIT.GLOBAL.timeWindow,
      redis: app.redis,
      // `request.ip` honra o `trustProxy` do Fastify (ver app.ts, default seguro
      // `false`): sem proxy confiável é o IP do socket, não spoofável via header.
      keyGenerator: (request) => request.ip,
      // Se o store (Redis) falhar, degrada para "sem limite" em vez de derrubar a
      // API inteira (fail-open). A queda do Redis é logada no plugin `redis`.
      skipOnError: true,
      errorResponseBuilder: () => ({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente em breve.',
      }),
    });
  },
  { name: 'rate-limit', dependencies: ['redis'] },
);
