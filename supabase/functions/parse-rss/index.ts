// Supabase Edge Function for RSS Feed Parsing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

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

interface ParseRSSRequest {
  feedUrl: string;
  timeout?: number;
}

interface ParseRSSResponse {
  success: boolean;
  articles: RawArticle[];
  error?: string;
  feedMetadata?: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
  };
}

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const { feedUrl, timeout = DEFAULT_TIMEOUT }: ParseRSSRequest = await req.json();

    if (!feedUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          articles: [],
          error: 'Feed URL is required',
        } as ParseRSSResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate URL format
    try {
      const url = new URL(feedUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          articles: [],
          error: 'Invalid feed URL format',
        } as ParseRSSResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Parse RSS feed with retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'NewsArena/1.0 (News Aggregator Mobile App)',
            'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const feedContent = await response.text();
        const articles = parseFeedContent(feedContent);
        const metadata = extractFeedMetadata(feedContent);

        return new Response(
          JSON.stringify({
            success: true,
            articles,
            feedMetadata: metadata,
          } as ParseRSSResponse),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (error) {
        lastError = error as Error;
        console.error(`RSS parse attempt ${attempt} failed for ${feedUrl}:`, error);

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
        }
      }
    }

    // All retries failed
    return new Response(
      JSON.stringify({
        success: false,
        articles: [],
        error: `Failed to parse RSS feed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
      } as ParseRSSResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in parse-rss function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        articles: [],
        error: `Internal server error: ${(error as Error).message}`,
      } as ParseRSSResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

/**
 * Parse RSS/Atom feed content and extract articles
 */
function parseFeedContent(feedContent: string): RawArticle[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(feedContent, 'text/xml');

  if (!doc) {
    throw new Error('Failed to parse feed content');
  }

  // Detect feed type (RSS or Atom)
  const rssItems = doc.querySelectorAll('item');
  const atomEntries = doc.querySelectorAll('entry');

  if (rssItems.length > 0) {
    return Array.from(rssItems).map((item) => parseRSSItem(item)).filter(Boolean) as RawArticle[];
  } else if (atomEntries.length > 0) {
    return Array.from(atomEntries)
      .map((entry) => parseAtomEntry(entry))
      .filter(Boolean) as RawArticle[];
  }

  return [];
}

/**
 * Parse RSS item element
 */
function parseRSSItem(item: Element): RawArticle | null {
  const title = getElementText(item, 'title');
  const link = getElementText(item, 'link') || getElementAttribute(item, 'link', 'href');

  if (!title || !link) {
    return null;
  }

  return {
    title,
    link,
    description: getElementText(item, 'description'),
    pubDate: getElementText(item, 'pubDate'),
    creator:
      getElementText(item, 'dc:creator') ||
      getElementText(item, 'author') ||
      getElementText(item, 'creator'),
    content: getElementText(item, 'content:encoded') || getElementText(item, 'content'),
    contentSnippet: getElementText(item, 'description'),
    guid: getElementText(item, 'guid'),
    categories: getAllElementTexts(item, 'category'),
    isoDate: getElementText(item, 'pubDate') || getElementText(item, 'dc:date'),
    enclosure: parseEnclosure(item),
  };
}

/**
 * Parse Atom entry element
 */
function parseAtomEntry(entry: Element): RawArticle | null {
  const title = getElementText(entry, 'title');
  const link = getElementAttribute(entry, 'link', 'href');

  if (!title || !link) {
    return null;
  }

  const summary = getElementText(entry, 'summary');
  const content = getElementText(entry, 'content');

  return {
    title,
    link,
    description: summary || content,
    pubDate: getElementText(entry, 'published') || getElementText(entry, 'updated'),
    creator: getElementText(entry, 'author > name'),
    content: content || summary,
    contentSnippet: summary,
    guid: getElementText(entry, 'id'),
    categories: getAllElementTexts(entry, 'category').map(
      (cat) => getElementAttribute(entry, 'category', 'term') || cat
    ),
    isoDate: getElementText(entry, 'published') || getElementText(entry, 'updated'),
  };
}

/**
 * Extract feed metadata
 */
function extractFeedMetadata(feedContent: string): {
  title?: string;
  description?: string;
  link?: string;
  language?: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(feedContent, 'text/xml');

  if (!doc) {
    return {};
  }

  const channel = doc.querySelector('channel');
  const feed = doc.querySelector('feed');

  if (channel) {
    return {
      title: getElementText(channel, 'title'),
      description: getElementText(channel, 'description'),
      link: getElementText(channel, 'link'),
      language: getElementText(channel, 'language'),
    };
  } else if (feed) {
    return {
      title: getElementText(feed, 'title'),
      description: getElementText(feed, 'subtitle'),
      link: getElementAttribute(feed, 'link', 'href'),
    };
  }

  return {};
}

/**
 * Parse enclosure (media attachments)
 */
function parseEnclosure(item: Element): RawArticle['enclosure'] {
  const enclosure = item.querySelector('enclosure');
  const mediaContent = item.querySelector('media\\:content');
  const mediaThumbnail = item.querySelector('media\\:thumbnail');

  const element = enclosure || mediaContent || mediaThumbnail;

  if (!element) {
    return undefined;
  }

  return {
    url: element.getAttribute('url') || undefined,
    type: element.getAttribute('type') || element.getAttribute('medium') || undefined,
    length: element.getAttribute('length') || undefined,
  };
}

/**
 * Get text content from element by tag name
 */
function getElementText(parent: Element | Document, tagName: string): string | undefined {
  const element = parent.querySelector(tagName);
  return element?.textContent?.trim() || undefined;
}

/**
 * Get attribute value from element by tag name
 */
function getElementAttribute(
  parent: Element | Document,
  tagName: string,
  attrName: string
): string | undefined {
  const element = parent.querySelector(tagName);
  return element?.getAttribute(attrName) || undefined;
}

/**
 * Get all text contents from elements by tag name
 */
function getAllElementTexts(parent: Element | Document, tagName: string): string[] {
  const elements = parent.querySelectorAll(tagName);
  return Array.from(elements)
    .map((el) => el.textContent?.trim())
    .filter((text) => text) as string[];
}
