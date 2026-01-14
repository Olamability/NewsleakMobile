# Developer Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher): [Download](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **Git**: [Download](https://git-scm.com/)
- **Expo CLI**: Install with `npm install -g expo-cli`
- **iOS Simulator** (Mac only): Install Xcode from App Store
- **Android Studio**: [Download](https://developer.android.com/studio) for Android development

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Olamability/NewsleakMobile.git
cd NewsleakMobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# You can get these from https://supabase.com
```

Your `.env` should look like:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 4. Set Up Supabase

Follow the detailed instructions in [CONFIGURATION.md](./CONFIGURATION.md) to:
- Create a Supabase project
- Set up database tables
- Configure RLS policies
- Add sample data (optional)

### 5. Start Development Server

```bash
npm start
```

This will open Expo DevTools in your browser.

### 6. Run on Device/Simulator

From the Expo DevTools, you can:

**For iOS (Mac only):**
```bash
npm run ios
```
Or press `i` in the terminal

**For Android:**
```bash
npm run android
```
Or press `a` in the terminal

**For Web:**
```bash
npm run web
```
Or press `w` in the terminal

**Using Expo Go App:**
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal
3. App will load on your device

## Project Structure

```
NewsleakMobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── NewsCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── index.ts
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── CategoryListScreen.tsx
│   │   ├── CategoryFeedScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ArticleDetailScreen.tsx
│   │   ├── ArticleWebViewScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── services/          # API and business logic
│   │   ├── supabase.ts
│   │   ├── auth.service.ts
│   │   ├── news.service.ts
│   │   └── bookmark.service.ts
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── context/           # Global state management
│   │   └── AuthContext.tsx
│   ├── constants/         # App constants
│   │   ├── theme.ts
│   │   └── categories.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── App.tsx              # App entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Development Workflow

### Making Changes

1. **Create a new branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Edit files in `src/` directory
- Follow the existing code style
- Add comments for complex logic

3. **Test your changes**
- Run the app and test manually
- Check for console errors
- Test on both iOS and Android if possible

4. **Commit your changes**
```bash
git add .
git commit -m "Add: your feature description"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

### Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **functional components** with hooks
- Use **async/await** for asynchronous operations
- Keep components **small and focused**
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Follow the **existing folder structure**

### Naming Conventions

- **Components**: PascalCase (e.g., `NewsCard.tsx`)
- **Functions**: camelCase (e.g., `fetchArticles`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `NewsArticle`)
- **Files**: PascalCase for components, camelCase for utilities

## Debugging

### Enable Remote Debugging

1. Shake your device (or press `Cmd+D` on iOS, `Cmd+M` on Android)
2. Select "Debug JS Remotely"
3. Open Chrome DevTools (http://localhost:19000/debugger-ui)

### View Logs

```bash
# View all logs
npm start

# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Common Issues

**Metro Bundler Issues:**
```bash
# Clear cache
expo start -c
# or
npm start -- --clear
```

**Node Modules Issues:**
```bash
rm -rf node_modules
npm install
```

**iOS Build Issues:**
```bash
cd ios
pod install
cd ..
```

## Testing

### Manual Testing Checklist

- [ ] Splash screen appears
- [ ] Home screen loads articles
- [ ] Can scroll and load more articles
- [ ] Can pull to refresh
- [ ] Category navigation works
- [ ] Search functionality works
- [ ] Can bookmark articles (when signed in)
- [ ] Can view bookmarked articles
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Profile screen displays user info
- [ ] Sign out works
- [ ] Article detail view works
- [ ] WebView opens article correctly
- [ ] UTM parameters are added to article URLs

### Testing on Different Platforms

**iOS Testing:**
```bash
npm run ios
```

**Android Testing:**
```bash
npm run android
```

**Web Testing:**
```bash
npm run web
```

## Building for Production

### Prerequisites for Building

1. Create an Expo account: https://expo.dev/signup
2. Install EAS CLI:
```bash
npm install -g eas-cli
```

3. Login to Expo:
```bash
eas login
```

### Configure EAS Build

```bash
eas build:configure
```

### Build for Android

```bash
# Build APK for internal testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### Build for iOS

```bash
# Build for TestFlight
eas build --platform ios --profile production
```

### Submit to Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

## Useful Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Type checking
npx tsc --noEmit

# Format code (if prettier is configured)
npm run format

# Lint code (if eslint is configured)
npm run lint

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Getting Help

- Check the [README.md](./README.md) for general information
- Review [CONFIGURATION.md](./CONFIGURATION.md) for setup issues
- Check existing issues on GitHub
- Create a new issue if you find a bug
- Join our community discussions

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Make sure your PR:
- Has a clear description
- Follows the code style
- Includes relevant tests
- Updates documentation if needed

Happy coding! 🚀
