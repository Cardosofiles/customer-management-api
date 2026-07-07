declare const window: { location: { href: string } } | undefined;

import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  magicLinkClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins';

/**
 * Pre-configured Better Auth client with all plugins enabled.
 *
 * Copy or import this file in your Next.js (or any frontend) project.
 * Set NEXT_PUBLIC_API_URL to the URL of this API server.
 *
 * @example
 * const { data, error } = await authClient.signIn.email({ email, password });
 * const { data } = await authClient.signUp.email({ name, email, password });
 * const { data } = await authClient.signIn.social({ provider: "google" });
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/two-factor';
        }
      },
    }),
    usernameClient(),
    magicLinkClient(),
    adminClient(),
    passkeyClient(),
  ],
});

export type AuthClient = typeof authClient;
export type AuthClientSession = typeof authClient.$Infer.Session;
export type AuthClientUser = typeof authClient.$Infer.Session.user;
