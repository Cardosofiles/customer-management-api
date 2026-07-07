import { describe, expect, it } from 'vitest';

import { getOffset, paginate } from '@/utils/pagination.js';

describe('paginate', () => {
  it('wraps data with computed pagination metadata', () => {
    const actual = paginate(['a', 'b'], 25, 1, 10);
    expect(actual).toEqual({
      data: ['a', 'b'],
      meta: { total: 25, page: 1, limit: 10, totalPages: 3, hasMore: true },
    });
  });

  it('reports no further pages on the last page', () => {
    const actual = paginate(['z'], 25, 3, 10);
    expect(actual.meta.totalPages).toBe(3);
    expect(actual.meta.hasMore).toBe(false);
  });

  it('handles an empty result set', () => {
    const actual = paginate([], 0, 1, 10);
    expect(actual.meta.totalPages).toBe(0);
    expect(actual.meta.hasMore).toBe(false);
  });
});

describe('getOffset', () => {
  it('computes the zero-based offset', () => {
    expect(getOffset(1, 10)).toBe(0);
    expect(getOffset(3, 10)).toBe(20);
  });
});
