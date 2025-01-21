# SearXNG Search Parameters and Schemas

## Basic Search Parameters

```typescript
interface SearchParameters {
  // Core Parameters
  q: string;               // Search query
  format: "json" | "html" | "rss" | "csv";  // Response format
  language: string;        // e.g., "en", "fr", "de", etc.
  safesearch: 0 | 1 | 2;  // 0: off, 1: moderate, 2: strict
  
  // Pagination
  pageno: number;         // Page number, starting at 1
  
  // Result Filtering
  categories: string;     // Comma-separated categories
  engines: string;        // Comma-separated engine names
  time_range: "day" | "week" | "month" | "year";
}
```

## Category-Specific Parameters

### Image Search
```typescript
interface ImageSearchParameters extends SearchParameters {
  image_type: "photo" | "clipart" | "line-drawing" | "gif" | "other";
  image_size: "icon" | "small" | "medium" | "large" | "xlarge";
  color: "color" | "monochrome" | "black" | "blue" | "brown" | "gray" | "green" | "orange" | "pink" | "purple" | "red" | "teal" | "white" | "yellow";
}
```

### News Search
```typescript
interface NewsSearchParameters extends SearchParameters {
  time_range: "day" | "week" | "month" | "year";  // More important for news
  sources: string;        // Comma-separated news sources
  news_time: "hour" | "day" | "week" | "month" | "year";  // News-specific time filter
}
```

### File Search
```typescript
interface FileSearchParameters extends SearchParameters {
  file_type: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" | "txt" | "rtf";
  time_range: string;     // When the file was published/modified
}
```

### Video Search
```typescript
interface VideoSearchParameters extends SearchParameters {
  video_duration: "short" | "medium" | "long";
  video_time: "week" | "month" | "year";
}
```

## Response Schemas

### General Search Result
```typescript
interface SearchResult {
  query: string;          // Original search query
  number_of_results: number;
  results: Array<{
    title: string;        // Result title
    url: string;          // Result URL
    content: string;      // Result snippet/description
    score: number;        // Result relevancy score
    category: string;     // Result category
    pretty_url: string;   // Formatted URL
    publishedDate?: string;  // Publication date if available
    img_src?: string;     // Image source if available
    engine: string;       // Engine that provided the result
    engines: string[];    // All engines that found this result
    positions: number[];  // Position in each engine's results
  }>;
  suggestions: string[];  // Search suggestions
  corrections: string[];  // Query corrections
  infoboxes: Array<{     // Additional context boxes
    infobox: string;
    content: string;
    engine: string;
    urls: Array<{
      title: string;
      url: string;
    }>;
  }>;
  engines: {
    name: string;         // Engine name
    time: number;         // Time taken to fetch results
    score: number;        // Engine score
  }[];
  time: number;          // Total search time
  version: string;       // SearXNG version
}
```

### Image Result
```typescript
interface ImageResult extends SearchResult {
  results: Array<{
    title: string;
    url: string;
    content: string;
    img_src: string;     // Image URL
    thumbnail_src: string; // Thumbnail URL
    width: number;       // Image width
    height: number;      // Image height
    source: string;      // Source website
    engine: string;
    engines: string[];
  }>;
}
```

## Server Settings Schema
```typescript
interface SearxngSettings {
  server: {
    base_url: string;    // Server base URL
    secret_key: string;  // Server secret key
    port: number;        // Server port
    bind_address: string; // Bind address
    limiter: boolean;    // Rate limiting enabled
    image_proxy: boolean; // Image proxying enabled
  };
  ui: {
    static_use_hash: boolean;
    default_locale: string;
    query_in_title: boolean;
    infinite_scroll: boolean;
  };
  redis: {
    url: string;        // Redis connection URL
  };
  engines: {
    [engineName: string]: {
      name: string;     // Engine name
      engine: string;   // Engine type
      shortcut: string; // Engine shortcut
      enabled: boolean; // Engine enabled
      timeout: number;  // Engine timeout
      display_error_messages: boolean;
      tokens: string[]; // API tokens if required
      // Engine-specific settings...
    };
  };
  categories: Array<{
    name: string;       // Category name
    engines: string[];  // Engines for category
  }>;
}
```

## Special Parameters

### Headers and Request Parameters
```typescript
interface RequestHeaders {
  "User-Agent": string;   // Client identifier
  "Accept-Language": string;  // Preferred languages
  "DNT"?: "1";           // Do Not Track
  "X-Forwarded-For"?: string;  // Original client IP
  "X-Search-User"?: string;    // User identifier for rate limiting
}
```

### Rate Limiting Parameters
```typescript
interface RateLimiting {
  rate_limits: {
    global: {
      rate: number;     // Requests per time window
      window: number;   // Time window in seconds
    };
    user: {
      rate: number;     // Per-user request rate
      window: number;   // Per-user time window
    };
    ip: {
      rate: number;     // Per-IP request rate
      window: number;   // Per-IP time window
    };
  };
}
```

## Common Values

### Search Categories
```typescript
type SearchCategory =
  | "general"      // General web search
  | "images"       // Image search
  | "videos"       // Video search
  | "news"         // News search
  | "map"          // Map search
  | "music"        // Music search
  | "files"        // File search
  | "it"           // IT search
  | "science"      // Scientific search
  | "social media" // Social media search
;

// Available languages (partial list)
type Language =
  | "en" // English
  | "de" // German
  | "es" // Spanish
  | "fr" // French
  | "it" // Italian
  | "ja" // Japanese
  | "zh" // Chinese
;

// Time ranges
type TimeRange =
  | "day"
  | "week"
  | "month"
  | "year"
;

// File types
type FileType =
  | "pdf"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "ppt"
  | "pptx"
  | "odt"
  | "ods"
  | "odp"
  | "txt"
  | "rtf"
;

// Image types
type ImageType =
  | "photo"
  | "clipart"
  | "line-drawing"
  | "gif"
  | "other"
;

// Image sizes
type ImageSize =
  | "icon"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
;

// Video durations
type VideoDuration =
  | "short"  // < 4 minutes
  | "medium" // 4-20 minutes
  | "long"   // > 20 minutes
;