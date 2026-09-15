/**
 * Live news service — fetches real-world headlines from major RSS feeds.
 * Caches results for 30 minutes. Falls back to static samples on any error.
 */

export interface LiveArticle {
  title: string;
  description: string;
  fullText: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  category: string;
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
  World: "🌍",
  Conflicts: "⚔️",
  Politics: "🏛️",
  Economy: "💰",
  "Science & Tech": "🔬",
  Environment: "🌡️",
};

const CACHE_KEY = "veritas_live_news";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

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
      const re = new RegExp(`<${tag}[^>]*><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

/* ─── Fetch & parse a single RSS feed ─── */
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
      .slice(0, 4)
      .map(
        (item: {
          title: string;
          link: string;
          pubDate: string;
          description: string;
          author?: string;
        }): LiveArticle => ({
          title: stripHtml(item.title),
          description: stripHtml(item.description).slice(0, 200),
          fullText: stripHtml(item.description),
          sourceUrl: item.link,
          sourceName: item.author || extractSourceName(url),
          publishedAt: item.pubDate || new Date().toISOString(),
          category: categoryName,
        })
      );
  } catch {
    // Silently fail individual feeds — others will still work
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

    return items.slice(0, 4).map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description).slice(0, 200),
      fullText: stripHtml(item.description),
      sourceUrl: item.link,
      sourceName: extractSourceName(rssUrl),
      publishedAt: item.pubDate || new Date().toISOString(),
      category: categoryName,
    }));
  } catch {
    return [];
  }
}

/* ─── Main: fetch live news across all categories ─── */
export async function fetchLiveNews(): Promise<LiveArticle[]> {
  const allArticles: LiveArticle[] = [];
  const seenTitles = new Set<string>();

  const categories = Object.keys(CATEGORY_FEEDS);

  // Fetch all categories in parallel
  const results = await Promise.allSettled(
    categories.map(async (category) => {
      const feeds = CATEGORY_FEEDS[category];
      const articles: LiveArticle[] = [];

      // Try rss2json first (most reliable)
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

      // Deduplicate by similar titles
      return articles.filter((article) => {
        const normalizedTitle = article.title.toLowerCase().slice(0, 50);
        if (seenTitles.has(normalizedTitle)) return false;
        seenTitles.add(normalizedTitle);
        return true;
      });
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // If we got fewer than 5 articles, something is very wrong
  if (allArticles.length < 5) {
    throw new Error("Insufficient news articles fetched");
  }

  return allArticles;
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
        return data.articles;
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
    // Ignore cache write errors (e.g., storage full)
  }

  return articles;
}

/* ─── Category icon helper (exported for card UI) ─── */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "📰";
}
