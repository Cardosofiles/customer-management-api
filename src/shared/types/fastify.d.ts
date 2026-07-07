import '@fastify/jwt';

// Tipos centralizados dos decorators do Fastify JWT
// Os tipos de app.prisma, app.redis e app.authenticate
// são declarados inline em cada plugin (ver src/plugins/)
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string };
    user: { sub: string; email: string; role: string };
  }
}
