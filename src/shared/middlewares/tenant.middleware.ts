import type { FastifyReply, FastifyRequest } from 'fastify';

// Middleware para injeção de contexto multi-tenant via header X-Tenant-ID
// Ative em módulos que exijam isolamento por tenant
export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const tenantId = request.headers['x-tenant-id'] as string | undefined;

  if (!tenantId) {
    return reply.status(400).send({
      code: 'MISSING_TENANT',
      message: 'Header X-Tenant-ID é obrigatório',
    });
  }

  // TODO: validar tenant no banco/cache e injetar no request
  // (request as FastifyRequest & { tenantId: string }).tenantId = tenantId;
}
