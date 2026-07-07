import type { PaginatedResponse } from '@/shared/schemas/pagination.schema.js';

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: { total, page, limit, totalPages, hasMore: page < totalPages },
  };
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
