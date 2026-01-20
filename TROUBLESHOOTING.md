# Troubleshooting Guide

Common issues and their solutions for Spazr News Aggregator.

## Table of Contents
- [Data & Content Issues](#data--content-issues)
- [Installation Issues](#installation-issues)
- [Development Issues](#development-issues)
- [Supabase Issues](#supabase-issues)
- [Authentication Issues](#authentication-issues)
- [Navigation Issues](#navigation-issues)
- [Performance Issues](#performance-issues)
- [Build Issues](#build-issues)

---

## Data & Content Issues

### "No Articles Found" on Home Screen

**Problem:** The app displays "No articles found" even after setting up Supabase

**Root Causes & Solutions:**

#### 1. Sample Articles Not Added

The most common cause - the database has no articles.

**Solution:**
```sql
-- In Supabase SQL Editor, run:
-- First, verify schema.sql was executed
SELECT COUNT(*) FROM categories;  -- Should return 8
SELECT COUNT(*) FROM news_sources; -- Should return 5

-- If both return results, add sample articles:
-- Copy and run the entire contents of /supabase/sample-articles.sql

-- Verify articles were added:
SELECT COUNT(*) FROM news_articles;  -- Should return 20+
```

**Quick Fix:**
1. Go to Supabase SQL Editor
2. Copy contents of `/supabase/sample-articles.sql`
3. Paste and click "Run"
4. Refresh the app (pull down on home screen)

#### 2. Row Level Security (RLS) Blocking Access

**Problem:** RLS policies preventing public read access

**Solution:**
```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'news_articles';

-- If missing, add the policy:
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view articles" ON news_articles
  FOR SELECT USING (true);
```

#### 3. Incorrect Category Filtering

**Problem:** Articles exist but not showing in specific category

**Solution:**
```sql
-- Check article distribution by category
SELECT c.name, COUNT(a.id) as article_count
FROM categories c
LEFT JOIN news_articles a ON a.category_id = c.id
GROUP BY c.name;

-- If imbalanced, articles might be in wrong categories
-- Verify category_id matches between articles and categories
```

#### 4. Database Connection Issues

**Problem:** App can't connect to Supabase

**Solution:**
1. Check `.env` file has correct credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
2. Verify Supabase project is active (not paused)
3. Check browser/app console for connection errors
4. Test connection in Supabase dashboard

### No Breaking News Showing

**Problem:** Breaking News section is empty

**Solution:**
```sql
-- Check for breaking news articles
SELECT COUNT(*) FROM news_articles WHERE is_breaking = true;

-- If zero, mark some articles as breaking:
UPDATE news_articles 
SET is_breaking = true 
WHERE published_at > NOW() - INTERVAL '3 hours'
LIMIT 3;
```

### Search Returns No Results

**Problem:** Searching returns no articles even though they exist

**Solution:**
1. Verify search query length (minimum 2 characters required)
2. Check article titles/summaries contain searchable text:
   ```sql
   SELECT title, summary 
   FROM news_articles 
   WHERE title ILIKE '%tech%' OR summary ILIKE '%tech%';
   ```
3. Try simpler search terms (single words work better)

### Articles Not Updating/Refreshing

**Problem:** Pull-to-refresh doesn't fetch new articles

**Solution:**
1. Check if new articles were actually added to database
2. Verify published_at timestamps are recent
3. Clear React Query cache:
   - Close and reopen the app
   - Or add new articles with very recent timestamps

---

## Installation Issues

### Node Modules Error

**Problem:** `Cannot find module` or module errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache if still failing
npm cache clean --force
npm install
```

### Package Version Conflicts

**Problem:** Peer dependency warnings or conflicts

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force
```

### Expo CLI Not Found

**Problem:** `expo: command not found`

**Solution:**
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Or use npx
npx expo start
```

---

## Development Issues

### Metro Bundler Won't Start

**Problem:** Metro bundler fails to start or crashes

**Solution:**
```bash
# Clear Metro cache
npm start -- --clear

# Or use Expo CLI
expo start -c

# Kill any existing Metro processes
killall -9 node
npm start
```

### Metro Config Loading Error on Windows

**Problem:** `Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]` when loading Metro config on Windows
```
Error loading Metro config at: C:\Users\...\metro.config.js
Only URLs with a scheme in: file, data, and node are supported by the default ESM loader.
On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

**Solution:**
This error occurs when Metro tries to load a config file using ESM imports on Windows with newer Node.js versions. Windows absolute paths (like `C:\...`) need to be converted to proper `file://` URLs for ESM's dynamic import.

This repository includes a patch for `metro-config` that automatically converts Windows paths to valid file URLs:
- The fix is applied via `patch-package` which patches the `metro-config` package
- The patch is stored in `patches/metro-config+0.83.3.patch`
- The patch is automatically applied after `npm install` via the `postinstall` script
- No manual configuration or code changes are needed - just run `npm install` and the fix is applied

**Technical Details:**
The patch modifies `node_modules/metro-config/src/loadConfig.js` to convert Windows paths to `file://` URLs before importing:
```javascript
const pathToImport = path.isAbsolute(absolutePath) && process.platform === 'win32'
  ? require('url').pathToFileURL(absolutePath).href
  : absolutePath;
const configModule = await import(pathToImport);
```

This fix is safe for all platforms as it only applies the conversion on Windows when dealing with absolute paths.

### Hot Reload Not Working

**Problem:** Changes not reflecting in app

**Solution:**
```bash
# Restart with cleared cache
npm start -- --clear

# Or press 'r' in terminal to reload
# Or shake device and tap "Reload"
```

### TypeScript Errors

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Check for errors
npx tsc --noEmit

# Common fixes:
# 1. Update @types packages
npm install @types/react@latest @types/react-native@latest

# 2. Clean build
rm -rf node_modules
npm install
```

### Watchman Error

**Problem:** `Watchman error` on macOS

**Solution:**
```bash
# Install/reinstall Watchman
brew install watchman

# Or update
brew upgrade watchman

# Clear Watchman
watchman watch-del-all
```

---

## Supabase Issues

### Connection Failed

**Problem:** Cannot connect to Supabase

**Solution:**
1. Check `.env` file has correct values:
```bash
# Verify these are set:
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

2. Verify Supabase project is active
3. Check internet connection
4. Restart dev server after changing .env:
```bash
npm start
```

### RLS Policy Errors

**Problem:** `new row violates row-level security policy`

**Solution:**
```sql
-- Verify RLS policies in Supabase SQL Editor
-- For public read access:
CREATE POLICY "Public can view articles" ON news_articles
  FOR SELECT USING (true);

-- For authenticated users:
CREATE POLICY "Users can manage bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### Tables Not Found

**Problem:** `relation "news_articles" does not exist`

**Solution:**
1. Go to Supabase SQL Editor
2. Run table creation SQL from CONFIGURATION.md
3. Verify tables exist in Table Editor

### Authentication Token Expired

**Problem:** `JWT expired` errors

**Solution:**
```typescript
// Token refresh is automatic, but you can force sign out and back in:
// In app, go to Profile > Sign Out > Sign In again
```

---

## Authentication Issues

### Cannot Sign Up

**Problem:** Sign up fails silently or with error

**Solution:**
1. Check Supabase Auth settings:
   - Email provider is enabled
   - Email confirmation settings
   
2. Check console for errors:
```typescript
// In SignUpScreen, add console.log:
const result = await signUp(credentials);
console.log('Sign up result:', result);
```

3. Verify password meets requirements (min 6 characters)

### Cannot Sign In

**Problem:** Sign in fails with "Invalid credentials"

**Solution:**
1. Verify email and password are correct
2. Check if email is confirmed (Supabase dashboard > Authentication > Users)
3. Try password reset
4. Check Supabase logs for errors

### Session Not Persisting

**Problem:** User logged out after app restart

**Solution:**
1. Verify Expo SecureStore is working:
```typescript
// Test in app:
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('test', 'value');
const value = await SecureStore.getItemAsync('test');
console.log('SecureStore test:', value); // Should log 'value'
```

2. Check platform support (SecureStore may not work on web)

---

## Navigation Issues

### Navigation Not Working

**Problem:** Navigation between screens fails

**Solution:**
1. Verify screen is registered in navigator:
```typescript
// Check AppNavigator.tsx
<Stack.Screen name="ScreenName" component={ScreenComponent} />
```

2. Check navigation parameters:
```typescript
// Correct usage:
navigation.navigate('ArticleDetail', { article });

// Not:
navigation.navigate('ArticleDetail', article);
```

### Back Button Not Working

**Problem:** Hardware back button or navigation back fails

**Solution:**
```typescript
// Use navigation prop, not history:
navigation.goBack();

// Not:
history.back();
```

---

## Performance Issues

### Slow List Scrolling

**Problem:** FlatList performance is poor

**Solution:**
```typescript
// Optimize FlatList props:
<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

### Memory Leaks

**Problem:** App crashes or slows down over time

**Solution:**
```typescript
// Clean up subscriptions in useEffect:
useEffect(() => {
  const subscription = someObservable.subscribe();
  
  return () => {
    subscription.unsubscribe(); // Cleanup!
  };
}, []);
```

### Images Not Loading

**Problem:** Images fail to load or load slowly

**Solution:**
1. Check image URLs are valid
2. Add error handling:
```typescript
<Image
  source={{ uri: imageUrl }}
  onError={(e) => console.log('Image error:', e)}
  defaultSource={require('./placeholder.png')}
/>
```

---

## Build Issues

### iOS Build Fails

**Problem:** iOS build fails with CocoaPods error

**Solution:**
```bash
cd ios
pod install
cd ..

# If still failing:
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Fails

**Problem:** Android build fails with Gradle error

**Solution:**
```bash
cd android
./gradlew clean
cd ..

# Clear Gradle cache
rm -rf ~/.gradle/caches/
```

### EAS Build Issues

**Problem:** EAS build fails

**Solution:**
```bash
# Update EAS CLI
npm install -g eas-cli

# Clear EAS cache
eas build --clear-cache

# Check build logs
eas build:list
```

---

## General Debugging Tips

### Enable Debug Mode

```bash
# In development, check console:
# 1. Press Cmd+D (iOS) or Cmd+M (Android)
# 2. Select "Debug JS Remotely"
# 3. Open Chrome DevTools
```

### Check Logs

```bash
# View logs
npm start

# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android

# Supabase logs
# Check Supabase Dashboard > Logs
```

### Reset Everything

If all else fails:
```bash
# Nuclear option - reset everything
rm -rf node_modules
rm -rf .expo
rm -rf ios/Pods
rm package-lock.json
npm install
npm start -- --clear
```

---

## Getting More Help

If you're still stuck:

1. **Check the documentation:**
   - [README.md](./README.md)
   - [CONFIGURATION.md](./CONFIGURATION.md)
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

2. **Search existing issues:**
   - GitHub Issues
   - Expo Forums
   - Stack Overflow

3. **Create an issue:**
   - Include error messages
   - Describe steps to reproduce
   - Share relevant code
   - Mention your environment (OS, Node version, etc.)

4. **Contact support:**
   - Email: support@spazr.com.ng
   - GitHub Discussions

---

## Environment Information

To help with debugging, share this info when reporting issues:

```bash
# Get environment info
npx expo-env-info

# Or manually:
node -v
npm -v
expo --version
```

Example output:
```
Node: 16.14.0
npm: 8.3.1
Expo CLI: 6.0.0
OS: macOS 12.3
```

---

**Remember:** Most issues can be solved by:
1. Clearing cache
2. Reinstalling dependencies
3. Checking .env configuration
4. Reviewing error messages carefully

Good luck! 🍀
