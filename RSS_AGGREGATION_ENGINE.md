# RSS Aggregation Engine Documentation

## Overview

The RSS aggregation engine is a production-ready system for automatically fetching, processing, and storing news articles from multiple RSS feeds. It provides deduplication, content validation, language detection, and comprehensive logging.

## Architecture

### Services

#### 1. RSSService (`src/services/rss.service.ts`)

**Purpose:** Parse RSS and Atom feeds with robust error handling.

**Key Features:**
- Parses RSS 2.0 and Atom feeds
- Retry logic with exponential backoff (3 retries, 2-6 second delays)
- Handles various feed formats and edge cases
- Deduplication by URL and title
- Extracts metadata (title, description, language)

**Example Usage:**
```typescript
import { RSSService } from './services/rss.service';

const rssService = new RSSService();

// Parse feed from URL
const articles = await rssService.parseFeed('https://example.com/feed.xml');

// Parse feed from string
const articlesFromString = await rssService.parseFeedString(xmlString);

// Get feed metadata
const metadata = await rssService.getFeedMetadata('https://example.com/feed.xml');

// Validate feed URL
const isValid = RSSService.isValidFeedUrl('https://example.com/feed.xml');

// Deduplicate articles
const unique = RSSService.deduplicateArticles(articles);
```

#### 2. ContentService (`src/services/content.service.ts`)

**Purpose:** Process raw articles into clean, validated content.

**Key Features:**
- HTML sanitization (removes scripts, dangerous attributes)
- Image extraction (from enclosures, content, or default)
- Language detection (supports English, Russian, Arabic, Chinese, Japanese, Korean, Nigerian English)
- Category inference from keywords
- Slug generation for SEO-friendly URLs
- Content hash generation for deduplication
- Summary extraction with intelligent truncation

**Example Usage:**
```typescript
import { ContentService } from './services/content.service';

const contentService = new ContentService();

// Process single article
const processed = await contentService.processArticle(
  rawArticle,
  'BBC News',
  'https://bbc.com',
  {
    defaultCategory: 'news',
    defaultLanguage: 'en',
    maxSummaryLength: 300
  }
);

// Process multiple articles
const processedArticles = await contentService.processArticles(
  rawArticles,
  'BBC News',
  'https://bbc.com'
);

// Validate article
const validation = contentService.validateArticle(processedArticle);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Clean HTML
const cleanedHtml = contentService.cleanHtml(dirtyHtml);

// Generate slug
const slug = contentService.generateSlug('My Article Title');
```

**Category Inference Keywords:**
- **politics**: election, government, president, parliament, minister
- **technology**: tech, ai, software, startup, crypto, blockchain
- **business**: business, economy, market, stock, finance, trade
- **sports**: sport, football, basketball, soccer, tennis, olympics
- **entertainment**: entertainment, movie, music, celebrity, film
- **health**: health, medical, vaccine, disease, doctor, hospital
- **science**: science, research, study, discovery, experiment
- **world**: world, international, global, country, nation

#### 3. IngestionService (`src/services/ingestion.service.ts`)

**Purpose:** Orchestrate the entire ingestion process from multiple sources.

**Key Features:**
- Fetch from multiple RSS sources in sequence
- Process and normalize articles
- Duplicate detection by content hash
- Ingestion logging (status, counts, errors)
- Batch processing with delays to avoid overwhelming servers
- Manual and automatic ingestion support

**Example Usage:**
```typescript
import { IngestionService } from './services/ingestion.service';

const ingestionService = new IngestionService();

// Ingest from all active sources
const results = await ingestionService.ingestFromAllSources();

// Ingest from specific source
const result = await ingestionService.ingestFromSource(source);

// Trigger manual ingestion
const manualResult = await ingestionService.triggerManualIngestion('source-id');

// Get ingestion logs
const logs = await ingestionService.getIngestionLogs(50);

// Get logs for specific source
const sourceLogs = await ingestionService.getIngestionLogsBySource('source-id', 20);
```

**Ingestion Result Structure:**
```typescript
{
  success: boolean;
  sourceId: string;
  sourceName: string;
  articlesFetched: number;      // Total articles in feed
  articlesProcessed: number;    // Articles that passed validation
  articlesDuplicates: number;   // Duplicates (skipped)
  articlesStored: number;       // New articles added to database
  errors: string[];             // Error messages
  logId?: string;               // Ingestion log ID
}
```

#### 4. IngestionScheduler (`src/utils/scheduler.ts`)

**Purpose:** Schedule periodic RSS feed checks.

**Key Features:**
- Configurable interval (default: 60 minutes)
- Automatic retry on failure (default: 3 retries)
- Success and error callbacks
- Start/stop control
- Manual trigger support

**Example Usage:**
```typescript
import { 
  IngestionScheduler, 
  createDefaultScheduler,
  getGlobalScheduler,
  startGlobalScheduler,
  stopGlobalScheduler
} from './utils/scheduler';

// Create custom scheduler
const scheduler = new IngestionScheduler({
  intervalMinutes: 30,
  maxRetries: 3,
  retryDelayMinutes: 5,
  onSuccess: (results) => {
    console.log('Ingestion successful:', results);
  },
  onError: (error) => {
    console.error('Ingestion failed:', error);
  }
});

// Start scheduler
scheduler.start();

// Stop scheduler
scheduler.stop();

// Get status
const status = scheduler.getStatus();

// Trigger manual ingestion
await scheduler.triggerManual();

// Update configuration
scheduler.updateConfig({ intervalMinutes: 60 });

// OR use global singleton
startGlobalScheduler();
stopGlobalScheduler();
```

## Data Types

### ArticleStatus
```typescript
type ArticleStatus = 
  | 'draft'              // Initial draft state
  | 'pending_approval'   // Waiting for admin review
  | 'approved'          // Approved but not yet published
  | 'rejected'          // Rejected by admin
  | 'published';        // Live and visible to users
```

### RawArticle
```typescript
interface RawArticle {
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  creator?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  categories?: string[];
  isoDate?: string;
  enclosure?: {
    url?: string;
    type?: string;
    length?: string;
  };
}
```

### ProcessedArticle
```typescript
interface ProcessedArticle {
  title: string;
  slug: string;
  summary: string;
  content_snippet?: string;
  image_url: string;
  article_url: string;
  canonical_url: string;
  source_name: string;
  source_url: string;
  category: string;
  tags?: string[];
  language?: string;
  published_at: string;
  content_hash: string;
  status: ArticleStatus;
}
```

### IngestionLog
```typescript
interface IngestionLog {
  id: string;
  source_id?: string;
  source_name: string;
  status: 'success' | 'error' | 'in_progress';
  articles_fetched: number;
  articles_processed: number;
  articles_duplicates: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}
```

## Database Schema

### ingestion_logs Table
```sql
CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES news_sources(id),
  source_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'in_progress')),
  articles_fetched INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  articles_duplicates INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### news_articles Table Updates
The `news_articles` table should include a `content_hash` field for deduplication:
```sql
ALTER TABLE news_articles ADD COLUMN content_hash TEXT UNIQUE;
CREATE INDEX idx_news_articles_content_hash ON news_articles(content_hash);
```

## Workflow

### Typical Ingestion Flow

1. **Scheduler triggers** → IngestionService.ingestFromAllSources()
2. **Fetch active sources** from database
3. **For each source:**
   - Create ingestion log (status: 'in_progress')
   - Fetch RSS feed (RSSService)
   - Parse and normalize articles (RSSService)
   - Deduplicate by URL/title (RSSService)
   - Process articles (ContentService)
     - Clean HTML
     - Extract images
     - Detect language
     - Infer category
     - Generate slug
     - Create content hash
   - Filter existing articles by content_hash
   - Store new articles in database
   - Update ingestion log (status: 'success' or 'error')
4. **Log summary** of all ingestions

### Error Handling

The system implements multiple layers of error handling:

1. **RSS Parsing**: 3 retries with exponential backoff
2. **Content Processing**: Individual article failures don't stop batch processing
3. **Database Operations**: Wrapped in try-catch with logging
4. **Scheduler**: Automatic retries on failure

## Testing

### Test Coverage

- **RSSService**: 12 tests
  - Feed URL validation
  - Deduplication logic
  - RSS 2.0 parsing
  - Atom feed parsing
  - Invalid feed handling
  - Metadata extraction

- **ContentService**: 28 tests
  - HTML sanitization
  - Text cleaning
  - Slug generation
  - Content hashing
  - Article processing
  - Validation
  - Image extraction
  - Category inference

- **IngestionService**: 6 tests
  - Log fetching
  - Manual ingestion
  - Multiple source handling
  - Error handling

### Running Tests

```bash
# Run all tests
npm test

# Run specific service tests
npm test -- --testPathPatterns="rss.service.test"
npm test -- --testPathPatterns="content.service.test"
npm test -- --testPathPatterns="ingestion.service.test"

# Run with coverage
npm test -- --coverage
```

## Security

### Implemented Security Measures

1. **HTML Sanitization**: Uses `sanitize-html` library to prevent XSS
2. **URL Validation**: Validates feed URLs before fetching
3. **Content Hash**: Prevents duplicate content injection
4. **Rate Limiting**: Delays between source fetches to avoid overwhelming servers
5. **Input Validation**: All article fields are validated before storage

### CodeQL Analysis

The code passes CodeQL security analysis with 0 alerts.

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**: Articles are processed in batches per source
2. **Duplicate Filtering**: Content hash check prevents storing duplicates
3. **Selective Fetching**: Only active sources with RSS URLs are processed
4. **Delay Between Sources**: 2-second delay prevents server overload
5. **Retry Logic**: Exponential backoff prevents hammering failed endpoints

### Recommended Intervals

- **Development**: 30-60 minutes
- **Production**: 60-120 minutes
- **High-traffic sites**: 15-30 minutes

## Deployment

### Environment Variables

None required - uses existing Supabase configuration from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Starting the Scheduler

```typescript
import { startGlobalScheduler } from './utils/scheduler';

// In your app initialization (e.g., App.tsx)
useEffect(() => {
  // Only start scheduler if user is admin
  if (user?.is_admin) {
    startGlobalScheduler();
  }
  
  return () => {
    stopGlobalScheduler();
  };
}, [user]);
```

## Monitoring

### Ingestion Logs Screen

The `IngestionLogsScreen` displays real-time ingestion data:
- Source name
- Status (success/error/in_progress)
- Articles fetched
- Articles processed
- Duplicates count
- Error messages
- Timestamp

### Key Metrics to Monitor

1. **Success Rate**: % of successful ingestions
2. **Duplicate Rate**: % of duplicate articles
3. **Processing Time**: Time from start to completion
4. **Error Frequency**: Number of errors per time period
5. **Articles Per Source**: Average articles fetched per source

## Troubleshooting

### Common Issues

**Issue**: RSS feed parsing fails
- **Solution**: Check feed URL validity, ensure RSS/Atom format compliance
- **Check**: Network connectivity, CORS issues (if applicable)

**Issue**: High duplicate rate
- **Solution**: Normal for frequently updated feeds; adjust ingestion interval
- **Check**: Content hash generation, database deduplication logic

**Issue**: Articles missing images
- **Solution**: Service provides default image if none found
- **Check**: Feed enclosure format, HTML parsing

**Issue**: Incorrect category assignment
- **Solution**: Add keywords to category inference logic
- **Check**: Feed categories, article content

## Future Enhancements

Potential improvements for the system:

1. **Advanced NLP**: More sophisticated language and category detection
2. **Sentiment Analysis**: Classify article sentiment
3. **Image Processing**: Resize/optimize images, extract from article pages
4. **Full-text Extraction**: Fetch full article content from source
5. **Source Prioritization**: Priority queue for important sources
6. **Distributed Processing**: Scale to multiple workers
7. **Real-time Updates**: WebSocket-based push notifications
8. **Machine Learning**: Auto-categorization and quality scoring

## Dependencies

- **rss-parser** (^3.13.0): RSS/Atom feed parsing
- **cheerio** (^1.0.0): HTML parsing and manipulation
- **crypto-js** (^4.2.0): Content hashing for deduplication
- **sanitize-html** (^2.11.0): HTML sanitization and security

## License

MIT - See LICENSE file for details.

## Support

For issues or questions:
1. Check this documentation
2. Review test files for usage examples
3. Check ingestion logs for error details
4. Open an issue on GitHub
