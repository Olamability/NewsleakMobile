# Parse RSS Edge Function

This Supabase Edge Function handles RSS feed parsing on the backend, reducing mobile app bundle size and improving performance.

## Endpoint

`POST /functions/v1/parse-rss`

## Request Body

```json
{
  "feedUrl": "https://example.com/feed.xml",
  "timeout": 10000
}
```

## Response

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

## Error Response

```json
{
  "success": false,
  "articles": [],
  "error": "Error message"
}
```

## Features

- Parses both RSS and Atom feeds
- Retry logic with exponential backoff
- Configurable timeout
- CORS support
- Extracts feed metadata
- Handles media enclosures

## Deployment

To deploy this function to Supabase:

```bash
supabase functions deploy parse-rss
```

## Testing Locally

```bash
supabase functions serve parse-rss
```

Then make a request:

```bash
curl -X POST http://localhost:54321/functions/v1/parse-rss \
  -H "Content-Type: application/json" \
  -d '{"feedUrl": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"}'
```
