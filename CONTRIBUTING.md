# Contributing to Spazr News Aggregator

First off, thank you for considering contributing to Spazr News Aggregator! It's people like you that make this app better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@spazr.com.ng.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what behavior you expected
- **Include screenshots or animated GIFs** if possible
- **Include your environment details** (OS, device, React Native version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any examples** of how this enhancement could be implemented

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our style guidelines
3. **Add tests** if applicable
4. **Ensure the test suite passes**
5. **Make sure your code lints**
6. **Update documentation** if needed
7. **Write a clear commit message**

## Development Process

### Setting Up Development Environment

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for detailed setup instructions.

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-queries`)
- `test/` - Adding or updating tests (e.g., `test/add-auth-tests`)

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```
feat(auth): add password reset functionality

fix(news): resolve infinite scroll pagination issue

docs(readme): update installation instructions

refactor(api): improve error handling in news service
```

### Code Style Guidelines

#### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **functional programming** principles where possible
- Use **async/await** over promises
- Prefer **const** over **let**, avoid **var**
- Use **arrow functions** for simple functions
- Add **JSDoc comments** for complex functions
- Use **meaningful variable names**

Example:
```typescript
/**
 * Fetch paginated news articles from the API
 * @param page - Page number to fetch
 * @param limit - Number of articles per page
 * @returns Promise resolving to paginated articles
 */
const fetchArticles = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<NewsArticle>> => {
  // Implementation
};
```

#### React/React Native

- Use **functional components** with hooks
- Keep components **small and focused**
- Extract **reusable logic into custom hooks**
- Use **TypeScript interfaces** for props
- Follow the **component file structure**:
  1. Imports
  2. Types/Interfaces
  3. Component
  4. Styles

Example:
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

#### File Organization

```
src/
├── components/      # Reusable UI components
├── screens/         # Screen components
├── services/        # API and business logic
├── context/         # Global state
├── navigation/      # Navigation setup
├── constants/       # Constants and configs
├── types/          # TypeScript types
└── utils/          # Helper functions
```

### Testing

- Write tests for new features
- Update tests when modifying existing code
- Ensure all tests pass before submitting PR
- Aim for high test coverage

### Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update CONFIGURATION.md for setup changes
- Include inline comments for complex logic

## Pull Request Process

1. **Update documentation** with details of changes
2. **Update the README.md** if needed
3. **Ensure all tests pass**
4. **Update version numbers** if applicable
5. **Request review** from maintainers
6. **Address review comments**
7. **Squash commits** if requested
8. **Wait for approval** before merging

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Style Guide

### Component Naming
- PascalCase for component names
- Descriptive names that indicate purpose
- Add "Screen" suffix for screen components
- Add "Context" suffix for context providers

### File Naming
- PascalCase for component files
- camelCase for utility files
- Match file name with main export

### Styling
- Use StyleSheet.create() for styles
- Follow consistent spacing (theme.ts)
- Group related styles together
- Use theme colors, not hardcoded values

## Getting Help

- Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- Review [CONFIGURATION.md](./CONFIGURATION.md)
- Search existing issues
- Ask in GitHub discussions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
