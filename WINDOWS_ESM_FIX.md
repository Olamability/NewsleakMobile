# Windows ESM URL Scheme Fix

## Problem

When running the News Arena app on Windows with newer versions of Node.js (v22+), you may encounter the following error:

```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
Error loading Metro config at: C:\Users\person\Documents\NewsleakMobile\metro.config.js
```

## Root Cause

This error occurs because Metro's configuration loader (`metro-config` package) attempts to dynamically import the configuration file using Node.js's ESM (ECMAScript Module) `import()` function. On Windows, when an absolute path like `C:\Users\...` is passed to `import()`, Node.js's ESM loader requires it to be in the proper `file://` URL format (e.g., `file:///C:/Users/...`).

The issue is in `node_modules/metro-config/src/loadConfig.js` at line 292 (original code):

```javascript
const configModule = await import(absolutePath);
```

On Windows, `absolutePath` might be something like `C:\Users\person\Documents\NewsleakMobile\metro.config.js`, which is not a valid URL for ESM imports.

## Solution

This repository uses `patch-package` to automatically patch the `metro-config` package to fix this issue. The patch converts Windows absolute paths to proper `file://` URLs before importing.

### How It Works

1. **Patch File**: The fix is stored in `patches/metro-config+0.83.3.patch`
2. **Automatic Application**: The patch is automatically applied after `npm install` via the `postinstall` script in `package.json`
3. **No Manual Intervention**: Users don't need to do anything special - just run `npm install` and the fix is applied

### Technical Details

The patch modifies `node_modules/metro-config/src/loadConfig.js` to include this logic:

```javascript
// Fix for Windows: convert Windows path to file:// URL for dynamic import
const url = require('url');
const pathToImport = path.isAbsolute(absolutePath) && process.platform === 'win32'
  ? url.pathToFileURL(absolutePath).href
  : absolutePath;
const configModule = await import(pathToImport);
```

This code:
- Checks if the path is absolute AND the platform is Windows
- If yes, converts the path to a proper `file://` URL using Node.js's `url.pathToFileURL()` method
- If no (not Windows or not absolute), uses the path as-is
- Performs the import with the corrected path

### Example

**Before (causes error on Windows):**
```javascript
const configModule = await import('C:\\Users\\person\\Documents\\NewsleakMobile\\metro.config.js');
// Error: ERR_UNSUPPORTED_ESM_URL_SCHEME
```

**After (works on Windows):**
```javascript
const pathToImport = url.pathToFileURL('C:\\Users\\person\\Documents\\NewsleakMobile\\metro.config.js').href;
// pathToImport = 'file:///C:/Users/person/Documents/NewsleakMobile/metro.config.js'
const configModule = await import(pathToImport);
// Success!
```

## Installation

The fix is automatically applied when you install dependencies:

```bash
npm install
```

The `postinstall` script in `package.json` ensures `patch-package` runs after every install:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

## Dependencies

The fix requires two dev dependencies:

- **patch-package**: Applies patches to node_modules after install
- **postinstall-postinstall**: Ensures patches are applied even when installing as a dependency

These are already included in `package.json` and will be installed automatically.

## Verification

To verify the patch is working:

1. Check that the patch file exists:
   ```bash
   ls patches/metro-config+0.83.3.patch
   ```

2. Run the postinstall script manually:
   ```bash
   npm run postinstall
   ```
   
   You should see:
   ```
   patch-package 8.0.1
   Applying patches...
   metro-config@0.83.3 ✔
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   
   The app should start without the ESM URL scheme error.

## Cross-Platform Compatibility

This fix is safe for all platforms:
- **Windows**: Converts paths to `file://` URLs
- **macOS/Linux**: Uses paths as-is (no conversion needed)
- The platform check (`process.platform === 'win32'`) ensures the conversion only happens on Windows

## Upstream Issue

This is a known issue in the React Native and Metro community:
- [GitHub Issue - nativewind/react-native-css#246](https://github.com/nativewind/react-native-css/issues/246)
- [GitHub Issue - microsoft/vscode#285166](https://github.com/microsoft/vscode/issues/285166)
- [Stack Overflow Discussion](https://stackoverflow.com/questions/69665780/error-err-unsupported-esm-url-scheme-only-file-and-data-urls-are-supported-by)

A proper fix should be implemented upstream in the `metro-config` package. This patch provides a temporary workaround until that happens.

## Troubleshooting

If you still encounter the error after installing:

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verify the patch is applied:**
   ```bash
   npm run postinstall
   ```

3. **Check the patched file:**
   ```bash
   grep -A 5 "Fix for Windows" node_modules/metro-config/src/loadConfig.js
   ```
   
   You should see the patched code.

4. **Clear Metro cache:**
   ```bash
   npm start -- --clear
   ```

## Maintenance

When upgrading the `metro-config` package:

1. The patch may need to be regenerated if the version changes
2. Test on Windows after upgrading to ensure the fix still works
3. If the upgrade breaks the patch, you'll see an error during `npm install`
4. Regenerate the patch if needed following the instructions in the "Creating a New Patch" section below

### Creating a New Patch

If you need to regenerate the patch for a new version of `metro-config`:

1. Make your changes to `node_modules/metro-config/src/loadConfig.js`
2. Run: `npx patch-package metro-config`
3. Commit the new/updated patch file in the `patches/` directory

## References

- [patch-package Documentation](https://github.com/ds300/patch-package)
- [Node.js ESM Loader Documentation](https://nodejs.org/api/esm.html)
- [Metro Configuration Documentation](https://metrobundler.dev/docs/configuration/)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - See "Metro Config Loading Error on Windows" section
