export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    specialCharPattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    message: {
      minLength: 'Password must be at least 8 characters long',
      uppercase: 'Password must contain at least one uppercase letter',
      lowercase: 'Password must contain at least one lowercase letter',
      number: 'Password must contain at least one number',
      specialChar: 'Password must contain at least one special character',
      maxLength: 'Password must not exceed 128 characters',
    },
  },
  url: {
    pattern:
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    maxLength: 2048,
    message: 'Please enter a valid URL starting with http:// or https://',
  },
  rssUrl: {
    pattern:
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    maxLength: 2048,
    allowedExtensions: ['.xml', '.rss', '.atom'],
    message: 'Please enter a valid RSS feed URL',
  },
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
  searchQuery: {
    minLength: 1,
    maxLength: 200,
    message: 'Search query must be between 1 and 200 characters',
  },
  input: {
    general: {
      maxLength: 1000,
      message: 'Input is too long',
    },
    title: {
      maxLength: 200,
      message: 'Title is too long',
    },
    description: {
      maxLength: 5000,
      message: 'Description is too long',
    },
  },
} as const;

export const SQL_INJECTION_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
  /(\bUNION\b.*\bSELECT\b)/gi,
  /(;|\-\-|\/\*|\*\/)/g,
  /(\bOR\b.*=.*|1=1|'=')/gi,
  /(\bEXEC\b|\bEXECUTE\b)/gi,
] as const;

export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript:/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
] as const;

export const RATE_LIMIT_CONFIG = {
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;
