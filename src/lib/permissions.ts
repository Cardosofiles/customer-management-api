import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Access-control statements (resource → actions).
 *
 * `defaultStatements` já traz os recursos internos do plugin admin (`user`,
 * `session`). O recurso `customer` é a semente do CRUD que será implementado
 * depois — mantê-lo aqui garante que os papéis já nasçam com permissões
 * significativas e evita reescrever a autorização quando o módulo chegar.
 */
export const statement = {
  ...defaultStatements,
  customer: ['create', 'read', 'update', 'delete', 'list'],
} as const;

export const ac = createAccessControl(statement);

/**
 * USER — usuário autenticado padrão. Sem acesso à gestão de clientes;
 * serve de base para endpoints self-service (perfil próprio, etc.).
 */
export const user = ac.newRole({
  customer: [],
});

/**
 * FINANCIAL — perfil operacional/financeiro: consulta e atualização de
 * clientes, sem poder criar/excluir nem administrar usuários.
 */
export const financial = ac.newRole({
  customer: ['read', 'list', 'update'],
});

/**
 * ADMIN — acesso total: administração de usuários/sessões (adminAc) + CRUD
 * completo de clientes.
 */
export const admin = ac.newRole({
  ...adminAc.statements,
  customer: ['create', 'read', 'update', 'delete', 'list'],
});

/**
 * Mapa de papéis consumido pelo plugin `admin` do Better Auth.
 * As chaves devem casar exatamente com os valores do enum `Role` do Prisma.
 */
export const roles = {
  USER: user,
  FINANCIAL: financial,
  ADMIN: admin,
} as const;

export type AppRole = keyof typeof roles;
