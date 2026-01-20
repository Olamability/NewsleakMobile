# Testing and Linting Guide

This document describes the testing and linting infrastructure for the News Arena mobile app.

## Overview

The project uses:
- **Jest** with **jest-expo** preset for testing
- **React Native Testing Library** for component testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking

## Available Scripts

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without modifying files
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checker
npm run typecheck
```

### Validation

```bash
# Run type checking, linting, and tests together
npm run validate
```

## Testing Setup

### Configuration

Tests are configured in:
- `jest.config.js` - Jest configuration with expo preset
- `jest.setup.js` - Global test setup and mocks

### Writing Tests

Test files should be placed in `__tests__` directories or named with `.test.ts` or `.test.tsx` extensions.

Example test structure:

```typescript
import { YourService } from '../your-service';

describe('YourService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const input = { /* ... */ };
      
      // Act
      const result = await YourService.methodName(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### Mocked Dependencies

The following are automatically mocked in `jest.setup.js`:
- `@react-native-async-storage/async-storage`
- `expo-secure-store`
- `react-native-url-polyfill`
- Supabase client

## ESLint Configuration

ESLint is configured with:
- TypeScript support via `@typescript-eslint`
- React and React Hooks rules
- Prettier integration
- Expo and React Native best practices

### Key Rules

- TypeScript `any` usage triggers warnings (not errors)
- Unused variables trigger warnings with exceptions for variables starting with `_`
- Console statements are allowed for `console.warn` and `console.error`
- React imports are not required (automatic JSX runtime)

### Ignored Files

The following are automatically ignored:
- `node_modules/`
- `.expo/`
- `dist/`
- `web-build/`
- `coverage/`
- Configuration files (jest.config.js, babel.config.js, etc.)

## Prettier Configuration

Prettier is configured with:
- Single quotes for strings
- 2-space indentation
- 100 character line width
- Trailing commas in ES5-compatible locations
- Semicolons required

Configuration file: `.prettierrc.js`

## Continuous Integration

The `validate` script can be used in CI/CD pipelines to ensure:
1. TypeScript compiles without errors
2. Code passes linting rules
3. All tests pass

Example GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Validate
  run: npm run validate
```

## Best Practices

1. **Write tests for all services and utilities**
   - Aim for high coverage on business logic
   - Mock external dependencies

2. **Run lint before committing**
   - Use `npm run lint:fix` to auto-fix issues
   - Address remaining warnings

3. **Keep tests fast**
   - Mock heavy dependencies
   - Use unit tests over integration tests where possible

4. **Update mocks when dependencies change**
   - Keep `jest.setup.js` in sync with actual APIs

5. **Use TypeScript strictly**
   - Avoid `any` types when possible
   - Define proper interfaces and types

## Troubleshooting

### Tests failing with module not found

Ensure all dependencies are installed:
```bash
npm install
```

### ESLint complaining about configuration

Make sure you're using the flat config format (eslint.config.js) for ESLint 9+.

### Prettier and ESLint conflicts

The `eslint-config-prettier` package is configured to disable conflicting rules. If issues persist, run:
```bash
npm run format
npm run lint:fix
```

### TypeScript errors in tests

Ensure `@types/jest` is installed and test files are included in your tsconfig.json patterns.

## Example Test File

See `src/services/__tests__/auth.service.test.ts` for a comprehensive example of service testing with:
- Mocked dependencies
- Multiple test cases per method
- Error handling tests
- Edge case coverage
