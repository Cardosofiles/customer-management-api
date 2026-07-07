import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import * as path from 'node:path';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
