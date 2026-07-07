import fp from 'fastify-plugin';
import jwtPlugin from '@fastify/jwt';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { env } from '@/config/env.js';
import { AUTH } from '@/config/constants.js';

export default fp(async (app: FastifyInstance) => {
  await app.register(jwtPlugin, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: AUTH.ACCESS_TOKEN_EXPIRY },
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          code: 'UNAUTHORIZED',
          message: 'Token inválido ou expirado',
        });
      }
    },
  );
}, { name: 'jwt' });

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
