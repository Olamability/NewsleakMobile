import { VALIDATION_RULES, SQL_INJECTION_PATTERNS, XSS_PATTERNS } from '../constants/validation';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordValidationResult extends ValidationResult {
  strength?: 'weak' | 'medium' | 'strong';
  details?: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (trimmedEmail.length > VALIDATION_RULES.email.maxLength) {
    return { isValid: false, error: 'Email is too long' };
  }

  if (!VALIDATION_RULES.email.pattern.test(trimmedEmail)) {
    return { isValid: false, error: VALIDATION_RULES.email.message };
  }

  const atSymbolCount = (trimmedEmail.match(/@/g) || []).length;
  if (atSymbolCount !== 1) {
    return { isValid: false, error: 'Email format is invalid' };
  }

  const [localPart, domain] = trimmedEmail.split('@');
  if (localPart.length > 64 || domain.length > 255) {
    return { isValid: false, error: 'Email format is invalid' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  const hasMinLength = password.length >= VALIDATION_RULES.password.minLength;
  const hasMaxLength = password.length <= VALIDATION_RULES.password.maxLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = VALIDATION_RULES.password.specialCharPattern.test(password);

  const details = {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };

  if (!hasMinLength) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.minLength,
      details,
    };
  }

  if (!hasMaxLength) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.maxLength,
      details,
    };
  }

  if (!hasUppercase) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.uppercase,
      details,
    };
  }

  if (!hasLowercase) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.lowercase,
      details,
    };
  }

  if (!hasNumber) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.number,
      details,
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      error: VALIDATION_RULES.password.message.specialChar,
      details,
    };
  }

  const strength = calculatePasswordStrength(password, details);

  return { isValid: true, strength, details };
};

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (
  password: string,
  details: PasswordValidationResult['details']
): 'weak' | 'medium' | 'strong' => {
  let score = 0;

  if (details?.hasMinLength) score++;
  if (details?.hasUppercase) score++;
  if (details?.hasLowercase) score++;
  if (details?.hasNumber) score++;
  if (details?.hasSpecialChar) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (score <= 4) return 'weak';
  if (score <= 6) return 'medium';
  return 'strong';
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  if (trimmedUrl.length > VALIDATION_RULES.url.maxLength) {
    return { isValid: false, error: 'URL is too long' };
  }

  if (!VALIDATION_RULES.url.pattern.test(trimmedUrl)) {
    return { isValid: false, error: VALIDATION_RULES.url.message };
  }

  try {
    const urlObject = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
  } catch {
    return { isValid: false, error: VALIDATION_RULES.url.message };
  }

  return { isValid: true };
};

/**
 * Validate RSS feed URL
 */
export const validateRssUrl = (url: string): ValidationResult => {
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    return urlValidation;
  }

  // Additional RSS-specific validation
  const lowerUrl = url.toLowerCase();
  const hasRssIndicator =
    lowerUrl.includes('/rss') ||
    lowerUrl.includes('/feed') ||
    lowerUrl.includes('.xml') ||
    lowerUrl.includes('.rss') ||
    lowerUrl.includes('/atom');

  if (!hasRssIndicator) {
    return {
      isValid: true,
    };
  }

  return { isValid: true };
};

/**
 * Sanitize URL to prevent XSS and injection attacks
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim();

  try {
    const urlObject = new URL(trimmedUrl);

    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return '';
    }

    return urlObject.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // First escape HTML entities to prevent injection
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Then remove any XSS patterns that might still exist
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

/**
 * Validate input length
 */
export const validateLength = (
  input: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'Input'
): ValidationResult => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Check for SQL injection patterns
 */
export const containsSqlInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
};

/**
 * Check for XSS patterns
 */
export const containsXss = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return XSS_PATTERNS.some((pattern) => pattern.test(input));
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  let sanitized = query.trim();

  if (containsSqlInjection(sanitized) || containsXss(sanitized)) {
    return '';
  }

  sanitized = sanitized
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, VALIDATION_RULES.searchQuery.maxLength);

  return sanitized;
};

/**
 * Validate name (full name, username, etc.)
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < VALIDATION_RULES.name.minLength) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmedName.length > VALIDATION_RULES.name.maxLength) {
    return { isValid: false, error: 'Name is too long' };
  }

  if (!VALIDATION_RULES.name.pattern.test(trimmedName)) {
    return { isValid: false, error: VALIDATION_RULES.name.message };
  }

  return { isValid: true };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required' };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < VALIDATION_RULES.searchQuery.minLength) {
    return { isValid: false, error: 'Search query is required' };
  }

  if (trimmedQuery.length > VALIDATION_RULES.searchQuery.maxLength) {
    return { isValid: false, error: VALIDATION_RULES.searchQuery.message };
  }

  if (containsSqlInjection(trimmedQuery)) {
    return { isValid: false, error: 'Invalid search query' };
  }

  if (containsXss(trimmedQuery)) {
    return { isValid: false, error: 'Invalid search query' };
  }

  return { isValid: true };
};

/**
 * Sanitize general text input
 */
export const sanitizeInput = (input: string, maxLength?: number): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  if (containsSqlInjection(sanitized) || containsXss(sanitized)) {
    return '';
  }

  sanitized = sanitized
    .replace(/[<>]/g, '')
    .substring(0, maxLength || VALIDATION_RULES.input.general.maxLength);

  return sanitized;
};
