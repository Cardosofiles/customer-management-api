import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The `redis` plugin eagerly opens a TCP connection (`redis.connect()`) and
// `rate-limit` depends on it. Replace both with no-op plugins that keep the
// same fastify-plugin names so the suite stays hermetic — no live Redis needed.
// Every other plugin (prisma, jwt, swagger, …) is exercised for real.
vi.mock('@/plugins/redis.js', async () => {
  const fp = (await import('fastify-plugin')).default;
  return {
    default: fp(
      async () => {
        /* no-op: real redis connection is not needed in tests */
      },
      { name: 'redis' },
    ),
  };
});

vi.mock('@/plugins/rate-limit.js', async () => {
  const fp = (await import('fastify-plugin')).default;
  return {
    default: fp(
      async () => {
        /* no-op: rate limiting relies on redis, which is stubbed out */
      },
      { name: 'rate-limit', dependencies: ['redis'] },
    ),
  };
});

import { buildApp } from '@/app.js';

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

interface HealthPayload {
  status: string;
  timestamp: string;
  version: string;
}

describe('buildApp', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a ready Fastify instance', () => {
    expect(app).toBeDefined();
    expect(typeof app.inject).toBe('function');
  });

  it('wires up the infrastructure decorators', () => {
    // prisma decorates `prisma`; better-auth decorates `auth` + the guards.
    expect(app.hasDecorator('prisma')).toBe(true);
    expect(app.hasDecorator('auth')).toBe(true);
    expect(app.hasDecorator('requireAuth')).toBe(true);
    expect(app.hasDecorator('requireRole')).toBe(true);
  });

  it('mounts the Better Auth catch-all route', () => {
    expect(app.printRoutes()).toContain('api/auth');
  });

  it('applies helmet security headers to responses', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    // helmet is registered with CSP disabled but still sets the sniffing guard.
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('honours CORS for an allowed origin', async () => {
    // `.env` sets CORS_ORIGIN=http://localhost:3000.
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:3000' },
    });

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('returns 404 for an unknown route', async () => {
    const res = await app.inject({ method: 'GET', url: '/does-not-exist' });

    expect(res.statusCode).toBe(404);
  });

  describe('GET /health', () => {
    it('responds 200 with a JSON status payload', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.json<HealthPayload>()).toMatchObject({ status: 'ok' });
    });

    it('reports the package version (falling back to 1.0.0)', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });

      expect(res.json<HealthPayload>().version).toBe(process.env.npm_package_version ?? '1.0.0');
    });

    it('stamps a fresh ISO-8601 timestamp', async () => {
      const before = Date.now();
      const res = await app.inject({ method: 'GET', url: '/health' });
      const after = Date.now();

      const { timestamp } = res.json<HealthPayload>();
      expect(timestamp).toMatch(ISO_8601);

      const parsed = new Date(timestamp).getTime();
      expect(parsed).toBeGreaterThanOrEqual(before);
      expect(parsed).toBeLessThanOrEqual(after);
    });

    it('only exposes the GET verb', async () => {
      const res = await app.inject({ method: 'POST', url: '/health' });

      expect(res.statusCode).toBe(404);
    });

    it('is documented in the OpenAPI schema under the System tag', () => {
      const spec = app.swagger() as {
        paths?: Record<string, { get?: { tags?: string[]; description?: string } }>;
      };

      const health = spec.paths?.['/health']?.get;
      expect(health).toBeDefined();
      expect(health?.tags).toContain('System');
      expect(health?.description).toBe('Health check');
    });
  });

  it('documents the Better Auth session cookie as the security scheme', () => {
    const spec = app.swagger() as {
      components?: {
        securitySchemes?: Record<string, { type?: string; in?: string; name?: string }>;
      };
    };

    expect(spec.components?.securitySchemes?.cookieAuth).toMatchObject({
      type: 'apiKey',
      in: 'cookie',
      name: 'ba.session_token',
    });
  });
});
