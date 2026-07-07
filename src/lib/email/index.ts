/**
 * E-mail — ponto de entrada.
 *
 * `auth-email.service` cobre o fluxo do Better Auth. O futuro serviço de leads
 * será um módulo irmão (ex.: `lead-email.service.ts`) reutilizando
 * `transport`/`templates`, e deverá ser reexportado aqui.
 */
export * from './auth-email.service.js';
