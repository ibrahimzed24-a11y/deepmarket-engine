export interface ScrapedBrandContext {
  url: string;
  domain: string;
  title: string;
  description: string;
  h1_headings: string[];
  pricing_signals: string[];
  sample_copy: string;
}

export class BrandScraper {
  static extractUrlOrDomain(text: string): string | null {
    const rawMatch = text.match(/https?:\/\/[^\s]+/i) || text.match(/\b([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)\b/i);
    if (!rawMatch) return null;
    let url = rawMatch[0];
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    // Filter out common false positives
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('google.com') || host.includes('reddit.com') || host.includes('bing.com')) {
        return null;
      }
      return url;
    } catch {
      return null;
    }
  }

  static async scrapeBrand(targetUrl: string): Promise<ScrapedBrandContext | null> {
    try {
      const parsed = new URL(targetUrl);
      const domain = parsed.hostname.replace(/^www\./, '');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const html = await res.text();

      let title = domain;
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch?.[1]) {
        title = titleMatch[1].replace(/\s+/g, ' ').trim();
      }

      let description = '';
      const descMatch =
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      if (descMatch?.[1]) {
        description = descMatch[1].replace(/\s+/g, ' ').trim();
      }

      const h1_headings: string[] = [];
      const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
      for (const m of h1Matches) {
        const cleanH1 = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (cleanH1 && cleanH1.length > 2 && h1_headings.length < 4) {
          h1_headings.push(cleanH1);
        }
      }

      const pricing_signals: string[] = [];
      const priceMatches = html.match(/\$[0-9]{1,5}(?:,[0-9]{3})*(?:\.[0-9]{2})?(?:\s*\/\s*(?:mo|month|yr|year))?/gi);
      if (priceMatches) {
        pricing_signals.push(...Array.from(new Set(priceMatches)).slice(0, 5));
      }

      // Extract sample text copy from paragraphs
      const pMatches = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
      const cleanParas = pMatches
        .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 30 && p.length < 300);

      const sample_copy = cleanParas.slice(0, 3).join(' ') || description;

      return {
        url: targetUrl,
        domain,
        title,
        description,
        h1_headings,
        pricing_signals,
        sample_copy,
      };
    } catch {
      return null;
    }
  }
}
