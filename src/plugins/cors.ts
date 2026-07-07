import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '@/config/env.js';

export default fp(async (app) => {
  await app.register(cors, {
    origin: (origin, cb) => {
      const allowed = env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [];
      if (!origin || allowed.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Origem não permitida pelo CORS'), false);
      }
    },
    credentials: true,
  });
}, { name: 'cors' });
