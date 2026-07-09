import { passkey } from '@better-auth/passkey';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, magicLink, twoFactor, username } from 'better-auth/plugins';

import { RATE_LIMIT } from '@/config/constants.js';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';
import {
  sendChangeEmailVerification,
  sendEmailVerification,
  sendMagicLinkEmail,
  sendPasswordReset,
  sendTwoFactorOtp,
} from './email/index.js';
import { ac, roles } from './permissions.js';
import { prisma } from './prisma.js';
import { redis } from './redis.js';

/**
 * Better Auth server instance.
 * Configured with email/password, OAuth (GitHub + Google), 2FA, magic links,
 * passkeys, username support, and admin management.
 */

if (!env.BETTER_AUTH_SECRET) {
  logger.warn('BETTER_AUTH_SECRET ausente — rotas de auth ficam inativas até configurar.');
}

type SocialProviders = NonNullable<BetterAuthOptions['socialProviders']>;
const socialProviders: SocialProviders = {};
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  };
}
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  appName: env.APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Redis como secondary storage: acelera a leitura de sessões e serve de store
  // do rate-limit (unifica com a camada Fastify `@fastify/rate-limit`). As
  // sessões seguem persistidas no Postgres via `session.storeSessionInDatabase`.
  secondaryStorage: {
    get: async (key) => (await redis.get(key)) ?? null,
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, 'EX', ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset({ to: user.email, name: user.name, url });
    },

    // Prevents user enumeration on sign-in when requireEmailVerification is true
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: 'USER',
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set(
        'callbackURL',
        `${env.APP_URL}/email-verified?email=${encodeURIComponent(user.email)}`,
      );
      await sendEmailVerification({
        to: user.email,
        name: user.name,
        url: verificationUrl.toString(),
      });
    },
  },

  socialProviders,

  rateLimit: {
    enabled: true, // default do Better Auth só liga em produção; ativamos em todos os ambientes
    window: 60,
    max: 100,
    storage: 'secondary-storage',
    customRules: {
      // Teto estrito nos endpoints sensíveis a brute-force (path-aware).
      '/sign-in/email': RATE_LIMIT.AUTH,
      '/sign-up/email': RATE_LIMIT.AUTH,
      '/forget-password': RATE_LIMIT.AUTH,
      '/reset-password': RATE_LIMIT.AUTH,
      '/two-factor/*': RATE_LIMIT.AUTH,
      // getSession roda em toda rota protegida (requireAuth) — não limitar.
      '/get-session': false,
      '/get-session*': false,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh token if older than 1 day
    // Leitura de sessão vem do Redis (secondaryStorage); manter também no Postgres
    // preserva o histórico durável e o model `Session` do schema.
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const verificationUrl = new URL(url);
        verificationUrl.searchParams.set('callbackURL', `${env.APP_URL}/profile`);
        await sendChangeEmailVerification({
          to: user.email,
          name: user.name,
          newEmail,
          url: verificationUrl.toString(),
        });
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github', 'google'],
      allowDifferentEmails: true,
    },
  },

  trustedOrigins: env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [],

  plugins: [
    twoFactor({
      issuer: env.APP_NAME,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendTwoFactorOtp({ to: user.email, name: user.name, otp });
        },
      },
    }),

    username(),

    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),

    admin({
      ac,
      roles,
      defaultRole: 'USER',
      adminRoles: ['ADMIN'],
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),

    passkey(),
  ],

  advanced: {
    cookiePrefix: 'ba',
    useSecureCookies: env.NODE_ENV === 'production',
  },
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
