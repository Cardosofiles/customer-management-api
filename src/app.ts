import { env } from '@/config/env.js';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
      ...(env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true,
          },
        },
      }),
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
  await app.register(import('./plugins/swagger.js'));
  await app.register(import('./plugins/rate-limit.js')); // depende de redis
  await app.register(import('./plugins/multipart.js'));

  // ── Hooks globais ─────────────────────────────────────────────────────────
  await app.register(import('./hooks/error-handler.js'));
  await app.register(import('./hooks/logger.hook.js'));

  // ── Autenticação/Autorização (Better Auth) ────────────────────────────────
  // Monta /api/auth/* e expõe app.requireAuth / app.requireRole.
  await app.register(import('./plugins/better-auth.js'));

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', { schema: { tags: ['System'], description: 'Health check' } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  }));

  // ── Módulos de domínio (CRUD de Clientes PF/PJ, leads) — a implementar ─────

  return app;
}
