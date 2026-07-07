import type { PrismaClient } from '@/generated/client.js';
import { prisma } from '@/lib/prisma.js';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
  async (app: FastifyInstance) => {
    app.decorate('prisma', prisma);

    app.addHook('onClose', async () => {
      await prisma.$disconnect();
    });
  },
  { name: 'prisma' },
);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
