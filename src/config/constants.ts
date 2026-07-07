export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 dias
  RESET_PASSWORD_EXPIRY_MINUTES: 60,
  BCRYPT_ROUNDS: 12,
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  PRODUCTS: 60 * 5,    // 5 min
  CATEGORIES: 60 * 60, // 1h
  SHIPPING: 60 * 60,   // 1h
  USER: 60 * 15,       // 15 min
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const RATE_LIMIT = {
  GLOBAL: { max: 100, timeWindow: '1 minute' },
  AUTH: { max: 5, timeWindow: '1 minute' },
} as const;
