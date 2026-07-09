import { env } from '@/config/env.js';
import { Redis } from 'ioredis';

/**
 * Conexão Redis única e compartilhada, reutilizada por:
 *  - o plugin `redis` (decorado como `app.redis`);
 *  - o store do rate-limit da camada Fastify (`@fastify/rate-limit`);
 *  - o `secondaryStorage` do Better Auth (sessões + rate-limit).
 *
 * Config afinada para falhar rápido, de modo que uma queda do Redis nunca
 * pendure uma request: o rate-limiter degrada via `skipOnError` e a leitura de
 * sessão do Better Auth cai para o cookie cache. `lazyConnect` adia a conexão
 * até o plugin `redis` chamar `connect()` explicitamente.
 */
export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 500,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  lazyConnect: true,
});
