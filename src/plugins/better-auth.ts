import { auth } from '@/lib/auth.js';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/http-errors.js';
import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

type SessionUser = typeof auth.$Infer.Session.user;
type SessionData = typeof auth.$Infer.Session.session;
type PreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

/**
 * Better Auth — única fonte de autenticação/autorização da aplicação.
 *
 * - Monta o handler catch-all em `/api/auth/*` (sign-in, sign-up, 2FA, reset,
 *   forgot password, magic link, OAuth, passkeys, admin, …).
 * - Expõe `app.auth` e os guards `requireAuth` / `requireRole` para as rotas de
 *   domínio validarem a sessão (cookie) do Better Auth.
 */
export default fp(
  async (app) => {
    // ── Catch-all handler ──────────────────────────────────────────────────
    // Converte a request do Fastify para o formato Fetch e delega ao Better Auth.
    app.route({
      method: ['GET', 'POST'],
      url: '/api/auth/*',
      async handler(request, reply) {
        try {
          const url = new URL(request.url, `http://${request.headers.host}`);
          const req = new Request(url.toString(), {
            method: request.method,
            headers: fromNodeHeaders(request.headers),
            ...(request.body ? { body: JSON.stringify(request.body) } : {}),
          });

          const response = await auth.handler(req);

          reply.status(response.status);
          response.headers.forEach((value, key) => reply.header(key, value));
          return reply.send(response.body ? await response.text() : null);
        } catch (error) {
          request.log.error({ err: error }, 'Better Auth handler error');
          return reply.status(500).send({
            code: 'AUTH_HANDLER_ERROR',
            message: 'Erro interno de autenticação',
          });
        }
      },
    });

    app.decorate('auth', auth);
    app.decorateRequest('user', null);
    app.decorateRequest('session', null);

    // ── Guards ─────────────────────────────────────────────────────────────
    // Exige sessão válida e popula request.user / request.session.
    const requireAuth: PreHandler = async (request) => {
      const result = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
      if (!result) {
        throw new UnauthorizedError('Autenticação necessária');
      }
      request.user = result.user;
      request.session = result.session;
    };

    // Exige um dos papéis informados (roda requireAuth antes).
    const requireRole =
      (...allowed: string[]): PreHandler =>
      async (request, reply) => {
        await requireAuth(request, reply);
        const role = request.user?.role;
        if (!role || !allowed.includes(role)) {
          throw new ForbiddenError('Acesso negado');
        }
      };

    app.decorate('requireAuth', requireAuth);
    app.decorate('requireRole', requireRole);
  },
  { name: 'better-auth', dependencies: ['prisma'] },
);

declare module 'fastify' {
  interface FastifyInstance {
    auth: typeof auth;
    requireAuth: PreHandler;
    requireRole: (...roles: string[]) => PreHandler;
  }
  interface FastifyRequest {
    user: SessionUser | null;
    session: SessionData | null;
  }
}
