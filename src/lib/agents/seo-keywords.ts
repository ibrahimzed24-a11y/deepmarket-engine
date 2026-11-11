import { ExtractedEntities, LLMConfig, SEOKeywordArtifact } from '../types';
import { callOpenAICompatible, extractAndParseJSON } from '../llm-client';

export interface SEOKeywordResult {
  artifact: SEOKeywordArtifact;
  isFallback: boolean;
  modelUsed: string;
}

function generateSynthesizedSEOKeywords(query: string, entities: ExtractedEntities): SEOKeywordArtifact {
  const primaryGeo = entities.geographies[0] || 'Island';
  const secondaryGeo = entities.geographies[1] || 'Regional';
  const isTravel =
    query.toLowerCase().includes('resort') ||
    query.toLowerCase().includes('excursion') ||
    query.toLowerCase().includes('bali') ||
    query.toLowerCase().includes('maldives') ||
    query.toLowerCase().includes('hotel') ||
    query.toLowerCase().includes('tourist');

  if (isTravel) {
    return {
      seed_keywords: [
        `eco resort booking ${primaryGeo.toLowerCase()}`,
        `island excursion desk ${secondaryGeo.toLowerCase()}`,
        `private speedboat transfer ${primaryGeo.toLowerCase()}`,
        `luxury sustainable villas ${primaryGeo.toLowerCase()}`,
        `local island tour operator ${secondaryGeo.toLowerCase()}`,
      ],
      long_tail_clusters: [
        {
          cluster: 'High-Intent Island Transfers & Excursions',
          keywords: [
            `how to book private speedboat ${primaryGeo.toLowerCase()} price`,
            `best manta ray snorkeling tour ${primaryGeo.toLowerCase()}`,
            `shared vs private transfer from male airport to guesthouse`,
            `eco diving excursions ${secondaryGeo.toLowerCase()} certified`,
          ],
          search_intent: 'Transactional',
          volume_proxy: '24,500/mo',
          difficulty_score: 34,
          cpc_proxy: '$3.40',
        },
        {
          cluster: 'Eco-Resort & Sustainable Stay Arbitrage',
          keywords: [
            `top 10 off grid solar eco resorts ${primaryGeo.toLowerCase()}`,
            `affordable luxury overwater bungalow with sustainability audit`,
            `eco retreat ${secondaryGeo.toLowerCase()} direct booking discount`,
          ],
          search_intent: 'Commercial',
          volume_proxy: '18,200/mo',
          difficulty_score: 28,
          cpc_proxy: '$2.85',
        },
        {
          cluster: 'Travel Logistics & Local Island Regulations',
          keywords: [
            `local island bikini beach rules ${primaryGeo.toLowerCase()} 2026`,
            `green tax per night maldives guesthouse calculation`,
            `best sim card and payment method for bali digital nomads`,
          ],
          search_intent: 'Informational',
          volume_proxy: '42,000/mo',
          difficulty_score: 19,
          cpc_proxy: '$0.80',
        },
        {
          cluster: 'Branded OTA Alternative Queries',
          keywords: [
            `direct booking vs booking com ${primaryGeo.toLowerCase()} resorts`,
            `local excursion desk vs resort tour markup difference`,
          ],
          search_intent: 'Navigational',
          volume_proxy: '9,800/mo',
          difficulty_score: 41,
          cpc_proxy: '$4.10',
        },
      ],
      search_intent_distribution: {
        transactional: 38,
        commercial: 32,
        informational: 22,
        navigational: 8,
      },
      content_gaps: [
        'Complete lack of transparent, real-time speedboat schedule aggregators with instant digital checkout.',
        'Zero structured guides comparing local island guesthouse excursions against 5-star resort captive pricing (3x to 5x price arbitrage).',
        'Outdated post-2023 regulatory guides missing updated digital nomad visa and green tax payment rails.',
      ],
      programmatic_angles: [
        '/excursions/[atoll-or-region]/[activity-slug] (e.g., /excursions/baa-atoll/manta-safari)',
        '/transfers/from-[origin]-to-[destination-island]-schedule-fares',
        '/resorts/[resort-name]/alternative-eco-villas',
        '/guides/[island-name]/best-local-dive-shops-ranked',
      ],
    };
  }

  // Generic B2B / SaaS fallback
  return {
    seed_keywords: [
      `${entities.industry.toLowerCase()} platform`,
      `best software for ${entities.industry.toLowerCase()}`,
      `b2b marketplace ${primaryGeo.toLowerCase()}`,
      `automated ${entities.business_model.toLowerCase()} solutions`,
    ],
    long_tail_clusters: [
      {
        cluster: 'High-Intent Solution Discovery',
        keywords: [
          `enterprise ${entities.industry.toLowerCase()} pricing comparison`,
          `top rated platforms for ${entities.industry.toLowerCase()}`,
          `modern alternatives to legacy trade intermediaries`,
        ],
        search_intent: 'Commercial',
        volume_proxy: '14,000/mo',
        difficulty_score: 38,
        cpc_proxy: '$6.50',
      },
      {
        cluster: 'Operational Implementation & Workflow',
        keywords: [
          `how to streamline supply chain across ${primaryGeo.toLowerCase()}`,
          `api integration guide for regional merchant payments`,
          `compliance checklist for cross-border transactions`,
        ],
        search_intent: 'Informational',
        volume_proxy: '31,000/mo',
        difficulty_score: 22,
        cpc_proxy: '$1.40',
      },
      {
        cluster: 'Procurement & Switcher Intent',
        keywords: [
          `switch from manual spreadsheets to automated b2b platform`,
          `customs clearance automation software ${secondaryGeo.toLowerCase()}`,
        ],
        search_intent: 'Transactional',
        volume_proxy: '8,200/mo',
        difficulty_score: 45,
        cpc_proxy: '$8.20',
      },
    ],
    search_intent_distribution: {
      transactional: 35,
      commercial: 35,
      informational: 25,
      navigational: 5,
    },
    content_gaps: [
      'In-depth, un-gated benchmark reports dissecting gross margin leakage in legacy distributor networks.',
      'Interactive ROI and unit economics calculators comparing direct digital sourcing versus multi-tiered brokers.',
    ],
    programmatic_angles: [
      '/solutions/[vertical]/[use-case]-calculator',
      '/integrations/[regional-erp-or-pos]-sync',
      '/compare/[legacy-competitor]-vs-modern-platform',
    ],
  };
}

export async function runSEOKeywordsAgent(
  query: string,
  entities: ExtractedEntities,
  configOverrides?: Partial<LLMConfig>
): Promise<SEOKeywordResult> {
  const systemPrompt = `You are the Lead SEO & Keyword Arbitrage Strategist for DeepMarket Engine.
Identify high-intent search queries, long-tail keyword clusters, search intent distribution, content gaps, and programmatic SEO URL architectures.

Output strict JSON matching this schema:
{
  "seed_keywords": ["keyword 1", "keyword 2"],
  "long_tail_clusters": [
    {
      "cluster": "Cluster Title",
      "keywords": ["kw 1", "kw 2"],
      "search_intent": "Transactional | Commercial | Informational | Navigational",
      "volume_proxy": "XX,XXX/mo",
      "difficulty_score": 35,
      "cpc_proxy": "$X.XX"
    }
  ],
  "search_intent_distribution": {
    "transactional": 40,
    "commercial": 30,
    "informational": 20,
    "navigational": 10
  },
  "content_gaps": ["Gap 1", "Gap 2"],
  "programmatic_angles": ["/path/[param]", "/path2/[param]"]
}
Return only JSON.`;

  const userContent = `Industry: ${entities.industry}
Geographies: ${entities.geographies.join(', ')}
Business Model: ${entities.business_model}
Objective: "${query}"`;

  const result = await callOpenAICompatible(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    configOverrides,
    18000
  );

  if (!result.isFallback && result.content) {
    try {
      const parsed = extractAndParseJSON<SEOKeywordArtifact>(result.content);
      if (Array.isArray(parsed.seed_keywords) && Array.isArray(parsed.long_tail_clusters)) {
        return {
          artifact: parsed,
          isFallback: false,
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    artifact: generateSynthesizedSEOKeywords(query, entities),
    isFallback: true,
    modelUsed: result.modelUsed || 'SEO Keyword Arbitrage Engine',
  };
}
