-- Better Auth passou a usar `secondary-storage` (Redis) para rate-limit, então a
-- tabela deixou de ser usada. Ver src/lib/auth.ts (rateLimit.storage).

-- DropTable
DROP TABLE "rateLimit";
