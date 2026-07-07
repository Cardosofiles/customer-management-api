import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      { message: 'DATABASE_URL deve ser uma connection string PostgreSQL válida' },
    ),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
  CORS_ORIGIN: z.string().optional(),
  API_URL: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Variáveis de ambiente inválidas:', result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
