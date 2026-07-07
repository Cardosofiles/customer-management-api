import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { prisma } from '@/lib/prisma.js';
import type { PrismaClient } from '@/generated/client.js';

export default fp(async (app: FastifyInstance) => {
  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}, { name: 'prisma' });

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
