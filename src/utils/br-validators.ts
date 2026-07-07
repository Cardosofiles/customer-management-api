/**
 * Validação e normalização para documentos e campos de contato brasileiros:
 * CPF, CNPJ (formato alfanumérico, válido a partir de julho de 2026), CEP, telefone e e-mail.
 *
 * Estas são funções puras destinadas a dar suporte a refinamentos do Zod na fronteira da rota,
 * p. ex., `z.string().refine(isValidCpf, 'CPF inválido')`. Prefira `z.email()` para
 * validação de e-mail; `isValidEmail` existe apenas para pontos de chamada que não utilizam Zod.
 */

/** Remove todos os caracteres que não sejam dígitos de uma string. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** Retorna o formato canônico do CPF: apenas dígitos, limitado a 11 caracteres. */
export const normalizeCpf = (value: string): string => onlyDigits(value).slice(0, 11);

/** Retorna o formato canônico do CNPJ: alfanumérico em maiúsculas, limitado a 14 caracteres. */
export const normalizeCnpj = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 14);

const computeCpfDigit = (digits: readonly number[], length: number): number => {
  let sum = 0;
  for (let i = 0; i < length; i++) sum += (digits[i] ?? 0) * (length + 1 - i);
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
};

/**
 * Valida um CPF com base em seus dois dígitos verificadores (mod-11).
 *
 * Aceita entrada formatada ou bruta; rejeita sequências de um único dígito repetido.
 */
export const isValidCpf = (value: string): boolean => {
  const normalized = normalizeCpf(value);
  if (normalized.length !== 11 || /^(\d)\1{10}$/.test(normalized)) return false;

  const digits = [...normalized].map(Number);
  return computeCpfDigit(digits, 9) === digits[9] && computeCpfDigit(digits, 10) === digits[10];
};

// Pesos Mod-11 para o primeiro e o segundo dígitos verificadores do CNPJ.
const CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
// '0'.charCodeAt(0): mapeia '0'-'9' para 0-9 e 'A'-'Z' para 17-42, conforme a especificação da RFB.
const CNPJ_CHAR_OFFSET = 48;

const cnpjCharValue = (char: string): number => char.charCodeAt(0) - CNPJ_CHAR_OFFSET;

const computeCnpjDigit = (base: string, weights: readonly number[]): number => {
  const sum = [...base].reduce((acc, char, i) => acc + cnpjCharValue(char) * (weights[i] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Valida um CNPJ com base em seus dois dígitos verificadores (mod-11) no formato alfanumérico
 * vigente a partir de julho de 2026: a base de 12 caracteres pode conter letras de A a Z e dígitos de 0 a 9,
 * enquanto os 2 dígitos verificadores permanecem numéricos.
 *
 * Aceita entrada formatada ou bruta; rejeita sequências de um único caractere repetido.
 */
export const isValidCnpj = (value: string): boolean => {
  const normalized = normalizeCnpj(value);
  if (normalized.length !== 14) return false;
  if (/^(.)\1{13}$/.test(normalized)) return false;
  if (!/^\d{2}$/.test(normalized.slice(12))) return false;

  return (
    computeCnpjDigit(normalized.slice(0, 12), CNPJ_WEIGHTS_FIRST) === Number(normalized[12]) &&
    computeCnpjDigit(normalized.slice(0, 13), CNPJ_WEIGHTS_SECOND) === Number(normalized[13])
  );
};

/**
 * Valida um CEP por estrutura (8 dígitos). O CEP não possui dígito verificador, então isso apenas
 * confirma a forma; a existência deve ser verificada em um serviço de endereço postal.
 */
export const isValidCep = (value: string): boolean => /^\d{8}$/.test(onlyDigits(value));

/**
 * Valida um número de telefone brasileiro com base na estrutura (sem consultar a operadora):
 * um código de área (DDD) de 2 dígitos seguido por um número de telefone fixo
 * (10 dígitos no total) ou de celular (11 dígitos no total, começando com 9).
 */
export const isValidPhone = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  if (!/^[1-9][0-9]$/.test(digits.slice(0, 2))) return false;
  if (digits.length === 11 && digits[2] !== '9') return false;
  return true;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Valida um e-mail com base em um padrão estrutural pragmático.
 *
 * Em contextos que utilizam Zod, prefira `z.email()`; utilize isto apenas em pontos de chamada que não envolvam Zod.
 */
export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());
