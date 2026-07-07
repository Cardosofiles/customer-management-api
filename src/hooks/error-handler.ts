import fp from 'fastify-plugin';
import { z, ZodError } from 'zod'; // ← importa z junto
import type { FastifyError } from 'fastify'; // ← importa FastifyError
import { AppError } from '@/shared/errors/app-error.js';

export default fp(
  async (app) => {
    app.setErrorHandler((error: FastifyError, request, reply) => {
      //                 ^^^^^^^^^^^^^^^^
      // Anotação explícita resolve o ts(18046).
      // FastifyError extends Error e tem statusCode?: number

      if (error instanceof ZodError) {
        return reply.status(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          issues: z.treeifyError(error), // ← substitui error.flatten() depreciado
        });
      }

      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          code: error.code,
          message: error.message,
        });
      }

      if (error.statusCode) {
        return reply.status(error.statusCode).send({
          code: 'HTTP_ERROR',
          message: error.message,
        });
      }

      request.log.error({ err: error }, 'Unhandled error');

      return reply.status(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      });
    });
  },
  { name: 'error-handler' },
);
