import { RATE_LIMIT_CONFIG } from '../constants/validation';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

interface ThrottleEntry {
  lastCall: number;
  callCount: number;
  resetTime: number;
}

// NOTE: In-memory storage will not persist across app restarts
// For production use, consider using AsyncStorage or a persistent solution
const rateLimitStore = new Map<string, RateLimitEntry>();
const throttleStore = new Map<string, ThrottleEntry>();

/**
 * Check if action is rate limited
 */
export const checkRateLimit = (
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'api'
): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${type}_${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
    });
    return { allowed: true };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  const windowExpired = now - entry.firstAttempt > config.windowMs;

  if (windowExpired) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
    });
    return { allowed: true };
  }

  const maxAttempts = 'maxAttempts' in config ? config.maxAttempts : config.maxRequests;

  if (entry.count >= maxAttempts) {
    const blockedUntil =
      'blockDurationMs' in config ? now + config.blockDurationMs : now + config.windowMs;

    rateLimitStore.set(key, {
      ...entry,
      blockedUntil,
    });

    const retryAfter = Math.ceil((blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  rateLimitStore.set(key, {
    ...entry,
    count: entry.count + 1,
  });

  return { allowed: true };
};

/**
 * Reset rate limit for identifier
 */
export const resetRateLimit = (
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'api'
): void => {
  const key = `${type}_${identifier}`;
  rateLimitStore.delete(key);
};

/**
 * Throttle function calls
 */
export const throttle = <T extends (...args: unknown[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  const key = func.toString();

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    const entry = throttleStore.get(key);

    if (!entry) {
      throttleStore.set(key, {
        lastCall: now,
        callCount: 1,
        resetTime: now + limit,
      });
      return func.apply(this, args);
    }

    if (now < entry.resetTime) {
      return undefined;
    }

    throttleStore.set(key, {
      lastCall: now,
      callCount: 1,
      resetTime: now + limit,
    });

    return func.apply(this, args);
  };
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

/**
 * Validate JWT token format (basic check)
 */
export const validateTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      if (!/^[A-Za-z0-9_-]+$/.test(part)) {
        throw new Error('Invalid token format');
      }
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate token expiration
 * NOTE: Uses Buffer for base64 decoding which requires react-native-url-polyfill
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    if (!validateTokenFormat(token)) {
      return true;
    }

    const parts = token.split('.');
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

    // Validate base64 format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Payload)) {
      return true;
    }

    // Decode base64 payload
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

    if (!payload.exp) {
      return false;
    }

    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

/**
 * Generate secure headers for API requests
 */
export const generateSecureHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };

  if (token && validateTokenFormat(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Clear all rate limit data
 */
export const clearRateLimits = (): void => {
  rateLimitStore.clear();
};

/**
 * Clear all throttle data
 */
export const clearThrottles = (): void => {
  throttleStore.clear();
};

/**
 * Get remaining rate limit attempts
 */
export const getRemainingAttempts = (
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'api'
): number => {
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${type}_${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    const maxAttempts = 'maxAttempts' in config ? config.maxAttempts : config.maxRequests;
    return maxAttempts;
  }

  const now = Date.now();
  const windowExpired = now - entry.firstAttempt > config.windowMs;

  if (windowExpired || (entry.blockedUntil && now >= entry.blockedUntil)) {
    const maxAttempts = 'maxAttempts' in config ? config.maxAttempts : config.maxRequests;
    return maxAttempts;
  }

  const maxAttempts = 'maxAttempts' in config ? config.maxAttempts : config.maxRequests;
  return Math.max(0, maxAttempts - entry.count);
};

/**
 * Create a request fingerprint for rate limiting
 */
export const createRequestFingerprint = (
  userId?: string,
  deviceId?: string,
  ipAddress?: string
): string => {
  const components = [userId, deviceId, ipAddress].filter(Boolean);
  return components.join('_') || 'anonymous';
};
