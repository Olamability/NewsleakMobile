# Feed Formats Guide

## Supported Feed Formats

The NewsleakMobile app supports the following feed formats:

### 1. **RSS 2.0** (Most Common)
- Standard RSS format
- Example URLs:
  - `https://example.com/rss`
  - `https://example.com/feed`
  - `https://example.com/rss.xml`
  - `https://example.com/feed.xml`

### 2. **Atom**
- Modern alternative to RSS
- Example URLs:
  - `https://example.com/atom`
  - `https://example.com/atom.xml`
  - `https://example.com/feed/atom`

### 3. **Other Formats**
The app uses the `rss-parser` library which also supports:
- RSS 0.9, 1.0, 2.0
- Atom 0.3, 1.0
- Various RSS/Atom extensions (Media RSS, iTunes podcasts, etc.)

## URL Validation Requirements

### Valid URL Format
URLs must meet these criteria:
1. Start with `http://` or `https://`
2. Have a valid domain name
3. Maximum length of 2048 characters
4. Follow standard URL encoding rules

### Examples of Valid Feed URLs
```
✓ https://www.example.com/feed/
✓ https://example.com/rss
✓ https://blog.example.com/feed.xml
✓ https://example.co.uk/rss
✓ https://example.com.ng/feed/      (International domains)
✓ http://feeds.example.com/news
```

### Common Feed Patterns
The app recognizes these patterns as likely RSS feeds:
- URLs containing `/rss`
- URLs containing `/feed`
- URLs ending with `.xml`
- URLs ending with `.rss`
- URLs containing `rss.xml`
- URLs containing `feed.xml`

## Troubleshooting Feed Validation Issues

### Issue: "Please enter a valid RSS feed URL"

This error can occur for several reasons:

#### 1. **URL Format Issue**
**Problem**: The URL doesn't follow valid URL format.
**Solution**: 
- Ensure the URL starts with `http://` or `https://`
- Check for typos in the domain name
- Make sure there are no spaces in the URL

**Example Fix**:
```
✗ www.example.com/feed          (Missing protocol)
✓ https://www.example.com/feed

✗ example.com/feed              (Missing protocol)
✓ https://example.com/feed
```

#### 2. **Domain Not Accessible**
**Problem**: The domain doesn't exist or isn't accessible.
**Solution**:
- Verify the domain is correct and accessible in a browser
- Check if the website requires `www.` or works without it
- Try both versions:
  - `https://www.abilitydigitalz.com.ng/feed/`
  - `https://abilitydigitalz.com.ng/feed/`

#### 3. **Feed Doesn't Exist**
**Problem**: The URL is valid but doesn't point to an actual RSS feed.
**Solution**:
- Open the feed URL in a web browser
- You should see XML content (RSS/Atom feed)
- If you see a 404 error, the feed doesn't exist at that URL

**Common feed locations to try**:
- `/feed/`
- `/rss/`
- `/feed.xml`
- `/rss.xml`
- `/index.xml`
- `/atom.xml`

#### 4. **Feed Format Not Recognized**
**Problem**: The feed exists but uses an unsupported format.
**Solution**:
- Check if the feed is valid RSS/Atom XML
- Use an RSS validator: https://validator.w3.org/feed/
- If the feed is JSON Feed format, it may not be supported

### For Your Specific Case: `https://www.abilitydigitalz.com.ng/feed/`

The URL format is valid and follows all the rules. If you're getting an error, please check:

1. **Domain accessibility**: Can you access `https://www.abilitydigitalz.com.ng` in a browser?
   - If not, try without `www.`: `https://abilitydigitalz.com.ng/feed/`

2. **Feed existence**: Does opening the feed URL in a browser show XML content?
   - If you see a 404 error, try alternative URLs:
     - `https://abilitydigitalz.com.ng/feed`
     - `https://abilitydigitalz.com.ng/rss`
     - `https://abilitydigitalz.com.ng/feed.xml`

3. **Network issues**: Are you on a network that might block certain domains?

## How to Find RSS Feeds

### Method 1: Check Common Locations
Most websites have feeds at these standard locations:
- `/feed/`
- `/rss/`
- `/feed.xml`
- `/atom.xml`

### Method 2: Look in the Website HTML
1. Visit the website homepage
2. View page source
3. Search for:
   - `<link rel="alternate" type="application/rss+xml"`
   - `<link rel="alternate" type="application/atom+xml"`

### Method 3: Use Feed Discovery Tools
- **Feedly**: Visit `https://feedly.com/i/subscription/feed/[WEBSITE_URL]`
- **RSS Finder**: Various browser extensions can detect feeds

## Technical Details

### Client-Side Validation
The app performs these validations on the client side:
1. **URL format validation**: Checks if the URL is well-formed
2. **Protocol validation**: Ensures HTTP or HTTPS
3. **Pattern detection**: Warns if URL doesn't look like an RSS feed

### Server-Side Processing
After validation, the app:
1. Attempts to fetch the feed content
2. Parses the XML/Atom content
3. Extracts article information
4. Stores articles in the database

If the feed cannot be parsed or fetched, you'll see an error even if the URL validation passes.

## Supported Domain Extensions

The app supports **all** international domain extensions, including:
- `.com`, `.net`, `.org`
- `.co.uk`, `.com.ng`, `.co.za`
- `.io`, `.ai`, `.app`
- Country-specific TLDs
- New TLDs

There are **no restrictions** on domain extensions.

## Need Help?

If you're still experiencing issues with a specific feed:
1. Test the feed URL in a browser
2. Validate the feed at: https://validator.w3.org/feed/
3. Check if the website provides the feed URL in their footer or "Subscribe" section
4. Contact the website owner to confirm their RSS feed URL
