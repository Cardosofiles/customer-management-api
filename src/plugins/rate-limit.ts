import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { RATE_LIMIT } from '@/config/constants.js';

export default fp(async (app) => {
  await app.register(rateLimit, {
    global: true,
    max: RATE_LIMIT.GLOBAL.max,
    timeWindow: RATE_LIMIT.GLOBAL.timeWindow,
    redis: app.redis,
    keyGenerator: (request) =>
      (request.headers['x-forwarded-for'] as string | undefined) ?? request.ip,
    errorResponseBuilder: () => ({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente em breve.',
    }),
  });
}, { name: 'rate-limit', dependencies: ['redis'] });
