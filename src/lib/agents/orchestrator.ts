import { ExtractedEntities, LLMConfig } from '../types';
import { callOpenAICompatible, extractAndParseJSON } from '../llm-client';

export interface OrchestratorResult {
  entities: ExtractedEntities;
  isFallback: boolean;
  modelUsed: string;
}

/**
 * Intelligent heuristic fallback parser if LLM endpoint is unreachable.
 * Extracts geos, business models, and industry vertical from the prompt.
 */
function heuristicEntityExtraction(query: string): ExtractedEntities {
  const lower = query.toLowerCase();

  // Extract known geographies
  const commonGeos = [
    'maldives', 'bali', 'indonesia', 'egypt', 'southeast asia', 'thailand', 'vietnam',
    'singapore', 'dubai', 'uae', 'saudi arabia', 'europe', 'north america', 'latam',
    'brazil', 'japan', 'india', 'kenya', 'turkey', 'philippines', 'mexico'
  ];
  const detectedGeos: string[] = [];
  for (const geo of commonGeos) {
    if (lower.includes(geo)) {
      detectedGeos.push(geo.charAt(0).toUpperCase() + geo.slice(1));
    }
  }
  if (detectedGeos.length === 0) {
    detectedGeos.push('Global / Primary Regional Hub');
  }

  // Extract Business Model
  let businessModel = 'B2B & B2C Hybrid Marketplace';
  if (lower.includes('b2b') || lower.includes('saas') || lower.includes('software')) {
    businessModel = 'B2B SaaS / Managed Workflow Platform';
  } else if (lower.includes('marketplace') || lower.includes('booking') || lower.includes('desk')) {
    businessModel = 'Two-Sided Commission & Transaction Marketplace';
  } else if (lower.includes('export') || lower.includes('supply') || lower.includes('food')) {
    businessModel = 'B2B Wholesale Trade & Supply Chain Logistics';
  } else if (lower.includes('esim') || lower.includes('telecom')) {
    businessModel = 'Digital Goods & Wholesale Reseller API';
  }

  // Extract Industry
  let industry = 'Hospitality, Travel Tech & Cross-Border Commerce';
  if (lower.includes('esim')) {
    industry = 'Travel Telecom & Connectivity SaaS';
  } else if (lower.includes('agro') || lower.includes('food') || lower.includes('export')) {
    industry = 'Specialty Agriculture & F&B Hospitality Supply';
  } else if (lower.includes('guesthouse') || lower.includes('resort')) {
    industry = 'Island Hospitality & Excursion Booking Technology';
  } else if (lower.includes('fintech') || lower.includes('payment')) {
    industry = 'Emerging Market Payments & Embedded Finance';
  }

  // Incumbents proxy
  const keyIncumbents = [
    'Legacy Regional Intermediaries',
    'Global Booking Aggregators (OTA Giants)',
    'Unorganized Local Offline Brokers',
    'Fragmented WhatsApp / Email Booking Desks'
  ];

  return {
    industry,
    geographies: detectedGeos,
    business_model: businessModel,
    key_incumbents: keyIncumbents,
  };
}

/**
 * Orchestrator Agent: Parses user objective, extracts entities, and creates execution blueprint.
 */
export async function runOrchestrator(
  query: string,
  configOverrides?: Partial<LLMConfig>
): Promise<OrchestratorResult> {
  const systemPrompt = `You are the Lead Market Research Orchestrator for DeepMarket Engine.
Analyze the user's venture or expansion objective and extract the core strategic entities in strict JSON format.

JSON schema:
{
  "industry": "Primary industry vertical",
  "geographies": ["Primary Target Region 1", "Target Region 2"],
  "business_model": "Core monetization & operating structure",
  "key_incumbents": ["Incumbent 1", "Incumbent 2", "Incumbent 3"]
}
Return only valid JSON.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: `Market Entry Query: "${query}"` },
  ];

  const result = await callOpenAICompatible(messages, configOverrides, 12000);

  if (!result.isFallback && result.content) {
    try {
      const parsed = extractAndParseJSON<ExtractedEntities>(result.content);
      if (parsed.industry && Array.isArray(parsed.geographies)) {
        return {
          entities: parsed,
          isFallback: false,
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      // Fall through to heuristic fallback
    }
  }

  return {
    entities: heuristicEntityExtraction(query),
    isFallback: true,
    modelUsed: result.modelUsed || 'Heuristic Fallback Engine',
  };
}
