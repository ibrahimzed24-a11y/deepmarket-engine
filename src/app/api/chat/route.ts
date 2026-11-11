import { NextRequest, NextResponse } from 'next/server';
import { WebIntelligenceEngine, LiveWebEvidenceBundle } from '@/lib/tools/web-intelligence';
import { BrandScraper, ScrapedBrandContext } from '@/lib/tools/brand-scraper';
import { findSkill, loadRawSkillMarkdown } from '@/lib/skills-registry';
import {
  ComprehensiveDossier,
  ParsedEntities,
  SEOKeywordArtifact,
  CompetitorGapArtifact,
  GTMStrategyArtifact,
  StreamPayload,
  MarketingSkillOutputs,
  BrandContextCard,
  PaidAdsCampaignBundle,
  ColdEmailSequenceBundle,
  SEOBlogBlueprint,
} from '@/lib/types';
import { callLLM, extractAndParseJSON } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';

function deriveZeroBiasEntities(
  prompt: string,
  evidence: LiveWebEvidenceBundle,
  scrapedBrand: ScrapedBrandContext | null,
  location?: string
): ParsedEntities {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  const detectedGeos: string[] = [];
  if (location && location.trim().toLowerCase() !== 'global') {
    detectedGeos.push(location.trim());
  }

  const geoKeywords = [
    'united states', 'usa', 'europe', 'germany', 'france', 'uk', 'united kingdom',
    'japan', 'india', 'canada', 'australia', 'brazil', 'mexico', 'egypt', 'uae',
    'dubai', 'saudi arabia', 'singapore', 'indonesia', 'bali', 'maldives', 'thailand', 'vietnam',
    'texas', 'california', 'new york', 'florida', 'ontario', 'toronto', 'brampton'
  ];

  for (const geo of geoKeywords) {
    if (new RegExp(`\\b${geo}\\b`, 'i').test(lower) && !detectedGeos.some((g) => g.toLowerCase() === geo)) {
      detectedGeos.push(geo.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }

  let businessModel = 'Online Software / Digital Solution';
  if (lower.includes('b2b') || lower.includes('saas') || scrapedBrand?.description.includes('SaaS')) {
    businessModel = 'B2B SaaS';
  } else if (lower.includes('affiliate') || lower.includes('commission')) {
    businessModel = 'High-Ticket Affiliate / Media Bridge';
  } else if (lower.includes('marketplace')) {
    businessModel = 'Two-Sided Marketplace';
  } else if (lower.includes('agency') || lower.includes('consulting') || lower.includes('service')) {
    businessModel = 'Managed Agency / Services';
  } else if (lower.includes('ecommerce') || lower.includes('d2c') || lower.includes('store') || lower.includes('supply')) {
    businessModel = 'Direct Supply / B2B Commerce';
  }

  const stopWords = new Set([
    'we', 'want', 'to', 'launch', 'an', 'a', 'the', 'in', 'and', 'for', 'of', 'on',
    'with', 'our', 'new', 'start', 'build', 'create', 'tool', 'app', 'system', 'business',
    'skill', 'campaign', 'strategy'
  ]);
  const words = cleanPrompt.split(/\s+/).filter((w) => !stopWords.has(w.toLowerCase()));
  const derivedIndustry = words.slice(0, 5).join(' ');

  return {
    industry: scrapedBrand?.title || derivedIndustry || cleanPrompt,
    target_geos: detectedGeos.length > 0 ? detectedGeos : ['Global / Open Web'],
    business_model: businessModel,
    seed_intent: cleanPrompt,
    target_audience: `${scrapedBrand?.domain || derivedIndustry || cleanPrompt} buyers and decision-makers`,
    key_incumbents: evidence.web_competitors.map((c) => c.domain),
  };
}

function buildSkillDeliverables(
  prompt: string,
  location: string,
  evidence: LiveWebEvidenceBundle,
  entities: ParsedEntities,
  scrapedBrand: ScrapedBrandContext | null,
  activeSkillId: string,
  llmAdditions?: Partial<MarketingSkillOutputs>
): MarketingSkillOutputs {
  const brandName = scrapedBrand?.title || entities.industry.split(' ')[0] || 'Market Leader';
  const topKeywords = evidence.keywords.slice(0, 8).map((k) => k.keyword);
  const primaryKw = topKeywords[0] || `${entities.industry} software`;
  const secondaryKws = topKeywords.slice(1, 5);

  // Verbatim quotes extracted directly from real Reddit/HN discussions
  const verbatimQuotes = evidence.community_threads.slice(0, 5).map((t) => {
    return t.snippet ? `"${t.snippet.slice(0, 150)}..." (via ${t.source} ${t.author_or_sub})` : `"${t.title}" (via ${t.source})`;
  });

  // Brand Context Card
  const brandContext: BrandContextCard = llmAdditions?.brand_context_card || {
    brand_name: scrapedBrand?.domain || brandName,
    source_url: scrapedBrand?.url,
    positioning_statement: scrapedBrand?.description
      ? `${scrapedBrand.description} Engineered specifically for ${entities.target_geos.join(', ')}.`
      : `The high-velocity ${entities.business_model} designed to solve critical operational friction in ${entities.target_geos.join(', ')}.`,
    target_icp: {
      titles: [
        'Founder / Managing Director',
        'Head of Growth / Marketing',
        'Operations Director / VP Procurement',
      ],
      company_profiles: [
        `Mid-market businesses in ${entities.target_geos.join(', ')} navigating legacy incumbent lock-in`,
        'High-growth operators demanding transparent pricing and same-day onboarding',
      ],
      core_triggers: [
        evidence.community_threads[0]?.title || `Inflexible pricing and poor localization from incumbents`,
        `Urgent requirement for rapid turnaround in ${entities.target_geos.join(', ')}`,
      ],
    },
    buyer_personas: [
      {
        role: 'The Operational Decision-Maker',
        primary_goal: `Eliminate manual friction and unlock transparent margins in ${entities.industry}`,
        dealbreaker_pain: evidence.community_threads[1]?.title || 'Hidden fees, long annual commitments, and opaque setup cycles',
      },
      {
        role: 'The Growth Lead / Commercial Director',
        primary_goal: `Rapidly scale organic reach and paid customer acquisition without bloated overhead`,
        dealbreaker_pain: 'Inability to measure direct ROI or integrate modern automated workflows',
      },
    ],
    verbatim_voc_language: verbatimQuotes.length > 0 ? verbatimQuotes : [
      `"Incumbent platforms take weeks to onboard and hide pricing behind sales reps."`,
      `"Looking for a reliable solution that just works out of the box."`,
    ],
    brand_voice_rules: [
      'Direct, authoritative, and vendor-neutral: never use fluffy marketing adjectives.',
      'Always lead with quantifiable metrics, transparent pricing, and specific regional relevance.',
      'Address customer objections directly with verifiable proof points.',
    ],
    key_proof_points: [
      scrapedBrand?.h1_headings?.[0] ? `Core proposition: ${scrapedBrand.h1_headings[0]}` : `Grounded in ${evidence.keywords.length} live verified search demand queries`,
      evidence.web_competitors[0]
        ? `Outperforms incumbent ${evidence.web_competitors[0].domain} on speed-to-value and onboarding transparency`
        : `Zero vendor lock-in with clear monthly or consumption pricing`,
    ],
  };

  // Paid Ads Campaigns Bundle
  const paidAds: PaidAdsCampaignBundle = llmAdditions?.paid_ads_campaigns || {
    target_industry: entities.industry,
    daily_budget_recommendation: '$75 - $150 / day across Google Search & Meta Advantage+',
    google_search_ad_groups: [
      {
        ad_group_name: `High-Intent Commercial — ${entities.industry}`,
        exact_match_keywords: topKeywords.slice(0, 3).map((k) => `[${k}]`),
        phrase_match_keywords: topKeywords.slice(0, 4).map((k) => `"${k}"`),
        negative_keywords: ['[free]', '[jobs]', '[salary]', '[internship]', '[reddit]', '[template free]'],
        rsa_headlines: [
          `#1 ${brandName} | Official Site`,
          `Fast Onboarding | Transparent Pricing`,
          `Compare Top ${entities.industry} Tools`,
          `Built For ${entities.target_geos[0] || 'Global'}`,
          `Start Today | No Annual Contract`,
        ],
        rsa_descriptions: [
          `Discover why operators choose ${brandName} over legacy providers. See transparent pricing and get started in under 5 minutes.`,
          `Tired of hidden fees and slow onboarding? Explore modern ${entities.industry} designed for real results. Book or start now.`,
        ],
      },
      {
        ad_group_name: `Competitor Alternatives & Switching`,
        exact_match_keywords: evidence.web_competitors.slice(0, 3).map((c) => `[${c.domain.replace(/\.[a-z]+$/, '')} alternatives]`),
        phrase_match_keywords: evidence.web_competitors.slice(0, 3).map((c) => `"${c.domain.replace(/\.[a-z]+$/, '')} pricing"`),
        negative_keywords: ['[login]', '[support]', '[customer service phone number]', '[careers]'],
        rsa_headlines: [
          `Switch From Incumbents | ${brandName}`,
          `Zero Migration Friction | 24/7 Setup`,
          `Half The Cost Of Legacy Tools`,
          `Modern Architecture For ${entities.target_geos[0] || 'Global'}`,
        ],
        rsa_descriptions: [
          `Switch to ${brandName} for immediate setup, localized support, and transparent self-serve pricing.`,
        ],
      },
    ],
    meta_advantage_angles: [
      {
        angle_name: 'The Pain Agitation & Legacy Trap',
        target_audience: `Founders, Ops Managers, and Growth Heads in ${entities.target_geos.join(', ')}`,
        primary_text: `Still paying six-figure retainers or locked into rigid contracts for ${entities.industry}? Modern teams are quietly switching to a faster, transparent model. No sales calls, no hidden fees.`,
        headline: `The Modern Alternative to Legacy ${entities.industry}`,
        cta: 'Learn More / See Pricing',
      },
      {
        angle_name: 'Speed & Time-to-Value Case Study',
        target_audience: `Lookalike 1% of high-intent visitors and industry decision-makers`,
        primary_text: `How fast can you deploy ${entities.industry} in ${entities.target_geos[0] || 'your market'}? While traditional vendors spend 4 weeks onboarding, our users go live on day 1.`,
        headline: `Go Live in Under 24 Hours`,
        cta: 'Get Started Free',
      },
    ],
    tiktok_hooks: [
      {
        hook_type: 'The Uncomfortable Truth / Industry Exposé',
        script_hook_3s: `"Here's the dirty secret about ${entities.industry} that incumbents don't want you to see..."`,
        visual_cue: 'Fast screen recording showing invoice price comparison or bloated contract.',
      },
      {
        hook_type: 'POV Workflow Teardown',
        script_hook_3s: `"POV: You replaced 3 legacy tools in ${entities.target_geos[0] || 'your business'} with one clean system."`,
        visual_cue: 'Over-the-shoulder typing, clean dashboard, instant checkmark.',
      },
    ],
  };

  // Cold Email Outreach Sequence
  const coldEmail: ColdEmailSequenceBundle = llmAdditions?.cold_email_sequence || {
    target_titles: [
      'Chief Executive Officer / Managing Director',
      'VP of Growth / Head of Marketing',
      'Director of Operations',
    ],
    trigger_signals: [
      evidence.community_threads[0]?.title || 'Recent company expansion or hiring in target region',
      'Frustration with legacy incumbent contract renewals or lack of local support',
    ],
    value_hook: `Cut operational overhead in ${entities.industry} by 40% with automated onboarding.`,
    sequence: [
      {
        step_number: 1,
        timing: 'Day 1 — The Hyper-Relevant Observation',
        subject_line: `Quick observation re: {{company}}'s ${entities.industry}`,
        body: `Hi {{first_name}},\n\nSaw that {{company}} is scaling operations across ${entities.target_geos[0] || 'the region'}.\n\nMost operators we speak with mention that legacy ${entities.industry} platforms create friction around ${evidence.community_threads[0]?.title || 'pricing transparency and slow turnaround'}.\n\nWe built ${brandName} specifically to eliminate this—letting teams go live on day 1 with zero lock-in.\n\nOpen to a 3-minute video breakdown of how this works for {{company}}?\n\nBest,\n[Your Name]`,
      },
      {
        step_number: 2,
        timing: 'Day 4 — Proof Point & Direct Comparison',
        subject_line: `{{first_name}}, benchmarking {{company}} vs ${evidence.web_competitors[0]?.domain || 'incumbents'}`,
        body: `Hi {{first_name}},\n\nFollowing up on my note earlier this week.\n\nWhen teams benchmark us against traditional providers, the two main advantages are:\n1. 5-minute automated onboarding vs 3-week manual implementations.\n2. Transparent pricing with no hidden seat fees.\n\nWould it make sense to share our 1-page comparison matrix?\n\nBest,\n[Your Name]`,
      },
      {
        step_number: 3,
        timing: 'Day 9 — Low-Friction Permission Close',
        subject_line: `Permission to close file for {{company}}?`,
        body: `Hi {{first_name}},\n\nAssuming this isn't a current priority for {{company}} right now—no problem at all.\n\nIf you ever need to re-evaluate ${entities.industry} or want to see our live benchmark, here's the link: [Your URL].\n\nThanks,\n[Your Name]`,
      },
    ],
    reply_playbook: [
      {
        objection: '"We already work with an incumbent provider."',
        counter_reply: `Totally understand! Many of our current clients also used ${evidence.web_competitors[0]?.domain || 'traditional vendors'}. We don't ask you to rip and replace—we simply run a side-by-side test on a secondary workflow so you can compare speed and margin.`,
      },
      {
        objection: '"Send me more info / not right now."',
        counter_reply: `Will do! Here is our 2-page teardown and pricing breakdown: [Link]. What's the best time next quarter to circle back?`,
      },
    ],
  };

  // SEO Blog Blueprint
  const seoBlog: SEOBlogBlueprint = llmAdditions?.seo_blog_blueprint || {
    article_title: `The Comprehensive 2026 Guide to ${entities.industry} in ${entities.target_geos[0] || 'Modern Markets'}: Strategies, Pricing & Teardown`,
    target_primary_keyword: primaryKw,
    secondary_keywords: secondaryKws.length > 0 ? secondaryKws : [
      `best ${entities.industry} platforms`,
      `${entities.industry} pricing comparison`,
      `how to choose ${entities.industry}`,
    ],
    meta_description: `Complete 2026 guide to ${primaryKw}. Discover pricing benchmarks, competitor comparisons, and step-by-step implementation playbooks.`,
    h2_h3_outline: [
      {
        heading: `1. The Shift in ${entities.industry}: Why Legacy Models Fail in 2026`,
        key_points: [
          `Market demand analysis grounded in live autocomplete signals`,
          `Key frustrations voiced in user communities: ${evidence.community_threads[0]?.title || 'contract lock-in'}`,
        ],
      },
      {
        heading: `2. Critical Evaluation Matrix: Features, Pricing & Vendor Comparison`,
        key_points: [
          `Side-by-side comparison of incumbent platforms (${evidence.web_competitors.map((c) => c.domain).slice(0, 3).join(', ')})`,
          `Pricing transparency benchmarks: self-serve vs enterprise RFP`,
        ],
      },
      {
        heading: `3. Step-by-Step Implementation Framework (30-60-90 Days)`,
        key_points: [
          `Day 1-30: Pilot validation and technical audit`,
          `Day 31-60: Full team rollout and automated telemetry`,
        ],
      },
      {
        heading: `4. Frequently Asked Questions (Structured for Google AI Overviews)`,
        key_points: [
          `What is the average cost of ${entities.industry}?`,
          `How does ${entities.target_geos[0] || 'local'} regulation impact rollout?`,
        ],
      },
    ],
    information_gain_callout: `Unlike generic summaries, this guide incorporates live verbatim quotes from active Reddit/HN practitioner discussions and verified search volume signals.`,
    ai_overview_citation_snippet: `${entities.industry} refers to specialized solutions designed to automate and optimize operational workflows. In 2026, leading organizations prioritize transparent pricing models, rapid self-serve integration, and native localization to replace high-friction legacy contracts.`,
  };

  return {
    active_skill_id: activeSkillId,
    brand_context_card: brandContext,
    paid_ads_campaigns: paidAds,
    cold_email_sequence: coldEmail,
    seo_blog_blueprint: seoBlog,
  };
}

function buildEvidenceGroundedDossier(
  prompt: string,
  location: string,
  evidence: LiveWebEvidenceBundle,
  entities: ParsedEntities,
  scrapedBrand: ScrapedBrandContext | null,
  activeSkillId: string,
  llmGtmArtifact?: GTMStrategyArtifact,
  llmSkillOutputs?: Partial<MarketingSkillOutputs>,
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

  const totalKeywords = evidence.keywords.length || 1;
  const searchIntentDistribution = {
    transactional: Math.round((intentCounts.transactional / totalKeywords) * 100) || 35,
    commercial: Math.round((intentCounts.commercial / totalKeywords) * 100) || 40,
    informational: Math.round((intentCounts.informational / totalKeywords) * 100) || 20,
    navigational: 5,
  };

  const contentGaps = evidence.community_threads.slice(0, 4).map((t) => {
    return `Unresolved user pain: "${t.title}" (${t.source} discussion in ${t.author_or_sub})`;
  });

  const programmaticAngles = evidence.keywords.slice(0, 6).map((k) => {
    const slug = k.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/solutions/${slug}`;
  });

  const seoArtifact: SEOKeywordArtifact = {
    seed_queries: [prompt, ...evidence.keywords.slice(0, 4).map((k) => k.keyword)],
    verified_suggestions: verifiedSuggestions,
    content_gaps: contentGaps.length > 0 ? contentGaps : [`Vendor-neutral comparison matrices for ${entities.industry}`],
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
        : [`Direct organic presence for "${c.source_query}"`],
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
        margin_gap: 'Transparent self-serve opportunity vs enterprise quotation gating',
        notes: `Extracted from live HTML on ${c.url}`,
      })),
  };

  // 3. Ground GTM in real signals
  const topThread = evidence.community_threads[0]?.title || 'market friction';
  const gtmArtifact: GTMStrategyArtifact = llmGtmArtifact || {
    value_proposition: scrapedBrand?.description || `High-velocity ${entities.business_model} designed to solve ${topThread} with immediate onboarding.`,
    positioning_statement: `For ${entities.target_audience} who struggle with legacy vendor inertia, our solution delivers immediate, transparent execution.`,
    pricing_recommendation: {
      model: 'Transparent Monthly / Consumption Tiering',
      suggested_tiers: [
        {
          name: 'Starter Pilot',
          price: '$99 - $299 / mo',
          features: [
            'Immediate self-serve activation',
            'Full access to core tool suite',
            'Community & standard email support',
          ],
        },
        {
          name: 'Professional Growth',
          price: '$499 - $990 / mo',
          features: [
            'Automated workflow pipelines',
            'Multi-seat collaboration',
            'Priority SLA & dedicated onboarding specialist',
          ],
        },
        {
          name: 'Enterprise Scale',
          price: 'Custom / Consumption',
          features: [
            'Custom regional payment settlement',
            'Dedicated account manager',
            'Custom compliance & audit trail guarantees',
          ],
        },
      ],
    },
    acquisition_channels: [
      {
        channel: 'Programmatic Search & AI Overviews',
        rationale: `Capitalize on ${evidence.keywords.length} live Google & Bing commercial search queries.`,
        tactical_play: `Publish authoritative comparison pages targeting "${evidence.keywords[0]?.keyword || entities.industry}".`,
      },
      {
        channel: 'Targeted Community Engagement',
        rationale: 'Active discussions identified across Reddit and HackerNews.',
        tactical_play: `Contribute high-value technical breakdowns and open resources directly addressing threads like "${topThread}".`,
      },
      {
        channel: 'Direct B2B Outreach',
        rationale: `Directly target decision-makers in ${entities.target_geos.join(' and ')}.`,
        tactical_play: 'Execute hyper-personalized cold outreach offering vendor comparison benchmarks.',
      },
    ],
    roadmap_30_60_90: {
      day_1_30: [
        `Deploy MVP landing page targeting primary keyword: "${evidence.keywords[0]?.keyword || entities.industry}".`,
        'Verify tracking, analytics, and self-serve onboarding telemetry.',
        `Initiate direct outreach to 50 target operators across ${entities.target_geos.join(', ')}.`,
      ],
      day_31_60: [
        `Roll out comparison battlecards vs top incumbents: ${evidence.web_competitors.map((c) => c.domain).slice(0, 3).join(', ')}.`,
        'Launch paid search ad groups on exact-match commercial queries.',
        'Collect first cohort case study metrics and customer testimonials.',
      ],
      day_61_90: [
        `Scale programmatic content footprint across all ${evidence.keywords.length} identified search clusters.`,
        'Establish automated referral loops and partner ecosystem integrations.',
        'Expand regional payment rails to maximize international conversion.',
      ],
    },
  };

  const skillOutputs = buildSkillDeliverables(
    prompt,
    location,
    evidence,
    entities,
    scrapedBrand,
    activeSkillId,
    llmSkillOutputs
  );

  return {
    meta: {
      query: prompt,
      entities,
      timestamp: new Date().toISOString(),
      engine_version: '4.0-HyperFX-Marketing-Skills',
    },
    live_evidence: evidence,
    llm_status: isConnectedLLM
      ? 'Connected & Synthesized'
      : 'Live Web Evidence Only (LLM Offline)',
    geo: {
      target_regions: entities.target_geos,
      market_readiness: 'High',
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
    active_skill: activeSkillId,
    skill_outputs: skillOutputs,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPrompt = body?.prompt || '';
    const userLocation = body?.location || 'Global';
    const requestedSkill = body?.skillId || body?.skill;
    const config = body?.config || {};
    const tavilyKey = config?.tavilyKey || process.env.TAVILY_API_KEY;
    const wantsStream =
      req.headers.get('accept')?.includes('text/event-stream') || body?.stream === true;

    if (!rawPrompt || typeof rawPrompt !== 'string' || !rawPrompt.trim()) {
      return NextResponse.json({ error: 'A research prompt is required.' }, { status: 400 });
    }

    let cleanPrompt = rawPrompt.trim();

    // Detect slash command in prompt e.g. /google-ads for Maldives eSIM
    let activeSkillId = requestedSkill || 'all-in-one';
    const slashMatch = cleanPrompt.match(/^\/([a-zA-Z0-9_-]+)(?:\s+(.*))?$/);
    if (slashMatch) {
      activeSkillId = slashMatch[1];
      cleanPrompt = (slashMatch[2] || '').trim() || cleanPrompt;
    }

    const skillMeta = findSkill(activeSkillId);
    activeSkillId = skillMeta.id;

    // Detect Brand URL/Domain in prompt and scrape live DOM if present
    const brandUrl = BrandScraper.extractUrlOrDomain(cleanPrompt);
    let scrapedBrand: ScrapedBrandContext | null = null;
    if (brandUrl) {
      scrapedBrand = await BrandScraper.scrapeBrand(brandUrl);
    }

    // 1. Harvest Real Multi-Source Web Intelligence (Concurrent 5-source pipeline)
    const harvestQuery = `${cleanPrompt} ${userLocation !== 'Global' ? userLocation : ''}`.trim();
    const evidence = await WebIntelligenceEngine.collectAll(harvestQuery, tavilyKey);
    const entities = deriveZeroBiasEntities(cleanPrompt, evidence, scrapedBrand, userLocation);

    // 2. Load official SKILL.md instructions from src/skills-library
    const skillMarkdown = loadRawSkillMarkdown(activeSkillId);

    // 3. Attempt LLM Synthesis with SKILL.md Playbook and Live Web Evidence Grounding
    let synthesizedGtm: GTMStrategyArtifact | undefined;
    let synthesizedSkillOutputs: Partial<MarketingSkillOutputs> | undefined;
    let isConnectedLLM = false;

    try {
      const systemPrompt = `You are an elite autonomous Marketing Director running the official playbook for "${skillMeta.name}" (${skillMeta.id}) from hyperfx-ai/marketing-skills.

OFFICIAL SKILL PLAYBOOK GUIDELINES:
${skillMarkdown ? skillMarkdown.slice(0, 3000) : 'Execute high-converting, tactical marketing deliverables.'}

LIVE WEB EVIDENCE COLLECTED:
- Scraped Brand URL Context: ${scrapedBrand ? `${scrapedBrand.domain} | Title: ${scrapedBrand.title} | Headings: ${scrapedBrand.h1_headings.join(', ')}` : 'None provided in prompt'}
- Scraped Google/Bing Autocomplete Keywords: ${evidence.keywords.map((k) => k.keyword).slice(0, 15).join(', ')}
- Live Reddit & HackerNews Community Discussions: ${evidence.community_threads.map((t) => t.title).slice(0, 6).join(' | ')}
- Live Competitors Inspected: ${evidence.web_competitors.map((c) => c.domain).slice(0, 5).join(', ')}

SYNTHESIZE THE COMPLETE MARKETING DELIVERABLE GROUNDED 100% IN THIS LIVE EVIDENCE.
Rules:
1. No placeholder strings. Be tactical, specific, and actionable.
2. Output STRICT JSON conforming to:
{
  "gtm": {
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
  },
  "brand_context_card": {
    "brand_name": "string",
    "positioning_statement": "string",
    "target_icp": {
      "titles": ["string"],
      "company_profiles": ["string"],
      "core_triggers": ["string"]
    },
    "buyer_personas": [{"role": "string", "primary_goal": "string", "dealbreaker_pain": "string"}],
    "verbatim_voc_language": ["string"],
    "brand_voice_rules": ["string"],
    "key_proof_points": ["string"]
  },
  "paid_ads_campaigns": {
    "target_industry": "string",
    "daily_budget_recommendation": "string",
    "google_search_ad_groups": [{
      "ad_group_name": "string",
      "exact_match_keywords": ["string"],
      "phrase_match_keywords": ["string"],
      "negative_keywords": ["string"],
      "rsa_headlines": ["string"],
      "rsa_descriptions": ["string"]
    }],
    "meta_advantage_angles": [{
      "angle_name": "string",
      "target_audience": "string",
      "primary_text": "string",
      "headline": "string",
      "cta": "string"
    }],
    "tiktok_hooks": [{
      "hook_type": "string",
      "script_hook_3s": "string",
      "visual_cue": "string"
    }]
  },
  "cold_email_sequence": {
    "target_titles": ["string"],
    "trigger_signals": ["string"],
    "value_hook": "string",
    "sequence": [{
      "step_number": 1,
      "timing": "string",
      "subject_line": "string",
      "body": "string"
    }],
    "reply_playbook": [{"objection": "string", "counter_reply": "string"}]
  },
  "seo_blog_blueprint": {
    "article_title": "string",
    "target_primary_keyword": "string",
    "secondary_keywords": ["string"],
    "meta_description": "string",
    "h2_h3_outline": [{"heading": "string", "key_points": ["string"]}],
    "information_gain_callout": "string",
    "ai_overview_citation_snippet": "string"
  }
}
Return only JSON.`;

      const rawLlmResponse = await callLLM({
        system: systemPrompt,
        prompt: `Objective: "${cleanPrompt}"\nTarget Geos: ${entities.target_geos.join(', ')}\nActive Skill: ${skillMeta.name} (${skillMeta.slash})`,
        temperature: 0.2,
        config,
        timeoutMs: 14000,
      });

      if (rawLlmResponse && rawLlmResponse.trim().length > 30) {
        interface RawLlmSynthesis {
          gtm?: GTMStrategyArtifact;
          brand_context_card?: BrandContextCard;
          paid_ads_campaigns?: PaidAdsCampaignBundle;
          cold_email_sequence?: ColdEmailSequenceBundle;
          seo_blog_blueprint?: SEOBlogBlueprint;
        }

        const parsed = extractAndParseJSON<RawLlmSynthesis>(rawLlmResponse);
        if (parsed.gtm) synthesizedGtm = parsed.gtm;
        synthesizedSkillOutputs = {
          active_skill_id: activeSkillId,
          brand_context_card: parsed.brand_context_card,
          paid_ads_campaigns: parsed.paid_ads_campaigns,
          cold_email_sequence: parsed.cold_email_sequence,
          seo_blog_blueprint: parsed.seo_blog_blueprint,
        };
        isConnectedLLM = true;
      }
    } catch {
      // Offline fallback: Use deterministic evidence-grounded template builder
      isConnectedLLM = false;
    }

    const dossier = buildEvidenceGroundedDossier(
      cleanPrompt,
      userLocation,
      evidence,
      entities,
      scrapedBrand,
      activeSkillId,
      synthesizedGtm,
      synthesizedSkillOutputs,
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
            message: `Executed "${skillMeta.name}". Discovered ${evidence.keywords.length} real Google/Bing keywords, ${evidence.community_threads.length} Reddit/HN threads, and ${evidence.web_competitors.length} live competitors.`,
          });

          send({
            type: 'dossier_ready',
            dossier,
            message: `Deliverables for ${skillMeta.name} successfully synthesized.`,
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
