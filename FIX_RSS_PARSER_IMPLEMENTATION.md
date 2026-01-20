# RSS Parser Fix for React Native

## Problem
The Android build was failing with the error:
```
The package at "node_modules\rss-parser\lib\parser.js" attempted to import the Node standard library module "http".
It failed because the native React runtime does not include the Node standard library.
```

This occurred because `rss-parser` imports Node.js core modules (`http`, `https`, `url`) at the module level, which are not available in React Native.

## Solution
We implemented a two-pronged approach:

### 1. Use axios for HTTP Requests
Instead of using `rss-parser`'s `parseURL()` method (which uses Node.js HTTP), we:
- Fetch RSS feed content using `axios.get()` (React Native compatible)
- Parse the fetched XML string using `parser.parseString()`

This way, we avoid using the Node.js HTTP functionality while still leveraging rss-parser's excellent XML parsing.

### 2. Metro Configuration with Polyfills
Created `metro.config.cjs` to provide browser-compatible polyfills for Node.js modules:
- `http` → `stream-http`
- `https` → `https-browserify`
- `url` → `url`
- `stream` → `readable-stream`
- `buffer` → `buffer`

This allows the bundler to resolve the imports at the top of `rss-parser`, even though we never actually call the code that uses them.

## Files Modified

### `src/services/rss.service.ts`
- Added `import axios from 'axios'`
- Modified `parseFeed()` to use axios instead of `parser.parseURL()`
- Modified `getFeedMetadata()` to use axios instead of `parser.parseURL()`
- Kept `parseFeedString()` unchanged (uses `parser.parseString()`)

### `metro.config.cjs` (new file)
- Configured extraNodeModules with polyfills
- Uses `.cjs` extension to explicitly indicate CommonJS format and avoid ESM loader issues on Windows

### `package.json`
- Added polyfill dependencies: `stream-http`, `https-browserify`, `url`, `readable-stream`

### `src/services/__tests__/rss.service.test.ts`
- Added axios mock
- Updated tests to mock axios instead of parser

## Testing
All 151 tests pass, including:
- 12 RSS service tests
- 6 ingestion service tests (which depend on RSS service)
- All other existing tests

## Benefits of This Approach
1. **Minimal code changes**: Only 2 methods modified
2. **Preserves functionality**: All RSS parsing features still work
3. **No breaking changes**: API remains the same
4. **React Native compatible**: Uses axios for HTTP
5. **Maintains rss-parser**: Still leverages its excellent XML parsing

## Future Considerations
- Monitor `rss-parser` for React Native compatible versions
- Consider contributing a PR to rss-parser to support custom HTTP clients
- If polyfills cause bundle size concerns, consider a pure React Native RSS parser library
