/**
 * Utility functions for the NewsleakMobile app
 */

/**
 * Format a date string into a relative time string
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "now", "5m", "2h", "3d")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMinutes <= 0) {
    return 'now';
  } else if (diffInHours < 1) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }
};

/**
 * Validate if a URL string is a valid URL
 * @param urlString - URL string to validate
 * @returns true if valid URL, false otherwise
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a URL looks like an RSS feed
 * @param url - URL string to check
 * @returns true if URL contains common RSS patterns
 */
export const isLikelyRssFeed = (url: string): boolean => {
  const RSS_PATTERNS = ['/rss', '/feed', '.xml', '.rss', 'rss.xml', 'feed.xml'];
  const urlLower = url.toLowerCase();
  return RSS_PATTERNS.some((pattern) => urlLower.includes(pattern));
};
