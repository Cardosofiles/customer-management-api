import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/shared/errors/http-errors.js';

export const authorize = (roles: string[]) => {
  return async (request: FastifyRequest) => {
    const user = request.user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role)) {
      throw new ForbiddenError('Acesso negado');  // ← instância de Error
    }
  };
};

export default fp(async () => {
  // authorize é usado via importação direta nos módulos
}, { name: 'auth-hook', dependencies: ['jwt'] });
