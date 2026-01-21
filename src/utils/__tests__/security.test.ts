import {
  checkRateLimit,
  resetRateLimit,
  throttle,
  debounce,
  validateTokenFormat,
  isTokenExpired,
  generateSecureHeaders,
  clearRateLimits,
  getRemainingAttempts,
  createRequestFingerprint,
} from '../security';

describe('Security Utils', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('user1', 'api');
      expect(result.allowed).toBe(true);
    });

    it('should track multiple requests', () => {
      checkRateLimit('user1', 'api');
      checkRateLimit('user1', 'api');
      const result = checkRateLimit('user1', 'api');
      expect(result.allowed).toBe(true);
    });

    it('should block after exceeding limit', () => {
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user1', 'api');
      }
      const result = checkRateLimit('user1', 'api');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should handle different rate limit types', () => {
      const authResult = checkRateLimit('user1', 'auth');
      const searchResult = checkRateLimit('user2', 'search');
      expect(authResult.allowed).toBe(true);
      expect(searchResult.allowed).toBe(true);
    });

    it('should separate limits by identifier', () => {
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user1', 'api');
      }
      const user1Result = checkRateLimit('user1', 'api');
      const user2Result = checkRateLimit('user2', 'api');

      expect(user1Result.allowed).toBe(false);
      expect(user2Result.allowed).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user1', 'api');
      }
      let result = checkRateLimit('user1', 'api');
      expect(result.allowed).toBe(false);

      resetRateLimit('user1', 'api');
      result = checkRateLimit('user1', 'api');
      expect(result.allowed).toBe(true);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for new identifier', () => {
      const remaining = getRemainingAttempts('user1', 'api');
      expect(remaining).toBe(100);
    });

    it('should decrease remaining attempts', () => {
      checkRateLimit('user1', 'api');
      checkRateLimit('user1', 'api');
      const remaining = getRemainingAttempts('user1', 'api');
      expect(remaining).toBe(98);
    });

    it('should return 0 when limit is reached', () => {
      for (let i = 0; i < 101; i++) {
        checkRateLimit('user1', 'api');
      }
      const remaining = getRemainingAttempts('user1', 'api');
      expect(remaining).toBe(0);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 100);

      throttled();
      throttled();
      throttled();

      expect(callCount).toBe(1);

      setTimeout(() => {
        throttled();
        expect(callCount).toBe(2);
        done();
      }, 150);
    });

    it('should pass arguments to throttled function', () => {
      let lastArg: any;
      const throttled = throttle((arg: unknown) => {
        lastArg = arg;
      }, 100);

      throttled('test');
      expect(lastArg).toBe('test');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debounced = debounce(() => {
        callCount++;
      }, 100);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should pass arguments to debounced function', (done) => {
      let lastArg: any;
      const debounced = debounce((arg: unknown) => {
        lastArg = arg;
      }, 100);

      debounced('test1');
      debounced('test2');
      debounced('test3');

      setTimeout(() => {
        expect(lastArg).toBe('test3');
        done();
      }, 150);
    });
  });

  describe('validateTokenFormat', () => {
    it('should validate correct JWT format', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(validateTokenFormat(token)).toBe(true);
    });

    it('should reject invalid token format', () => {
      expect(validateTokenFormat('invalid')).toBe(false);
      expect(validateTokenFormat('invalid.token')).toBe(false);
      expect(validateTokenFormat('')).toBe(false);
    });

    it('should reject non-string input', () => {
      expect(validateTokenFormat(null as any)).toBe(false);
      expect(validateTokenFormat(undefined as any)).toBe(false);
    });

    it('should reject tokens with invalid characters', () => {
      const token = 'header.payload!@#$.signature';
      expect(validateTokenFormat(token)).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired tokens', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.Ks_BdfH4CWilyzLNk8S2gDARFhuxIauLksjJGPgiqNc';
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should return true for invalid tokens', () => {
      expect(isTokenExpired('invalid')).toBe(true);
    });

    it('should handle tokens without expiration', () => {
      const tokenWithoutExp =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(isTokenExpired(tokenWithoutExp)).toBe(false);
    });
  });

  describe('generateSecureHeaders', () => {
    it('should generate basic secure headers', () => {
      const headers = generateSecureHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('should include authorization header when token is provided', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const headers = generateSecureHeaders(token);
      expect(headers['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should not include authorization header for invalid tokens', () => {
      const headers = generateSecureHeaders('invalid');
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('createRequestFingerprint', () => {
    it('should create fingerprint from multiple components', () => {
      const fingerprint = createRequestFingerprint('user123', 'device456', '192.168.1.1');
      expect(fingerprint).toBe('user123_device456_192.168.1.1');
    });

    it('should handle missing components', () => {
      const fingerprint = createRequestFingerprint('user123', undefined, '192.168.1.1');
      expect(fingerprint).toBe('user123_192.168.1.1');
    });

    it('should return anonymous for no components', () => {
      const fingerprint = createRequestFingerprint();
      expect(fingerprint).toBe('anonymous');
    });

    it('should handle single component', () => {
      const fingerprint = createRequestFingerprint('user123');
      expect(fingerprint).toBe('user123');
    });
  });
});
