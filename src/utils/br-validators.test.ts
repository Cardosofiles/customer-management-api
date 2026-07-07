import { describe, expect, it } from 'vitest';

import {
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  normalizeCnpj,
  normalizeCpf,
  onlyDigits,
} from '@/utils/br-validators.js';

describe('onlyDigits', () => {
  it('removes every non-digit character', () => {
    expect(onlyDigits('(11) 98888-7777')).toBe('11988887777');
    expect(onlyDigits('abc123.def')).toBe('123');
    expect(onlyDigits('')).toBe('');
  });
});

describe('normalizeCpf', () => {
  it('keeps only digits and caps the length at 11', () => {
    expect(normalizeCpf('111.444.777-35')).toBe('11144477735');
    expect(normalizeCpf('111444777350000')).toBe('11144477735');
  });
});

describe('normalizeCnpj', () => {
  it('uppercases, strips symbols and caps the length at 14', () => {
    expect(normalizeCnpj('11.222.333/0001-81')).toBe('11222333000181');
    expect(normalizeCnpj('12abc345678990extra')).toBe('12ABC345678990');
  });
});

describe('isValidCpf', () => {
  it('accepts a valid CPF, formatted or raw', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(isValidCpf('11144477736')).toBe(false);
  });

  it('rejects a repeated-digit sequence', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(isValidCpf('1114447773')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('accepts a valid numeric CNPJ, formatted or raw', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('accepts a valid alphanumeric CNPJ (2026 format)', () => {
    expect(isValidCnpj('12ABC345678990')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(isValidCnpj('11222333000182')).toBe(false);
  });

  it('rejects a repeated-character sequence', () => {
    expect(isValidCnpj('11111111111111')).toBe(false);
  });

  it('rejects non-numeric check digits', () => {
    expect(isValidCnpj('12ABC3456789AB')).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(isValidCnpj('112223330001')).toBe(false);
  });
});

describe('isValidCep', () => {
  it('accepts 8 digits, formatted or raw', () => {
    expect(isValidCep('01001-000')).toBe(true);
    expect(isValidCep('01001000')).toBe(true);
  });

  it('rejects the wrong length', () => {
    expect(isValidCep('0100100')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts a 10-digit landline', () => {
    expect(isValidPhone('(11) 3333-4444')).toBe(true);
  });

  it('accepts an 11-digit mobile starting with 9', () => {
    expect(isValidPhone('(11) 98888-7777')).toBe(true);
  });

  it('rejects an 11-digit number whose third digit is not 9', () => {
    expect(isValidPhone('11388887777')).toBe(false);
  });

  it('rejects an invalid area code', () => {
    expect(isValidPhone('0133334444')).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(isValidPhone('12345')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts a well-formed address and trims surrounding space', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('userexample.com')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});
