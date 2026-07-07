import { describe, expect, it } from 'vitest';

import { generateSlug, generateToken, hashToken } from '@/utils/crypto.js';

describe('generateToken', () => {
  it('returns 64 hex chars by default (32 bytes)', () => {
    const actual = generateToken();
    expect(actual).toMatch(/^[0-9a-f]{64}$/);
  });

  it('honours a custom byte length', () => {
    expect(generateToken(16)).toMatch(/^[0-9a-f]{32}$/);
  });

  it('produces a different value on each call', () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe('hashToken', () => {
  it('computes a deterministic SHA-256 hex digest', () => {
    // Known SHA-256 of the ASCII string "hello".
    expect(hashToken('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('returns the same digest for the same input', () => {
    expect(hashToken('token-123')).toBe(hashToken('token-123'));
  });
});

describe('generateSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('strips accents and diacritics', () => {
    expect(generateSlug('Ação Coração')).toBe('acao-coracao');
  });

  it('removes special characters and collapses repeated hyphens', () => {
    expect(generateSlug('Foo -- Bar!! @Baz')).toBe('foo-bar-baz');
  });

  it('trims surrounding whitespace', () => {
    expect(generateSlug('  spaced out  ')).toBe('spaced-out');
  });
});
