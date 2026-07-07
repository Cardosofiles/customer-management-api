import { buildApp } from '@/app.js';
import { env } from '@/config/env.js';

const app = await buildApp();

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    const address = app.server.address();
    const port = typeof address === 'string' ? address : address?.port;

    app.log.info(`🚀 API rodando em: http://localhost:${port}`);
    app.log.info(`📘 Swagger Docs:   http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err as Error, 'Erro ao iniciar o servidor');
    process.exit(1);
  }
};

const stop = async () => {
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', stop);
process.on('SIGINT', stop);

void start();
