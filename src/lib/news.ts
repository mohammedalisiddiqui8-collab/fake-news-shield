/**
 * Live news service — fetches real-world headlines from major RSS feeds.
 * - Deduplicates by fuzzy title matching
 * - Filters articles older than 48 hours
 * - Sorts by publication time (newest first)
 * - Tracks snippet vs full-text availability
 * - Caches results for 30 minutes
 * - Never substitutes sample/demo articles: on failure the caller shows an
 *   empty state so "Today's Headlines" only ever contains live articles.
 */

export interface LiveArticle {
  title: string;
  description: string;
  fullText: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  publishedAgo: string;
  category: string;
  /** Whether the article text is a genuine excerpt or just the RSS <description> snippet. */
  isSnippet: boolean;
}

/* ─── RSS feed sources by category ─── */
const CATEGORY_FEEDS: Record<string, { url: string; name: string }[]> = {
  World: [
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "The New York Times" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
    { url: "https://www.theguardian.com/world/rss", name: "The Guardian" },
  ],
  Conflicts: [
    { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", name: "The New York Times" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  ],
  Politics: [
    { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", name: "The New York Times" },
    { url: "https://www.theguardian.com/politics/rss", name: "The Guardian" },
  ],
  Economy: [
    { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "The New York Times" },
    { url: "https://www.theguardian.com/uk/business/rss", name: "The Guardian" },
  ],
  "Science & Tech": [
    { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml", name: "The New York Times" },
    { url: "https://www.nature.com/nature.rss", name: "Nature" },
  ],
  Environment: [
    { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", name: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml", name: "The New York Times" },
    { url: "https://www.theguardian.com/environment/rss", name: "The Guardian" },
  ],
};

const CATEGORY_ICONS: Record<string, string> = {
  World: "Globe",
  Conflicts: "AlertTriangle",
  Politics: "Landmark",
  Economy: "TrendingUp",
  "Science & Tech": "FlaskConical",
  Environment: "Thermometer",
};

export function getCategoryIconComponent(category: string): string {
  return CATEGORY_ICONS[category] || "Newspaper";
}

const CACHE_KEY = "veritas_live_news";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FRESHNESS_MS = 48 * 60 * 60 * 1000; // 48 hours — discard older articles

/* ─── Helpers ─── */

/** Compute a simple word-set overlap ratio between two titles. */
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.min(wordsA.size, wordsB.size);
}

/** Human-readable relative time ("3 hours ago", "yesterday", etc.). */
export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Format a short date string ("Sep 15", "Aug 3"). */
export function shortDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSourceName(rssUrl: string): string {
  try {
    const hostname = new URL(rssUrl).hostname.replace("www.", "").replace("feeds.", "");
    if (hostname.includes("bbc")) return "BBC News";
    if (hostname.includes("nytimes")) return "The New York Times";
    if (hostname.includes("aljazeera")) return "Al Jazeera";
    if (hostname.includes("theguardian")) return "The Guardian";
    if (hostname.includes("nature.com")) return "Nature";
    if (hostname.includes("npr.org")) return "NPR News";
    return hostname.split(".")[0];
  } catch {
    return "News Source";
  }
}

/* ─── Simple XML parser for RSS ─── */
function parseRSSItems(xmlText: string): Array<{
  title: string;
  link: string;
  pubDate: string;
  description: string;
}> {
  const items: Array<{
    title: string;
    link: string;
    pubDate: string;
    description: string;
  }> = [];

  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    const get = (tag: string): string => {
      const re = new RegExp(
        `<${tag}[^>]*><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        "i"
      );
      const m = re.exec(itemXml);
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const title = get("title");
    const link = get("link");
    const pubDate = get("pubDate");
    const description = get("description");
    if (title) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
}

/* ─── Fetch & parse a single RSS feed via rss2json ─── */
async function fetchFeed(
  url: string,
  categoryName: string
): Promise<LiveArticle[]> {
  const feedUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;

  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status !== "ok" || !data.items?.length) {
      throw new Error("Invalid RSS response");
    }

    return data.items
      .slice(0, 5)
      .map(
        (item: {
          title: string;
          link: string;
          pubDate: string;
          description: string;
          author?: string;
        }): LiveArticle => {
          const description = stripHtml(item.description);
          const pubDate = item.pubDate || "";
          return {
            title: stripHtml(item.title),
            description: description.slice(0, 200),
            fullText: description,
            sourceUrl: item.link,
            sourceName: item.author || extractSourceName(url),
            publishedAt: pubDate,
            publishedAgo: relativeTime(pubDate),
            category: categoryName,
            isSnippet: true, // RSS <description> is always a snippet, never full article text
          };
        }
      );
  } catch {
    return [];
  }
}

/* ─── Alternative: fetch via direct RSS XML ─── */
async function fetchFeedDirect(
  rssUrl: string,
  categoryName: string
): Promise<LiveArticle[]> {
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseRSSItems(xml);

    return items.slice(0, 5).map((item) => {
      const description = stripHtml(item.description);
      const pubDate = item.pubDate || "";
      return {
        title: stripHtml(item.title),
        description: description.slice(0, 200),
        fullText: description,
        sourceUrl: item.link,
        sourceName: extractSourceName(rssUrl),
        publishedAt: pubDate,
        publishedAgo: relativeTime(pubDate),
        category: categoryName,
        isSnippet: true,
      };
    });
  } catch {
    return [];
  }
}

/* ─── Post-processing: deduplicate, filter freshness, sort ─── */
function processArticles(raw: LiveArticle[]): LiveArticle[] {
  const now = Date.now();

  // 1. Filter: only articles published within FRESHNESS_MS
  const fresh = raw.filter((article) => {
    const t = new Date(article.publishedAt).getTime();
    if (isNaN(t)) return true; // keep articles with unparseable dates (better safe)
    return now - t <= FRESHNESS_MS;
  });

  // 2. Deduplicate: remove articles whose title is > 70% similar to an earlier one
  const deduped: LiveArticle[] = [];
  for (const article of fresh) {
    const isDuplicate = deduped.some(
      (existing) => titleSimilarity(existing.title, article.title) > 0.7
    );
    if (!isDuplicate) {
      deduped.push(article);
    }
  }

  // 3. Sort: newest first
  deduped.sort((a, b) => {
    const ta = new Date(a.publishedAt).getTime() || 0;
    const tb = new Date(b.publishedAt).getTime() || 0;
    return tb - ta;
  });

  return deduped;
}

/* ─── Main: fetch live news across all categories ─── */
export async function fetchLiveNews(): Promise<LiveArticle[]> {
  const allArticles: LiveArticle[] = [];

  const categories = Object.keys(CATEGORY_FEEDS);

  // Fetch all categories in parallel
  const results = await Promise.allSettled(
    categories.map(async (category) => {
      const feeds = CATEGORY_FEEDS[category];
      const articles: LiveArticle[] = [];

      // Try rss2json first
      for (const feed of feeds) {
        const items = await fetchFeed(feed.url, category);
        articles.push(...items);
      }

      // If rss2json failed for all feeds, try direct RSS
      if (articles.length === 0) {
        for (const feed of feeds) {
          const items = await fetchFeedDirect(feed.url, category);
          articles.push(...items);
        }
      }

      return articles;
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Process: deduplicate → filter freshness → sort
  const processed = processArticles(allArticles);

  if (processed.length < 5) {
    throw new Error("Insufficient fresh news articles fetched");
  }

  return processed;
}

/* ─── Cached news wrapper ─── */
interface CachedNews {
  articles: LiveArticle[];
  timestamp: number;
}

export async function getLiveNews(): Promise<LiveArticle[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedNews = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_TTL_MS && data.articles.length >= 5) {
        // Re-process cached articles (some may have aged out)
        return processArticles(data.articles);
      }
    }
  } catch {
    // Ignore cache read errors
  }

  // Fetch fresh news
  const articles = await fetchLiveNews();

  // Cache results
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ articles, timestamp: Date.now() } satisfies CachedNews)
    );
  } catch {
    // Ignore cache write errors
  }

  return articles;
}

/* ─── Category icon helper (exported for card UI) ─── */
export function getCategoryIcon(category: string): string {
  return category;
}
