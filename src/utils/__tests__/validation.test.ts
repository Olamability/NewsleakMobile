import {
  validateEmail,
  validatePassword,
  validateUrl,
  validateRssUrl,
  sanitizeUrl,
  sanitizeHtml,
  validateLength,
  containsSqlInjection,
  containsXss,
  sanitizeSearchQuery,
  validateName,
  validateSearchQuery,
  sanitizeInput,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name@example.co.uk').isValid).toBe(true);
      expect(validateEmail('test+tag@example.com').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('invalid').isValid).toBe(false);
      expect(validateEmail('test@').isValid).toBe(false);
      expect(validateEmail('@example.com').isValid).toBe(false);
      expect(validateEmail('test@example').isValid).toBe(false);
      expect(validateEmail('test@@example.com').isValid).toBe(false);
      expect(validateEmail('test@test@example.com').isValid).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail).isValid).toBe(false);
    });

    it('should provide error messages', () => {
      const result = validateEmail('invalid');
      expect(result.error).toBeDefined();
    });

    it('should trim whitespace', () => {
      expect(validateEmail('  test@example.com  ').isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBeDefined();
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePassword('weakpass123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('uppercase');
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePassword('WEAKPASS123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('WeakPass!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('WeakPass123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('special character');
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Wp@1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('8 characters');
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'A1@' + 'a'.repeat(130);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('128 characters');
    });

    it('should provide password strength', () => {
      const weak = validatePassword('WeakP@ss1');
      const strong = validatePassword('VeryStr0ng!P@ssw0rd123');
      expect(weak.strength).toBeDefined();
      expect(strong.strength).toBe('strong');
    });

    it('should provide validation details', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.details).toEqual({
        hasMinLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
        hasSpecialChar: true,
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://example.com').isValid).toBe(true);
      expect(validateUrl('https://sub.example.com/path').isValid).toBe(true);
      expect(validateUrl('https://example.com?param=value').isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('').isValid).toBe(false);
      expect(validateUrl('not-a-url').isValid).toBe(false);
      expect(validateUrl('ftp://example.com').isValid).toBe(false);
      expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      expect(validateUrl(longUrl).isValid).toBe(false);
    });
  });

  describe('validateRssUrl', () => {
    it('should validate RSS feed URLs', () => {
      expect(validateRssUrl('https://example.com/feed.xml').isValid).toBe(true);
      expect(validateRssUrl('https://example.com/rss').isValid).toBe(true);
    });

    it('should reject invalid RSS URLs', () => {
      expect(validateRssUrl('').isValid).toBe(false);
      expect(validateRssUrl('not-a-url').isValid).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should sanitize valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com/');
    });

    it('should return empty string for invalid URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('not-a-url')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeUrl(null as any)).toBe('');
      expect(sanitizeUrl(undefined as any)).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeHtml(html);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    it('should remove iframe tags', () => {
      const html = '<iframe src="evil.com"></iframe>Hello';
      const sanitized = sanitizeHtml(html);
      expect(sanitized).not.toContain('<iframe>');
    });

    it('should escape HTML entities', () => {
      const html = '<div>Test & "quotes"</div>';
      const sanitized = sanitizeHtml(html);
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
    });

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
    });
  });

  describe('validateLength', () => {
    it('should validate input within length constraints', () => {
      expect(validateLength('Hello', 1, 10).isValid).toBe(true);
    });

    it('should reject input that is too short', () => {
      const result = validateLength('Hi', 5, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 5 characters');
    });

    it('should reject input that is too long', () => {
      const result = validateLength('This is a long text', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not exceed 10 characters');
    });

    it('should use custom field name in error messages', () => {
      const result = validateLength('', 1, 10, 'Username');
      expect(result.error).toContain('Username');
    });
  });

  describe('containsSqlInjection', () => {
    it('should detect SQL injection patterns', () => {
      expect(containsSqlInjection('SELECT * FROM users')).toBe(true);
      expect(containsSqlInjection("'; DROP TABLE users--")).toBe(true);
      expect(containsSqlInjection("1' OR 1=1--")).toBe(true);
      expect(containsSqlInjection('UNION SELECT password')).toBe(true);
    });

    it('should allow normal text', () => {
      expect(containsSqlInjection('normal search query')).toBe(false);
      expect(containsSqlInjection('hello world')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(containsSqlInjection('')).toBe(false);
      expect(containsSqlInjection(null as any)).toBe(false);
    });
  });

  describe('containsXss', () => {
    it('should detect XSS patterns', () => {
      expect(containsXss('<script>alert(1)</script>')).toBe(true);
      expect(containsXss('<iframe src="evil.com"></iframe>')).toBe(true);
      expect(containsXss('javascript:alert(1)')).toBe(true);
      expect(containsXss('<div onclick="alert(1)">Click</div>')).toBe(true);
    });

    it('should allow normal text', () => {
      expect(containsXss('normal text')).toBe(false);
      expect(containsXss('hello world')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(containsXss('')).toBe(false);
      expect(containsXss(null as any)).toBe(false);
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize valid search queries', () => {
      expect(sanitizeSearchQuery('hello world')).toBe('hello world');
      expect(sanitizeSearchQuery('  hello   world  ')).toBe('hello world');
    });

    it('should remove dangerous characters', () => {
      const query = sanitizeSearchQuery('hello<script>world');
      expect(query).not.toContain('<');
      expect(query).not.toContain('>');
    });

    it('should return empty string for SQL injection attempts', () => {
      expect(sanitizeSearchQuery('SELECT * FROM users')).toBe('');
      expect(sanitizeSearchQuery("'; DROP TABLE--")).toBe('');
    });

    it('should return empty string for XSS attempts', () => {
      expect(sanitizeSearchQuery('<script>alert(1)</script>')).toBe('');
    });

    it('should limit query length', () => {
      const longQuery = 'a'.repeat(300);
      const sanitized = sanitizeSearchQuery(longQuery);
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('John Doe').isValid).toBe(true);
      expect(validateName("Mary O'Connor").isValid).toBe(true);
      expect(validateName('Jean-Pierre').isValid).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateName('').isValid).toBe(false);
      expect(validateName('   ').isValid).toBe(false);
    });

    it('should reject names with invalid characters', () => {
      expect(validateName('John123').isValid).toBe(false);
      expect(validateName('John@Doe').isValid).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(150);
      expect(validateName(longName).isValid).toBe(false);
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate normal search queries', () => {
      expect(validateSearchQuery('hello world').isValid).toBe(true);
      expect(validateSearchQuery('news').isValid).toBe(true);
    });

    it('should reject empty queries', () => {
      expect(validateSearchQuery('').isValid).toBe(false);
      expect(validateSearchQuery('   ').isValid).toBe(false);
    });

    it('should reject queries with SQL injection', () => {
      expect(validateSearchQuery('SELECT * FROM users').isValid).toBe(false);
    });

    it('should reject queries with XSS', () => {
      expect(validateSearchQuery('<script>alert(1)</script>').isValid).toBe(false);
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(250);
      expect(validateSearchQuery(longQuery).isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize normal input', () => {
      expect(sanitizeInput('hello world')).toBe('hello world');
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should remove dangerous characters', () => {
      const input = sanitizeInput('hello<world>');
      expect(input).not.toContain('<');
      expect(input).not.toContain('>');
    });

    it('should return empty string for SQL injection', () => {
      expect(sanitizeInput('SELECT * FROM users')).toBe('');
    });

    it('should return empty string for XSS', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('');
    });

    it('should respect max length', () => {
      const input = 'a'.repeat(100);
      const sanitized = sanitizeInput(input, 50);
      expect(sanitized.length).toBe(50);
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
    });
  });
});
