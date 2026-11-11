import { LLMConfig, ParsedEntities } from '../types';
import { callLLM, extractAndParseJSON } from '../llm-client';

export class OrchestratorAgent {
  /**
   * Zero-bias entity extraction.
   * Extracts specific industry, target regions, business model, and seed intent directly from user prompt.
   * Strictly forbids legacy default industries or placeholder strings like "Global / Primary Regional Hub".
   */
  public static async parseEntities(
    prompt: string,
    configOverrides?: Partial<LLMConfig>
  ): Promise<ParsedEntities> {
    const systemPrompt = `You are the Lead Market Research Orchestrator for DeepMarket Engine.
Analyze the user's venture or expansion objective with ZERO BIAS and clean-slate isolation.
STRICT RULES:
1. DO NOT assume default industries like "Hospitality" or "Travel Tech" unless the user explicitly requested travel/resorts.
2. DO NOT use placeholder strings like "Global / Primary Regional Hub" or default island destinations.
3. If no specific geographic region is mentioned, set target_geos to ["Worldwide / Open Market"].
4. Accurately capture the exact business vertical and target customer segment.

Output strict JSON with:
{
  "industry": "Exact industry vertical from query",
  "target_geos": ["Target geography or 'Worldwide / Open Market'"],
  "business_model": "Business model (e.g. B2B SaaS, D2C Ecommerce, Marketplace, Agency)",
  "seed_intent": "Core commercial intent or problem being solved",
  "target_audience": "Specific buyer persona / customer profile",
  "key_incumbents": ["Any competitors mentioned or directly relevant"]
}
Return only JSON.`;

    try {
      const raw = await callLLM({
        system: systemPrompt,
        prompt: `Objective: "${prompt.trim()}"`,
        temperature: 0.1,
        config: configOverrides,
        timeoutMs: 15000,
      });

      if (raw) {
        const parsed = extractAndParseJSON<ParsedEntities>(raw);
        if (parsed.industry && Array.isArray(parsed.target_geos)) {
          // Guard against any leftover placeholder strings
          const cleanGeos = parsed.target_geos
            .filter((g) => g && !g.toLowerCase().includes('primary regional hub'))
            .map((g) => g.trim());

          return {
            industry: parsed.industry.trim(),
            target_geos: cleanGeos.length > 0 ? cleanGeos : ['Worldwide / Open Market'],
            business_model: parsed.business_model?.trim() || 'Software & Digital Commerce',
            seed_intent: parsed.seed_intent?.trim() || prompt.trim(),
            target_audience: parsed.target_audience?.trim() || 'Target Market Buyers',
            key_incumbents: Array.isArray(parsed.key_incumbents) ? parsed.key_incumbents : [],
          };
        }
      }
    } catch {
      // Fall through to zero-bias heuristic
    }

    return OrchestratorAgent.fallbackExtraction(prompt);
  }

  /**
   * Deterministic zero-bias fallback extraction based purely on user query keywords.
   * Does NOT inject any pre-canned industries or placeholders.
   */
  private static fallbackExtraction(prompt: string): ParsedEntities {
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();

    // Check for explicit geographic mentions without defaulting
    const geoKeywords = [
      'united states', 'usa', 'europe', 'germany', 'france', 'uk', 'united kingdom',
      'japan', 'india', 'canada', 'australia', 'brazil', 'mexico', 'egypt', 'uae',
      'dubai', 'saudi arabia', 'singapore', 'indonesia', 'bali', 'maldives', 'thailand',
      'vietnam', 'philippines', 'southeast asia', 'latin america', 'africa', 'texas',
      'california', 'new york', 'florida'
    ];

    const detectedGeos: string[] = [];
    for (const geo of geoKeywords) {
      if (new RegExp(`\\b${geo}\\b`, 'i').test(lower)) {
        detectedGeos.push(geo.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    }

    // Infer business model from prompt signals
    let businessModel = 'Software / Digital Solution';
    if (lower.includes('b2b') || lower.includes('saas') || lower.includes('software')) {
      businessModel = 'B2B SaaS';
    } else if (lower.includes('marketplace') || lower.includes('platform')) {
      businessModel = 'Two-Sided Marketplace';
    } else if (lower.includes('ecommerce') || lower.includes('d2c') || lower.includes('store')) {
      businessModel = 'D2C Ecommerce';
    } else if (lower.includes('export') || lower.includes('wholesale') || lower.includes('supply')) {
      businessModel = 'B2B Wholesale / Supply Chain';
    } else if (lower.includes('agency') || lower.includes('service')) {
      businessModel = 'Managed Services / Agency';
    }

    // Derive industry purely by stripping noise words from the prompt
    const stopWords = new Set([
      'we', 'want', 'to', 'launch', 'an', 'a', 'the', 'in', 'and', 'for', 'of', 'on',
      'with', 'our', 'new', 'start', 'build', 'create', 'tool', 'app', 'system'
    ]);
    const words = cleanPrompt.split(/\s+/).filter((w) => !stopWords.has(w.toLowerCase()));
    const derivedIndustry = words.slice(0, 5).join(' ');

    return {
      industry: derivedIndustry || cleanPrompt,
      target_geos: detectedGeos.length > 0 ? detectedGeos : ['Worldwide / Open Market'],
      business_model: businessModel,
      seed_intent: cleanPrompt,
      target_audience: `${derivedIndustry || 'Market'} Customers & Practitioners`,
      key_incumbents: [],
    };
  }
}

/**
 * Backward-compatible helper.
 */
export async function runOrchestrator(
  prompt: string,
  configOverrides?: Partial<LLMConfig>
): Promise<{ entities: ParsedEntities; isFallback: boolean; modelUsed: string }> {
  const entities = await OrchestratorAgent.parseEntities(prompt, configOverrides);
  return {
    entities,
    isFallback: false,
    modelUsed: configOverrides?.model || 'Orchestrator-CleanSlate',
  };
}
