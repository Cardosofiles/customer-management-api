import { describe, expect, it } from 'vitest';

import {
  ESTADOS_BR,
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhone,
  getDisplayName,
} from '@/utils/formatter.js';

describe('formatCpf', () => {
  it('masks progressively as digits arrive', () => {
    expect(formatCpf('111')).toBe('111');
    expect(formatCpf('111444')).toBe('111.444');
    expect(formatCpf('111444777')).toBe('111.444.777');
    expect(formatCpf('11144477735')).toBe('111.444.777-35');
  });
});

describe('formatCnpj', () => {
  it('masks a numeric CNPJ', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('masks an alphanumeric base while keeping numeric check digits', () => {
    expect(formatCnpj('12ABC345678990')).toBe('12.ABC.345/6789-90');
  });

  it('masks partial input', () => {
    expect(formatCnpj('11')).toBe('11');
    expect(formatCnpj('11222')).toBe('11.222');
  });
});

describe('formatCep', () => {
  it('masks 8 digits and partial input', () => {
    expect(formatCep('01001000')).toBe('01001-000');
    expect(formatCep('010')).toBe('010');
  });
});

describe('formatPhone', () => {
  it('returns an empty string for empty input', () => {
    expect(formatPhone('')).toBe('');
  });

  it('masks a landline number', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('masks a mobile number', () => {
    expect(formatPhone('11988887777')).toBe('(11) 98888-7777');
  });

  it('masks partial input', () => {
    expect(formatPhone('11')).toBe('(11');
    expect(formatPhone('1198')).toBe('(11) 98');
  });
});

describe('getDisplayName', () => {
  it('prefers the trade name for a legal entity', () => {
    const actual = getDisplayName({
      tipo: 'PESSOA_JURIDICA',
      razaoSocial: 'Acme Ltda',
      nomeFantasia: 'Acme',
    });
    expect(actual).toBe('Acme');
  });

  it('falls back to the corporate name when no trade name exists', () => {
    const actual = getDisplayName({ tipo: 'PESSOA_JURIDICA', razaoSocial: 'Acme Ltda' });
    expect(actual).toBe('Acme Ltda');
  });

  it('uses the full name for an individual', () => {
    const actual = getDisplayName({ tipo: 'PESSOA_FISICA', nomeCompleto: 'Maria Silva' });
    expect(actual).toBe('Maria Silva');
  });

  it('returns the placeholder when no name is available', () => {
    expect(getDisplayName({ tipo: 'PESSOA_FISICA' })).toBe('—');
  });
});

describe('ESTADOS_BR', () => {
  it('lists all 26 states plus the Federal District', () => {
    expect(ESTADOS_BR).toHaveLength(27);
    expect(ESTADOS_BR.map((estado) => estado.value)).toContain('SP');
  });
});
