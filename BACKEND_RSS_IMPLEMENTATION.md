# Backend RSS Parsing Implementation

## Overview

RSS parsing has been moved from the mobile app to a Supabase Edge Function backend. This reduces the mobile app bundle size and improves performance by offloading the parsing logic to the server.

## Architecture

### Before
```
Mobile App → RSS Feed URL → rss-parser library → Parsed Articles
```

### After
```
Mobile App → Supabase Edge Function → RSS Feed URL → Parsed Articles (JSON)
```

## Benefits

1. **Reduced Mobile App Bundle Size**: Removed `rss-parser` and its dependencies from the mobile app
2. **Improved Performance**: Parsing happens on the server with better resources
3. **Easier Maintenance**: Update parsing logic without mobile app updates
4. **Better Error Handling**: Centralized error handling and retry logic
5. **Scalability**: Backend can handle multiple concurrent RSS parsing requests

## Components

### Backend (Supabase Edge Function)

**Location**: `supabase/functions/parse-rss/`

The Edge Function:
- Fetches RSS/Atom feeds from URLs
- Parses XML content using Deno DOM parser
- Normalizes data into a consistent JSON format
- Handles both RSS and Atom feed formats
- Includes retry logic with exponential backoff
- Returns feed metadata along with articles

**Endpoint**: `POST {SUPABASE_URL}/functions/v1/parse-rss`

**Request**:
```json
{
  "feedUrl": "https://example.com/feed.xml",
  "timeout": 10000
}
```

**Response**:
```json
{
  "success": true,
  "articles": [
    {
      "title": "Article Title",
      "link": "https://example.com/article",
      "description": "Article description",
      "pubDate": "2024-01-20T12:00:00Z",
      "creator": "Author Name",
      "content": "Full content",
      "categories": ["Technology"],
      "enclosure": {
        "url": "https://example.com/image.jpg",
        "type": "image/jpeg"
      }
    }
  ],
  "feedMetadata": {
    "title": "Feed Title",
    "description": "Feed Description",
    "link": "https://example.com",
    "language": "en"
  }
}
```

### Mobile App (Updated Service)

**Location**: `src/services/rss.service.ts`

The updated RSSService:
- Makes HTTP POST requests to the Edge Function
- Handles authentication with Supabase API key
- Implements retry logic for network failures
- Maintains the same public API interface (no breaking changes)
- Supports custom backend URL via environment variable

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Required
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional - Use custom backend URL
# EXPO_PUBLIC_RSS_PARSER_URL=https://your-custom-backend.com/parse-rss
```

### Deploying the Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy parse-rss
   ```

4. Verify deployment:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/parse-rss \
     -H "Content-Type: application/json" \
     -H "apikey: your-anon-key" \
     -d '{"feedUrl": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"}'
   ```

## Testing

### Local Testing (Edge Function)

Start Supabase locally:
```bash
supabase start
supabase functions serve parse-rss
```

Test the function:
```bash
curl -X POST http://localhost:54321/functions/v1/parse-rss \
  -H "Content-Type: application/json" \
  -d '{"feedUrl": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"}'
```

### Mobile App Testing

The mobile app automatically uses the backend when:
1. `EXPO_PUBLIC_SUPABASE_URL` is set
2. The Edge Function is deployed

Run the app normally:
```bash
npm start
```

## Migration Notes

### Breaking Changes
- **None**: The public API of `RSSService` remains unchanged
- Existing code using `RSSService.parseFeed()` works without modifications

### Removed Dependencies
The following dependencies can be removed from `package.json` once fully migrated:
- `rss-parser` (currently kept for backward compatibility)

### Backward Compatibility
The implementation maintains full backward compatibility. The service interface remains the same, so no changes are needed in consuming code.

## Performance Considerations

### Latency
- Added network round-trip to backend (~100-500ms depending on location)
- Parsing itself is faster on server hardware
- Net impact: Minimal for most use cases

### Scalability
- Edge Function auto-scales with Supabase infrastructure
- Can handle concurrent requests efficiently
- Consider implementing caching for frequently accessed feeds

### Error Handling
- Retry logic handles transient failures
- Detailed error messages returned to client
- Logs available in Supabase dashboard

## Security

### API Authentication
- All requests require valid Supabase API key
- Row-level security policies apply

### CORS
- Edge Function includes CORS headers
- Accessible from mobile app domains

### Rate Limiting
- Consider implementing rate limiting in production
- Monitor usage in Supabase dashboard

## Future Enhancements

1. **Caching**: Implement Redis cache for frequently accessed feeds
2. **Webhooks**: Support webhook notifications for feed updates
3. **Batch Processing**: Support parsing multiple feeds in one request
4. **Analytics**: Track parsing performance and success rates
5. **Feed Discovery**: Auto-detect RSS/Atom feed URLs from websites

## Troubleshooting

### Edge Function Not Found
- Verify deployment: `supabase functions list`
- Check Supabase URL in environment variables
- Ensure function is deployed to correct project

### Authentication Errors
- Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Check API key permissions in Supabase dashboard

### Parsing Failures
- Check Edge Function logs in Supabase dashboard
- Verify RSS feed URL is accessible
- Test feed URL directly in browser

### Timeout Issues
- Increase timeout in request options
- Check feed server response time
- Consider implementing caching

## Support

For issues or questions:
1. Check Supabase Edge Function logs
2. Review mobile app console logs
3. Test Edge Function directly with curl
4. Open an issue on GitHub repository

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: NewsLeak Mobile Team
