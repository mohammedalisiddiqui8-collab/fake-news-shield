/**
 * Live news service — fetches real-world headlines from major RSS feeds.
 * - Deduplicates by fuzzy title matching
 * - Filters articles older than 48 hours
 * - Sorts by publication time (newest first)
 * - Tracks snippet vs full-text availability
 * - Caches results for 30 minutes
 * - Falls back to static samples on any error
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

interface SampleArticle {
  label: string;
  text: string;
  type: "real" | "fake";
  category: string;
}

/* ─── Static fallback (unchanged from original) ─── */
export const FALLBACK_SAMPLES: SampleArticle[] = [
  {
    label: "Scientists Discover New Species",
    text: "In a groundbreaking discovery, a team of marine biologists from the University of Oxford has identified a previously unknown deep-sea species in the Mariana Trench. The creature, dubbed 'Abyssalus luminaris,' was found at a depth of 8,200 meters during a three-month expedition funded by the National Science Foundation. Lead researcher Dr. Sarah Chen published the findings in the journal Nature on March 15, 2025, noting the species' bioluminescent properties were unlike anything documented before. The discovery was independently verified by teams from MIT and the Woods Hole Oceanographic Institution.",
    type: "real",
    category: "Science",
  },
  {
    label: "Miracle Cure Hidden by Big Pharma",
    text: "EXPOSED!!! A secret natural cure for ALL diseases has been kept hidden by the corrupt pharmaceutical industry for DECADES!!! An anonymous insider known only as 'Dr. Truth' revealed in a viral Telegram post that a simple mixture of turmeric, apple cider vinegar, and lemon juice can cure cancer, diabetes, AND heart disease!!! The government doesn't want you to know this because they make BILLIONS from keeping you sick!!! Studies PROVE this works but the mainstream media won't report it because they're all PAID OFF!!! Share this before they delete it!!!",
    type: "fake",
    category: "Health",
  },
  {
    label: "Market Rate Report",
    text: "The Federal Reserve held interest rates steady at 5.25-5.50% during its January 2025 meeting, as widely anticipated by economists. Fed Chair Jerome Powell stated in the post-meeting press conference that while inflation has decreased from its 2022 peak of 9.1% to approximately 2.9%, the committee needs 'more confidence' that inflation is sustainably moving toward the 2% target before considering cuts. Markets reacted modestly, with the S&P 500 closing 0.3% lower. Analysts at Goldman Sachs and JPMorgan continue to project the first rate cut in June.",
    type: "real",
    category: "Finance",
  },
  {
    label: "Political Conspiracy Post",
    text: "WAKE UP SHEEPLE!!! The deep state doesn't want you to know that the 2024 election was completely STOLEN by globalist elites!!! Anonymous sources confirm that George Soros paid millions to rig the voting machines!!! The mainstream media is covering it all up because they're controlled by the new world order!!! Do your own research before they censor this!!! Share before they delete it!!! The truth is OUT THERE but the corrupt politicians don't want you to see it!!!",
    type: "fake",
    category: "Politics",
  },
  {
    label: "Climate Change Report",
    text: "A comprehensive study published in the journal Science on February 12, 2025, has found that global sea levels rose by 4.5 millimeters in 2024, the fastest annual increase ever recorded. The research, conducted by scientists at NASA's Goddard Institute for Space Studies and the University of Copenhagen, analyzed satellite data from 2015 to 2024. Lead author Dr. Michael Torres stated that the findings 'confirm the accelerating trend predicted by climate models.' The study notes that while some skeptics question the methodology, the results have been independently verified.",
    type: "real",
    category: "Environment",
  },
  {
    label: "Celebrity Health Rumor",
    text: "SHOCKING!!! Famous Hollywood star secretly DEAD but government hiding it from public!!! Sources say the celebrity was assassinated because they knew too much about big pharma's secret experiments!!! Friends are being threatened to stay silent!!! The deep state doesn't want you to know the truth!!! Wake up people!!! This is bigger than any conspiracy you've ever seen!!! The mainstream media won't report it because they're all controlled by the elite!!! Share this before they delete it!!!",
    type: "fake",
    category: "Entertainment",
  },
];

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
