/**
 * Zero-dependency Live Search and Autocomplete Tool.
 * Queries live Google Suggest and DuckDuckGo Autocomplete APIs and scrapes live SERP rankings
 * without API keys or external SDKs.
 */

export interface AutocompleteResult {
  query: string;
  source: 'google_suggest' | 'duckduckgo_autocomplete';
}

export interface LiveSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export class LiveSearchTool {
  private static readonly DEFAULT_TIMEOUT_MS = 5000;
  private static readonly USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  /**
   * Fetches real user query completions from Google Suggest.
   */
  public static async fetchGoogleSuggestions(
    query: string,
    timeoutMs: number = LiveSearchTool.DEFAULT_TIMEOUT_MS
  ): Promise<string[]> {
    if (!query || !query.trim()) return [];

    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
      query.trim()
    )}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': LiveSearchTool.USER_AGENT,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return [];
      const data = await res.json();
      // Google Suggest format: [query, [suggestion1, suggestion2, ...]]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return (data[1] as string[]).filter(
          (s) => typeof s === 'string' && s.trim().length > 0 && s.toLowerCase() !== query.toLowerCase()
        );
      }
      return [];
    } catch {
      clearTimeout(timer);
      return [];
    }
  }

  /**
   * Fetches real user query completions from DuckDuckGo Autocomplete.
   */
  public static async fetchDuckDuckGoSuggestions(
    query: string,
    timeoutMs: number = LiveSearchTool.DEFAULT_TIMEOUT_MS
  ): Promise<string[]> {
    if (!query || !query.trim()) return [];

    const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query.trim())}&type=list`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': LiveSearchTool.USER_AGENT,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return [];
      const data = await res.json();
      // DDG list format: [query, [suggestion1, suggestion2, ...]]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return (data[1] as string[]).filter(
          (s) => typeof s === 'string' && s.trim().length > 0 && s.toLowerCase() !== query.toLowerCase()
        );
      }
      return [];
    } catch {
      clearTimeout(timer);
      return [];
    }
  }

  /**
   * Aggregates real autocomplete queries across Google Suggest and DuckDuckGo.
   */
  public static async getCombinedSuggestions(
    seedQuery: string,
    variations: string[] = []
  ): Promise<AutocompleteResult[]> {
    const queriesToTest = [seedQuery, ...variations].filter(Boolean);
    const results: AutocompleteResult[] = [];
    const seenQueries = new Set<string>();

    const promises = queriesToTest.map(async (q) => {
      const [google, ddg] = await Promise.all([
        LiveSearchTool.fetchGoogleSuggestions(q),
        LiveSearchTool.fetchDuckDuckGoSuggestions(q),
      ]);
      return { google, ddg };
    });

    const settled = await Promise.all(promises);

    for (const item of settled) {
      for (const s of item.google) {
        const norm = s.toLowerCase().trim();
        if (!seenQueries.has(norm)) {
          seenQueries.add(norm);
          results.push({ query: s.trim(), source: 'google_suggest' });
        }
      }
      for (const s of item.ddg) {
        const norm = s.toLowerCase().trim();
        if (!seenQueries.has(norm)) {
          seenQueries.add(norm);
          results.push({ query: s.trim(), source: 'duckduckgo_autocomplete' });
        }
      }
    }

    return results;
  }

  /**
   * Scrapes live search rankings from DuckDuckGo HTML search to extract real ranking competitor domains.
   */
  public static async scrapeLiveRankings(
    query: string,
    limit: number = 8,
    timeoutMs: number = LiveSearchTool.DEFAULT_TIMEOUT_MS
  ): Promise<LiveSearchResult[]> {
    if (!query || !query.trim()) return [];

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.trim())}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': LiveSearchTool.USER_AGENT,
          Accept: 'text/html',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return [];
      const html = await res.text();

      const searchResults: LiveSearchResult[] = [];
      const seenDomains = new Set<string>();

      // Extract result elements: look for class="result__snippet" or uddg= urls
      const regex = /href="(?:\/\/duckduckgo\.com\/l\/\?uddg=)([^"&]+)[^"]*"/gi;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(html)) !== null && searchResults.length < limit) {
        try {
          const rawUrl = decodeURIComponent(match[1]);
          if (!rawUrl.startsWith('http')) continue;

          const parsedUrl = new URL(rawUrl);
          const domain = parsedUrl.hostname.replace(/^www\./, '');

          // Filter out search engines, social aggregators, or encyclopedias for competitor extraction
          const ignoredDomains = [
            'duckduckgo.com',
            'google.com',
            'bing.com',
            'yahoo.com',
            'wikipedia.org',
            'youtube.com',
          ];
          if (ignoredDomains.some((d) => domain.includes(d))) continue;

          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            searchResults.push({
              title: `${domain.split('.')[0].toUpperCase()} Platform / Service`,
              url: rawUrl,
              domain,
              snippet: `Live ranking domain in SERP for query: "${query}"`,
            });
          }
        } catch {
          // ignore malformed URLs
        }
      }

      return searchResults;
    } catch {
      clearTimeout(timer);
      return [];
    }
  }
}
