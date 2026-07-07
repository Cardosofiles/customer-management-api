/**
 * Auxiliares de exibição para documentos e campos de contato brasileiros (máscara
 * progressiva), além de dados de referência para a interface do usuário.
 *
 * Trata-se de aspectos de exibição consumidos principalmente pelo painel web. Eles
 * permanecem aqui apenas até que o frontend assuma a responsabilidade por eles;
 * a responsabilidade da API é a validação e a normalização (veja `@/utils/br-validators`).
 */
import { normalizeCnpj, onlyDigits } from '@/utils/br-validators.js';

/** Mascara um CPF no formato `000.000.000-00`, formatando a entrada parcial conforme o usuário digita. */
export const formatCpf = (value: string): string => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

/** Mascara um CNPJ como `00.ABC.000/0000-00`; a base é alfanumérica, e os dígitos verificadores são numéricos. */
export const formatCnpj = (value: string): string => {
  const base = normalizeCnpj(value).slice(0, 12);
  const checkDigits = onlyDigits(value.slice(base.length)).slice(0, 2);
  const d = `${base}${checkDigits}`;
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

/** Aplica máscara de CEP no formato `00000-000`. */
export const formatCep = (value: string): string => {
  const d = onlyDigits(value).slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
};

/** Aplica máscara a um número de telefone brasileiro no formato `(00) 0000-0000` ou `(00) 00000-0000`. */
export const formatPhone = (value: string): string => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

interface DisplayNameInput {
  tipo: string;
  nomeCompleto?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
}

const EMPTY_DISPLAY_NAME = '—';

/** Determina o rótulo exibido para um cliente, selecionando os campos que correspondem ao seu tipo. */
export const getDisplayName = (customer: DisplayNameInput): string =>
  customer.tipo === 'PESSOA_JURIDICA'
    ? (customer.nomeFantasia ?? customer.razaoSocial ?? EMPTY_DISPLAY_NAME)
    : (customer.nomeCompleto ?? EMPTY_DISPLAY_NAME);

/** Unidades federativas brasileiras, para campos de seleção no painel web. */
export const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;
