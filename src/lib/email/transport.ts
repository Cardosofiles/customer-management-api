import { Resend } from 'resend';

import { env } from '@/config/env.js';

/**
 * Low-level e-mail transport (Resend).
 *
 * Camada compartilhada por todos os serviços de e-mail (auth agora, leads
 * depois). Nenhum conteúdo/template mora aqui — apenas o envio.
 */
const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailOptions {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
