import { buildBaseHtml, escapeHtml } from './templates.js';
import { sendEmail } from './transport.js';

/**
 * Transactional e-mails do fluxo de autenticação (Better Auth):
 * verificação de conta, reset/forgot de senha, magic link, troca de e-mail e
 * OTP de dois fatores. Disparados pelos callbacks configurados em `lib/auth.ts`.
 *
 * O sistema de e-mail de leads/marketing é um serviço separado (a definir) e
 * deve reutilizar `transport`/`templates`, sem tocar neste arquivo.
 */

export interface VerificationEmailParams {
  readonly to: string;
  readonly name: string;
  readonly url: string;
}

export interface PasswordResetEmailParams {
  readonly to: string;
  readonly name: string;
  readonly url: string;
}

export interface MagicLinkEmailParams {
  readonly to: string;
  readonly url: string;
}

export interface TwoFactorOtpEmailParams {
  readonly to: string;
  readonly name: string;
  readonly otp: string;
}

export interface ChangeEmailParams {
  readonly to: string;
  readonly name: string;
  readonly newEmail: string;
  readonly url: string;
}

/**
 * Sends an account email verification link to the user.
 */
export async function sendEmailVerification({
  to,
  name,
  url,
}: VerificationEmailParams): Promise<void> {
  await sendEmail({
    to,
    subject: 'Verifique seu endereço de e-mail',
    html: buildBaseHtml(`
      <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>
      <p>Clique no botão abaixo para verificar seu e-mail e ativar sua conta.</p>
      <p style="text-align:center"><a href="${url}" class="btn">Verificar E-mail</a></p>
      <p>Se você não criou uma conta, ignore este e-mail.</p>
      <p style="color:#9ca3af;font-size:13px">O link expira em 24 horas.</p>
    `),
  });
}

/**
 * Sends a password reset link to the user.
 */
export async function sendPasswordReset({
  to,
  name,
  url,
}: PasswordResetEmailParams): Promise<void> {
  await sendEmail({
    to,
    subject: 'Redefinição de senha',
    html: buildBaseHtml(`
      <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p style="text-align:center"><a href="${url}" class="btn">Redefinir Senha</a></p>
      <p>Se você não solicitou isso, ignore este e-mail. Sua senha permanece inalterada.</p>
      <p style="color:#9ca3af;font-size:13px">O link expira em 1 hora.</p>
    `),
  });
}

/**
 * Sends a magic link for passwordless sign-in.
 */
export async function sendMagicLinkEmail({ to, url }: MagicLinkEmailParams): Promise<void> {
  await sendEmail({
    to,
    subject: 'Seu link de acesso',
    html: buildBaseHtml(`
      <p>Clique no botão abaixo para acessar sua conta de forma segura, sem senha.</p>
      <p style="text-align:center"><a href="${url}" class="btn">Acessar Minha Conta</a></p>
      <p>Se você não solicitou este link, ignore este e-mail.</p>
      <p style="color:#9ca3af;font-size:13px">O link expira em 5 minutos.</p>
    `),
  });
}

/**
 * Sends a confirmation link to the current (old) email when the user requests an email change.
 * The user must click the link to confirm the change before it takes effect.
 */
export async function sendChangeEmailVerification({
  to,
  name,
  newEmail,
  url,
}: ChangeEmailParams): Promise<void> {
  await sendEmail({
    to,
    subject: 'Confirme a alteração do seu e-mail',
    html: buildBaseHtml(`
      <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>
      <p>Recebemos uma solicitação para alterar o e-mail da sua conta para <strong>${escapeHtml(newEmail)}</strong>.</p>
      <p>Clique no botão abaixo para confirmar esta alteração.</p>
      <p style="text-align:center"><a href="${url}" class="btn">Confirmar Alteração</a></p>
      <p>Se você não solicitou esta alteração, ignore este e-mail. Seu e-mail atual permanece inalterado.</p>
      <p style="color:#9ca3af;font-size:13px">O link expira em 1 hora.</p>
    `),
  });
}

/**
 * Sends a two-factor authentication OTP code via email.
 */
export async function sendTwoFactorOtp({ to, name, otp }: TwoFactorOtpEmailParams): Promise<void> {
  await sendEmail({
    to,
    subject: 'Código de verificação em dois fatores',
    html: buildBaseHtml(`
      <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>
      <p>Use o código abaixo para concluir o login com verificação em dois fatores.</p>
      <div class="code">${escapeHtml(otp)}</div>
      <p>O código expira em 10 minutos. Não compartilhe com ninguém.</p>
      <p>Se você não está tentando fazer login, considere alterar sua senha imediatamente.</p>
    `),
  });
}
