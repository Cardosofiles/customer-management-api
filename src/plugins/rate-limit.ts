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
      // `trustProxy` já resolve o IP real do cliente a partir do X-Forwarded-For;
      // usar request.ip evita spoofing via header cru.
      keyGenerator: (request) => request.ip,
      errorResponseBuilder: () => ({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente em breve.',
      }),
    });
  },
  { name: 'rate-limit', dependencies: ['redis'] },
);
