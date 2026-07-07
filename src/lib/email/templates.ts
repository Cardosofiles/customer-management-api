import { env } from '@/config/env.js';

/**
 * Escapes HTML-significant characters to prevent markup/content injection
 * when interpolating user-controlled values (name, email) into email bodies.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps inner content in the shared responsive e-mail shell.
 * `content` deve ser HTML já sanitizado (use {@link escapeHtml} em valores dinâmicos).
 */
export function buildBaseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:0}
    .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    .hdr{background:#1a1a2e;padding:32px;text-align:center}
    .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:600}
    .body{padding:40px 32px}
    .body p{color:#374151;line-height:1.6;margin:0 0 16px}
    .btn{display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 0}
    .code{font-size:32px;font-weight:700;color:#1a1a2e;letter-spacing:8px;text-align:center;padding:16px;background:#f3f4f6;border-radius:8px;margin:16px 0}
    .ftr{padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center}
    .ftr p{color:#9ca3af;font-size:12px;margin:4px 0}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><h1>${env.APP_NAME}</h1></div>
    <div class="body">${content}</div>
    <div class="ftr">
      <p>E-mail automático — não responda.</p>
      <p>Em conformidade com a LGPD — Lei 13.709/2018</p>
    </div>
  </div>
</body>
</html>`;
}
