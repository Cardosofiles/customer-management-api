import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    APP_NAME: z.string().min(1, 'APP_NAME é obrigatório'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3333),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_API_URL: z
      .url('NEXT_PUBLIC_API_URL deve ser uma URL válida')
      .default('http://localhost:3000'),
    DATABASE_URL: z
      .string()
      .refine((val) => val.startsWith('postgresql://') || val.startsWith('postgres://'), {
        message: 'DATABASE_URL deve ser uma connection string PostgreSQL válida',
      }),
    REDIS_URL: z.url().default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
    CORS_ORIGIN: z.string().optional(),
    API_URL: z.string().optional(),
    APP_URL: z.url('APP_URL deve ser uma URL válida').default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET deve ter ao menos 32 caracteres'),
    BETTER_AUTH_URL: z.url('BETTER_AUTH_URL deve ser uma URL válida'),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY é obrigatório'),
    EMAIL_FROM: z.email('EMAIL_FROM deve ser um e-mail válido'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .refine((data) => Boolean(data.GITHUB_CLIENT_ID) === Boolean(data.GITHUB_CLIENT_SECRET), {
    message: 'GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET devem ser definidos juntos',
    path: ['GITHUB_CLIENT_SECRET'],
  })
  .refine((data) => Boolean(data.GOOGLE_CLIENT_ID) === Boolean(data.GOOGLE_CLIENT_SECRET), {
    message: 'GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem ser definidos juntos',
    path: ['GOOGLE_CLIENT_SECRET'],
  });

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(`❌ Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);
