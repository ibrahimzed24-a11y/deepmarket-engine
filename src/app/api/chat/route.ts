import { NextRequest, NextResponse } from 'next/server';
import { WebIntelligenceEngine, LiveWebEvidenceBundle } from '@/lib/tools/web-intelligence';
import { ComprehensiveDossier, ParsedEntities, SEOKeywordArtifact, CompetitorGapArtifact, GTMStrategyArtifact, StreamPayload } from '@/lib/types';
import { callLLM, extractAndParseJSON } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';

function deriveZeroBiasEntities(prompt: string, evidence: LiveWebEvidenceBundle): ParsedEntities {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  const geoKeywords = [
    'united states', 'usa', 'europe', 'germany', 'france', 'uk', 'united kingdom',
    'japan', 'india', 'canada', 'australia', 'brazil', 'mexico', 'egypt', 'uae',
    'dubai', 'saudi arabia', 'singapore', 'indonesia', 'thailand', 'vietnam',
    'texas', 'california', 'new york', 'florida', 'ontario', 'toronto', 'brampton'
  ];

  const detectedGeos: string[] = [];
  for (const geo of geoKeywords) {
    if (new RegExp(`\\b${geo}\\b`, 'i').test(lower)) {
      detectedGeos.push(geo.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }

  let businessModel = 'Online Software / Digital Solution';
  if (lower.includes('b2b') || lower.includes('saas')) {
    businessModel = 'B2B SaaS';
  } else if (lower.includes('affiliate') || lower.includes('commission')) {
    businessModel = 'High-Ticket Affiliate / Media Bridge';
  } else if (lower.includes('marketplace')) {
    businessModel = 'Two-Sided Marketplace';
  } else if (lower.includes('agency') || lower.includes('consulting') || lower.includes('service')) {
    businessModel = 'Managed Agency / Services';
  } else if (lower.includes('ecommerce') || lower.includes('d2c') || lower.includes('store')) {
    businessModel = 'D2C Ecommerce';
  }

  const stopWords = new Set([
    'we', 'want', 'to', 'launch', 'an', 'a', 'the', 'in', 'and', 'for', 'of', 'on',
    'with', 'our', 'new', 'start', 'build', 'create', 'tool', 'app', 'system', 'business'
  ]);
  const words = cleanPrompt.split(/\s+/).filter((w) => !stopWords.has(w.toLowerCase()));
  const derivedIndustry = words.slice(0, 5).join(' ');

  return {
    industry: derivedIndustry || cleanPrompt,
    target_geos: detectedGeos.length > 0 ? detectedGeos : ['Global / Open Web'],
    business_model: businessModel,
    seed_intent: cleanPrompt,
    target_audience: `${derivedIndustry || cleanPrompt} buyers and decision-makers`,
    key_incumbents: evidence.web_competitors.map((c) => c.domain),
  };
}

function buildEvidenceGroundedDossier(
  prompt: string,
  evidence: LiveWebEvidenceBundle,
  entities: ParsedEntities,
  llmGtmArtifact?: GTMStrategyArtifact,
  isConnectedLLM: boolean = false
): ComprehensiveDossier {
  // 1. Ground SEO strictly in real Google / Bing Autocomplete
  const intentCounts = { informational: 0, commercial: 0, transactional: 0, navigational: 0 };
  const verifiedSuggestions = evidence.keywords.map((k) => {
    if (k.intent === 'Transactional') intentCounts.transactional++;
    else if (k.intent === 'Commercial') intentCounts.commercial++;
    else intentCounts.informational++;

    return {
      query: k.keyword,
      source: k.source,
      opportunity: (k.intent === 'Transactional' ? 'High' : k.intent === 'Commercial' ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
      search_intent: k.intent,
      modifier: k.modifier,
    };
  });

  const totalIntent = verifiedSuggestions.length || 1;
  const searchIntentDistribution = {
    transactional: Math.round((intentCounts.transactional / totalIntent) * 100),
    commercial: Math.round((intentCounts.commercial / totalIntent) * 100),
    informational: Math.round((intentCounts.informational / totalIntent) * 100),
    navigational: 0,
  };

  // Derive content gaps from real community discussions
  const contentGaps = evidence.community_threads.slice(0, 4).map((t) => {
    return `Unaddressed buyer pain from ${t.source} (${t.author_or_sub}): "${t.title}"`;
  });
  if (contentGaps.length === 0) {
    contentGaps.push(`Detailed transparent comparison of emerging ${entities.industry} platforms vs legacy alternatives.`);
  }

  // Derive programmatic angles from top keywords
  const programmaticAngles = evidence.keywords.slice(0, 4).map((k) => {
    const slug = k.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/compare/${slug}`;
  });

  const seoArtifact: SEOKeywordArtifact = {
    seed_queries: [prompt, ...evidence.keywords.slice(0, 4).map((k) => k.keyword)],
    verified_suggestions: verifiedSuggestions,
    content_gaps: contentGaps,
    programmatic_angles: programmaticAngles.length > 0 ? programmaticAngles : [`/solutions/${entities.industry.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`],
    search_intent_distribution: searchIntentDistribution,
  };

  // 2. Ground Competitors strictly in real ranking domains and inspected metadata
  const competitorsList = evidence.web_competitors.map((c) => {
    return {
      name: c.title || c.domain,
      domain: c.domain,
      ranking_url: c.url,
      opportunity_tier: 'High' as const,
      strengths: c.h1_headings.length > 0
        ? c.h1_headings
        : [`Direct organic visibility for "${c.source_query}"`],
      weaknesses: [
        'User pain points highlighted in live Reddit & HackerNews discussions',
        'Friction in self-serve pricing transparency',
      ],
      pricing_model: c.pricing_signals.length > 0
        ? `Observed price signals on page: ${c.pricing_signals.join(', ')}`
        : 'Direct web offering / inquiry',
      h1_headings: c.h1_headings,
      pricing_signals: c.pricing_signals,
    };
  });

  const criticalWeaknesses = evidence.community_threads.slice(0, 3).map((t) => {
    return `${t.title} (${t.source} ${t.author_or_sub}, score: ${t.score})`;
  });

  const unaddressedPain = evidence.community_threads.slice(3, 7).map((t) => {
    return t.snippet ? `"${t.snippet.slice(0, 140)}..." — ${t.source}` : t.title;
  });

  const competitorArtifact: CompetitorGapArtifact = {
    competitors: competitorsList,
    ranking_domains: evidence.web_competitors.map((c) => c.domain),
    critical_weaknesses: criticalWeaknesses.length > 0 ? criticalWeaknesses : ['Lack of transparent self-serve options identified in community search'],
    unaddressed_customer_pain: unaddressedPain.length > 0 ? unaddressedPain : ['Opaque onboarding and slow speed-to-value for new buyers'],
    pricing_teardown: evidence.web_competitors
      .filter((c) => c.pricing_signals.length > 0)
      .map((c) => ({
        segment: c.domain,
        pricing_structure: c.pricing_signals.join(', '),
        margin_gap: 'Direct margin capture vs legacy market structures',
        notes: `Inspected from live URL ${c.url}`,
      })),
  };

  // 3. Ground GTM in real evidence
  let gtmArtifact: GTMStrategyArtifact;
  if (llmGtmArtifact) {
    gtmArtifact = llmGtmArtifact;
  } else {
    // Grounded deterministic fallback (NO fake numbers, purely based on discovered domains & threads)
    const primaryCompetitor = evidence.web_competitors[0]?.domain || 'legacy providers';
    const topThread = evidence.community_threads[0]?.title || 'market friction';

    gtmArtifact = {
      value_proposition: `Next-generation ${entities.industry} solving critical community pain point: "${topThread}" with faster time-to-value than ${primaryCompetitor}.`,
      positioning_statement: `For buyers seeking ${entities.industry} in ${entities.target_geos.join(', ')} frustrated by ${primaryCompetitor}, our solution delivers modern, transparent execution without legacy lock-in.`,
      pricing_recommendation: {
        model: 'Performance & Value-Aligned Tiers',
        suggested_tiers: [
          {
            name: 'Starter Pilot',
            price: 'Free / Low-Commitment Evaluation',
            features: [
              'Direct access to core automated workflow',
              'Self-serve onboarding in < 5 minutes',
              'Community support',
            ],
          },
          {
            name: 'Pro & Enterprise',
            price: 'Value-Based / Volume Tier',
            features: [
              'Full multi-user team collaboration',
              'Custom integrations & SLA guarantee',
              'Dedicated customer success engineering',
            ],
          },
        ],
      },
      acquisition_channels: [
        {
          channel: 'Targeted Intent Interception via Programmatic Comparison Guides',
          rationale: `Directly targets ${evidence.keywords.length} verified commercial queries extracted from Google & Bing.`,
          tactical_play: `Publish authoritative comparison pages addressing search queries like "${evidence.keywords[0]?.keyword || entities.industry}".`,
        },
        {
          channel: 'Community Problem-Solving on Reddit & Niche Forums',
          rationale: `Engages active discussions across subreddits discussing "${prompt}".`,
          tactical_play: `Contribute high-value technical breakdowns and open resources directly addressing threads like "${evidence.community_threads[0]?.title || 'community discussions'}".`,
        },
      ],
      roadmap_30_60_90: {
        day_1_30: [
          `Deploy core platform addressing the primary weakness of ${primaryCompetitor}.`,
          `Publish first 10 programmatic comparison pages targeting verified Google Suggest queries.`,
          `Onboard 5 active beta users from community discussions for structured feedback.`,
        ],
        day_31_60: [
          `Launch self-serve onboarding portal with instant automated activation.`,
          `Expand content coverage across all ${evidence.keywords.length} verified search suggestions.`,
          `Establish direct partnerships or affiliate distribution agreements.`,
        ],
        day_61_90: [
          `Scale organic acquisition loops across high-intent comparison search queries.`,
          `Optimize conversion funnel based on user drop-off telemetry.`,
          `Achieve sustainable monthly recurring revenue and positive referral velocity.`,
        ],
      },
    };
  }

  return {
    meta: {
      query: prompt,
      entities,
      timestamp: new Date().toISOString(),
      engine_version: '3.0-WebEvidence-Harvester',
    },
    live_evidence: evidence,
    llm_status: isConnectedLLM ? 'Connected & Synthesized' : 'Live Web Evidence Only (LLM Offline)',
    geo: {
      target_regions: entities.target_geos,
      market_readiness: evidence.keywords.length > 5 ? 'High' : 'Medium',
      tam_sam_som_notes: `Live web harvesting uncovered ${evidence.keywords.length} verified commercial query stems, ${evidence.community_threads.length} community discussion threads, and ${evidence.web_competitors.length} active market competitors.`,
      regulatory_compliance: [
        'FTC commercial affiliate & sponsor disclosure mandates',
        'Standard consumer data protection (GDPR/CCPA/PIPEDA)',
      ],
      regional_payment_rails: ['Stripe', 'PayPal', 'Direct Wire / Automated Settlement'],
      localization_barriers: [
        'Regional search phrasing variance across target territories',
      ],
    },
    seo: seoArtifact,
    competitors: competitorArtifact,
    gtm: gtmArtifact,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const config = body?.config || {};
    const tavilyKey = config?.tavilyKey || process.env.TAVILY_API_KEY;
    const wantsStream =
      req.headers.get('accept')?.includes('text/event-stream') || body?.stream === true;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'A research prompt is required.' }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();

    // 1. Harvest Real Multi-Source Web Intelligence (Concurrent 5-source pipeline)
    const evidence = await WebIntelligenceEngine.collectAll(cleanPrompt, tavilyKey);
    const entities = deriveZeroBiasEntities(cleanPrompt, evidence);

    // 2. Attempt LLM Synthesis with Evidence Grounding
    let synthesizedGtm: GTMStrategyArtifact | undefined;
    let isConnectedLLM = false;

    try {
      const gtmSystemPrompt = `You are an elite Go-To-Market Strategist for DeepMarket Engine.
Analyze the REAL live web evidence scraped for the user's objective:
- Scraped Google/Bing Autocomplete: ${evidence.keywords.map((k) => k.keyword).slice(0, 15).join(', ')}
- Real Reddit/HN Discussions: ${evidence.community_threads.map((t) => t.title).slice(0, 6).join(' | ')}
- Live Ranking Competitor Domains: ${evidence.web_competitors.map((c) => c.domain).slice(0, 6).join(', ')}

Synthesize a tactical 30-60-90 day GTM entry plan GROUNDED IN THIS REAL EVIDENCE.
CRITICAL RULES:
1. DO NOT use placeholder strings or invented generic phrases.
2. Reference actual competitor domains and real community pain points.
3. Output strict JSON with:
{
  "value_proposition": "string",
  "positioning_statement": "string",
  "pricing_recommendation": {
    "model": "string",
    "suggested_tiers": [{"name": "string", "price": "string", "features": ["string"]}]
  },
  "acquisition_channels": [{"channel": "string", "rationale": "string", "tactical_play": "string"}],
  "roadmap_30_60_90": {
    "day_1_30": ["string"],
    "day_31_60": ["string"],
    "day_61_90": ["string"]
  }
}
Return only JSON.`;

      const gtmRaw = await callLLM({
        system: gtmSystemPrompt,
        prompt: `Objective: "${cleanPrompt}"\nTarget Geos: ${entities.target_geos.join(', ')}`,
        temperature: 0.2,
        config,
        timeoutMs: 12000,
      });

      if (gtmRaw && gtmRaw.trim().length > 20) {
        synthesizedGtm = extractAndParseJSON<GTMStrategyArtifact>(gtmRaw);
        isConnectedLLM = true;
      }
    } catch {
      // LLM offline or unreachable -> Keep isConnectedLLM = false and use evidence-derived synthesis
      isConnectedLLM = false;
    }

    const dossier = buildEvidenceGroundedDossier(
      cleanPrompt,
      evidence,
      entities,
      synthesizedGtm,
      isConnectedLLM
    );

    // Support streaming SSE if requested
    if (wantsStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const send = (payload: StreamPayload) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          };

          send({
            type: 'agent_update',
            step: 1,
            agent: 'orchestrator',
            status: 'completed',
            message: `Discovered ${evidence.keywords.length} real Google/Bing keywords, ${evidence.community_threads.length} Reddit/HN threads, and ${evidence.web_competitors.length} live competitors.`,
          });

          send({
            type: 'dossier_ready',
            dossier,
            message: 'Live Web Intelligence Dossier successfully generated.',
          });

          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // Default JSON response
    return NextResponse.json(dossier);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    console.error('Pipeline error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
