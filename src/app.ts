import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '@/config/env.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
              },
            }
          : undefined,
    },
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: 'array',
        useDefaults: true,
      },
    },
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);

  // ── Infraestrutura (ordem importa — dependências declaradas primeiro) ──────
  await app.register(import('./plugins/sensible.js'));
  await app.register(import('./plugins/helmet.js'));
  await app.register(import('./plugins/cors.js'));
  await app.register(import('./plugins/compress.js'));
  await app.register(import('./plugins/prisma.js'));
  await app.register(import('./plugins/redis.js'));
  await app.register(import('./plugins/jwt.js'));
  await app.register(import('./plugins/swagger.js'));
  await app.register(import('./plugins/rate-limit.js')); // depende de redis
  await app.register(import('./plugins/multipart.js'));

  // ── Hooks globais ─────────────────────────────────────────────────────────
  await app.register(import('./hooks/error-handler.js'));
  await app.register(import('./hooks/logger.hook.js'));
  await app.register(import('./hooks/auth.hook.js'));

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', { schema: { tags: ['System'], description: 'Health check' } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  }));

  // ── Módulos de domínio — descomente conforme cada sprint for implementado ──
  // await app.register(import('./modules/auth/auth.plugin.js'),           { prefix: '/auth' });
  // await app.register(import('./modules/users/users.plugin.js'),         { prefix: '/users' });
  // await app.register(import('./modules/products/products.plugin.js'),   { prefix: '/products' });
  // await app.register(import('./modules/categories/categories.plugin.js'),{ prefix: '/categories' });
  // await app.register(import('./modules/cart/cart.plugin.js'),           { prefix: '/cart' });
  // await app.register(import('./modules/orders/orders.plugin.js'),       { prefix: '/orders' });
  // await app.register(import('./modules/reviews/reviews.plugin.js'));
  // await app.register(import('./modules/coupons/coupons.plugin.js'));
  // await app.register(import('./modules/shipping/shipping.plugin.js'),   { prefix: '/shipping' });
  // await app.register(import('./modules/admin/admin.plugin.js'),         { prefix: '/admin' });
  // await app.register(import('./modules/webhooks/webhooks.plugin.js'),   { prefix: '/webhooks' });

  return app;
}
