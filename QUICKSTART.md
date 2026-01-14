# Quick Start Guide

Get up and running with Spazr News Aggregator in 5 minutes!

## Prerequisites

- **Node.js 16+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **Expo Go** app on your phone (optional, for testing)

## 5-Minute Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/Olamability/NewsleakMobile.git
cd NewsleakMobile

# Run automated setup
./setup.sh

# Or manually:
npm install
cp .env.example .env
```

### 2. Configure Supabase (2 minutes)

**Quick Option:**
1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project (takes ~2 minutes)
3. Copy Project URL and anon key from Settings > API
4. Paste into `.env` file

**Skip Supabase for Now:**
You can start the app without Supabase to see the UI, but features requiring backend won't work.

### 3. Start the App (1 minute)

```bash
npm start
```

Then:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## What You Get

✅ **Working UI** - All screens and components
✅ **Navigation** - Full app navigation flow
✅ **Splash Screen** - Animated splash screen
✅ **Category System** - 9 news categories
✅ **Search Interface** - Search UI (needs backend data)
✅ **Authentication Screens** - Sign up/in forms
✅ **Profile Management** - User profile screen

## Adding Real Data

To get real news articles, you need to:

1. **Set up Supabase** (see CONFIGURATION.md)
2. **Create database tables** (SQL provided in docs)
3. **Add sample data** (SQL provided in docs)
4. **Connect RSS feeds** (future enhancement)

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed backend setup.

## Testing the App

Without backend (UI only):
- ✅ View all screens
- ✅ Test navigation
- ✅ See UI components
- ❌ Can't load articles
- ❌ Can't authenticate

With Supabase configured:
- ✅ Everything works!
- ✅ Load real articles
- ✅ Sign up/sign in
- ✅ Bookmark articles
- ✅ Search articles

## Common Issues

**"Can't find .env file"**
```bash
cp .env.example .env
```

**"Metro bundler error"**
```bash
npm start -- --clear
```

**"Module not found"**
```bash
rm -rf node_modules
npm install
```

**"Supabase connection error"**
- Check your .env has correct credentials
- Verify Supabase project is active
- Check internet connection

## Next Steps

1. **Explore the Code**
   - Check out `src/screens/` for screen components
   - Look at `src/components/` for reusable UI
   - Review `src/services/` for API logic

2. **Read the Docs**
   - [README.md](./README.md) - Full documentation
   - [CONFIGURATION.md](./CONFIGURATION.md) - Backend setup
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Dev workflow

3. **Start Building**
   - Add your own features
   - Customize the UI
   - Connect to real news sources

## Getting Help

- 📖 Check the documentation
- 🐛 Report bugs on GitHub
- 💬 Join discussions
- 📧 Email: support@spazr.com.ng

## Development Tools

**Recommended:**
- VS Code with React Native Tools extension
- React Developer Tools (Chrome extension)
- Expo Go app for testing
- Android Studio for Android development
- Xcode for iOS development (Mac only)

## Project Structure

```
NewsleakMobile/
├── src/
│   ├── components/     # Reusable UI
│   ├── screens/        # App screens
│   ├── services/       # API logic
│   ├── navigation/     # Navigation setup
│   ├── context/        # Global state
│   └── constants/      # App constants
├── assets/            # Images, fonts
├── App.tsx           # Entry point
└── app.json          # Expo config
```

## Available Scripts

```bash
npm start           # Start dev server
npm run android     # Run on Android
npm run ios         # Run on iOS (Mac only)
npm run web         # Run on web
npx tsc --noEmit   # Type check
```

## Features Overview

### ✨ Implemented
- News feed with pagination
- 9 category system
- Search functionality
- User authentication
- Bookmark system
- Article preview & reading
- Profile management
- Responsive UI

### 🔮 Coming Soon
- Push notifications
- Offline reading
- Dark mode
- Social sharing
- RSS integration
- Admin panel

## Quick Tips

💡 **Use hot reload**: Save files to see changes instantly
💡 **Shake device**: Open developer menu
💡 **Check console**: Press Cmd+D (iOS) or Cmd+M (Android)
💡 **Clear cache**: Use `npm start -- --clear` if things break

## Ready to Deploy?

When you're ready for production:

1. Configure production Supabase
2. Add real news sources
3. Build with EAS: `eas build`
4. Submit to stores: `eas submit`

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for details.

---

**That's it!** You're ready to start building. 🚀

Happy coding!
