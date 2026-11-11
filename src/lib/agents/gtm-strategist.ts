import {
  CompetitorGapArtifact,
  ExecutiveMetrics,
  ExtractedEntities,
  GeoDemandArtifact,
  GTMStrategyArtifact,
  LLMConfig,
  SEOKeywordArtifact,
} from '../types';
import { callOpenAICompatible, extractAndParseJSON } from '../llm-client';

export interface GTMStrategistResult {
  artifact: GTMStrategyArtifact;
  metrics: ExecutiveMetrics;
  isFallback: boolean;
  modelUsed: string;
}

function generateSynthesizedGTM(
  query: string,
  entities: ExtractedEntities,
  geoArtifact: GeoDemandArtifact,
  seoArtifact: SEOKeywordArtifact,
  compArtifact: CompetitorGapArtifact
): { artifact: GTMStrategyArtifact; metrics: ExecutiveMetrics } {
  const primaryGeo = entities.geographies[0] || 'Maldives';
  const secondaryGeo = entities.geographies[1] || 'Bali';

  const isTourism =
    query.toLowerCase().includes('resort') ||
    query.toLowerCase().includes('excursion') ||
    query.toLowerCase().includes('eco') ||
    query.toLowerCase().includes('bali') ||
    query.toLowerCase().includes('maldives');

  if (isTourism) {
    const artifact: GTMStrategyArtifact = {
      value_proposition:
        'The first unified digital concierge and excursion marketplace delivering direct-to-boat real-time booking, transparent local pricing, and certified eco-ratings across island destinations.',
      positioning_statement:
        'For eco-conscious travelers and independent boutique guesthouses in ' +
        primaryGeo +
        ' & ' +
        secondaryGeo +
        ' who are tired of 300% resort markups and unreliable WhatsApp booking desks, our platform offers an instant, transparent, guaranteed digital booking desk with zero middleman price gouging.',
      pricing_strategy: {
        model: 'Dynamic Commission & Tiered Merchant SaaS',
        tiers: [
          {
            tier_name: 'Guest Direct (Traveler Free)',
            price_point: '$0 / Booking + 3% payment processing',
            billing_cadence: 'Per transaction',
            target_segment: 'Independent eco-travelers, digital nomads, couples',
            features: [
              'Instant confirmation & live boat GPS tracking',
              'Free cancellation up to 24h prior or adverse weather',
              'Verified carbon-offset badge on all marine excursions',
              'Multi-currency payment via Apple Pay / Credit Card / QRIS',
            ],
          },
          {
            tier_name: 'Guesthouse & Boutique Partner Desk',
            price_point: '12% take-rate (vs. 25% Viator / 300% Resort Desks)',
            billing_cadence: 'Net-weekly payout',
            target_segment: 'Local island boutique hotels and eco-lodges',
            features: [
              'Custom tablet front-desk booking portal',
              'White-label QR code in all guest rooms with 5% affiliate kickback',
              'Automated tourist ministry green-tax reporting & guest manifests',
              'Dedicated 24/7 WhatsApp emergency dispatch line',
            ],
          },
          {
            tier_name: 'Fleet & Dive Center Operator Pro',
            price_point: '$79 / month + 8% volume commission',
            billing_cadence: 'Monthly subscription',
            target_segment: 'Licensed speedboat operators, PADI dive centers, sea-safari crews',
            features: [
              'Real-time passenger manifest & capacity pooling',
              'Automated weather alert & reschedule rebooking engine',
              'Direct payout in local currency (BML / Indonesian Rupiah)',
              'Marine insurance policy verification module',
            ],
          },
        ],
        rationale:
          'Undercutting global OTAs (25% commission) while providing local operators with weekly cash settlements generates overwhelming grassroots supply capture.',
      },
      acquisition_channels: [
        {
          channel: 'Programmatic SEO & Excursion Landing Pages',
          cac_proxy: '$14.20 per converted booking',
          expected_conversion: '3.8% organic conversion rate',
          tactical_play:
            'Deploy 400+ programmatic atoll, dive-site, and transfer route pages targeting uncompetitive long-tail keywords (e.g., /transfers/male-to-thoddoo-ferry-schedule).',
        },
        {
          channel: 'In-Room QR Concierge Placements at Island Guesthouses',
          cac_proxy: '$4.50 (affiliate revenue share model)',
          expected_conversion: '18.5% guest scan-to-booking rate',
          tactical_play:
            'Equip 60 local island guesthouses with bamboo-engraved smart NFC/QR bedside coasters offering guests $10 off their first excursion.',
        },
        {
          channel: 'Targeted Instagram & TikTok UGC Creator Retargeting',
          cac_proxy: '$28.00 per booking (AOV: $210)',
          expected_conversion: '2.4% direct ROAS > 4.2x',
          tactical_play:
            'Micro-influencer barter deals supplying free manta safari footage in exchange for trackable creator booking promo codes.',
        },
      ],
      unit_economics: {
        ltv_proxy: '$345.00 (avg 2.4 excursion bookings per island stay)',
        cac_proxy: '$18.50 blended across SEO, QR, and Paid Social',
        ltv_cac_ratio: '18.6x (exceptional organic referral flywheel)',
        payback_period_months: 0.8,
        gross_margin: '82.4% on platform net revenues',
      },
      roadmap_30_60_90: {
        day_30: {
          focus: 'Supply-Side Onboarding & Island Beachhead Contracting',
          milestones: [
            'Sign exclusive digital distribution agreements with 25 premier boat captains and PADI dive operators in ' +
              primaryGeo +
              '.',
            'Deploy localized payment gateways supporting both international cards and regional rails (QRIS / BML).',
            'Launch high-speed progressive web app (PWA) with offline ticket caching for poor marine connectivity zones.',
            'Seed initial 50 programmatic SEO transfer guides to begin indexing on Google.',
          ],
        },
        day_60: {
          focus: 'Guesthouse Affiliate Rollout & Viral UGC Flywheel',
          milestones: [
            'Install physical NFC/QR bedside booking displays across 500 boutique guest rooms.',
            'Activate automated WhatsApp guest concierge chatbot for instant transfer scheduling and weather advisories.',
            'Initiate micro-influencer content campaign focused on ethical manta ray snorkeling and coral restoration.',
            'Achieve 1,000 monthly completed paid bookings with >94% positive review score.',
          ],
        },
        day_90: {
          focus: 'Multi-Island Expansion & Yield Optimization Engine',
          milestones: [
            'Expand active operations into secondary archipelago hubs (' + secondaryGeo + ' outer islands).',
            'Roll out dynamic seat pooling algorithm to monetize empty return speedboat legs at 40% discount.',
            'Integrate automated B2B travel agency API for boutique European tour operators to book direct inventory.',
            'Reach $120,000 monthly GMV and initiate Series Seed institutional investor roadshow.',
          ],
        },
      },
    };

    const metrics: ExecutiveMetrics = {
      market_opportunity_index: 91,
      competition_density: 'Medium',
      cac_proxy_overall: '$18.50 Blended',
      time_to_first_revenue: '30 Days',
      summary:
        'Outstanding high-margin market opportunity. Incumbents are paralyzed by legacy high commissions (25%+) and captive resort monopolies, creating massive consumer and operator demand for a transparent digital booking desk.',
    };

    return { artifact, metrics };
  }

  // Generic B2B / SaaS fallback
  const artifact: GTMStrategyArtifact = {
    value_proposition:
      'High-velocity enterprise platform enabling automated multi-region operations, localized payment reconciliation, and real-time partner collaboration.',
    positioning_statement:
      'The modern operating system for ' +
      entities.industry +
      ', replacing fragmented manual spreadsheets with guaranteed workflow automation.',
    pricing_strategy: {
      model: 'Tiered Subscription + Usage',
      tiers: [
        {
          tier_name: 'Starter Pilot',
          price_point: '$199 / month',
          billing_cadence: 'Annual upfront',
          target_segment: 'Emerging regional operators',
          features: ['Core workflow automation', 'Standard API access', 'Community support'],
        },
        {
          tier_name: 'Scale & Growth',
          price_point: '$699 / month',
          billing_cadence: 'Annual upfront',
          target_segment: 'Mid-market multi-region enterprises',
          features: ['Multi-currency settlement', 'Automated reconciliation', 'Priority 24/7 SLA'],
        },
      ],
      rationale: 'Frictionless self-serve onboarding with rapid enterprise expansion path.',
    },
    acquisition_channels: [
      {
        channel: 'Account-Based Outbound & Trade Associations',
        cac_proxy: '$480 per qualified deal',
        expected_conversion: '12% discovery-to-close',
        tactical_play: 'Direct executive targeting via personalized ROI teardowns.',
      },
    ],
    unit_economics: {
      ltv_proxy: '$8,400 per year',
      cac_proxy: '$520 blended',
      ltv_cac_ratio: '16.1x',
      payback_period_months: 1.8,
      gross_margin: '88.0%',
    },
    roadmap_30_60_90: {
      day_30: {
        focus: 'Design Partner Pilots & Platform Hardening',
        milestones: ['Close 5 initial lighthouse customers', 'Complete security audit & API specs'],
      },
      day_60: {
        focus: 'Self-Serve Conversion & Regional Localization',
        milestones: ['Launch automated onboarding flow', 'Integrate regional payment rails'],
      },
      day_90: {
        focus: 'Scaling GTM Velocity & Expansion Tiers',
        milestones: ['Achieve $25k MRR', 'Hire dedicated customer success lead'],
      },
    },
  };

  const metrics: ExecutiveMetrics = {
    market_opportunity_index: 84,
    competition_density: 'Medium',
    cac_proxy_overall: '$520 Blended',
    time_to_first_revenue: '45 Days',
    summary:
      'Strong B2B expansion vector with high willingness to pay once operational efficiency is demonstrated in pilot cohorts.',
  };

  return { artifact, metrics };
}

export async function runGTMStrategistAgent(
  query: string,
  entities: ExtractedEntities,
  geoArtifact: GeoDemandArtifact,
  seoArtifact: SEOKeywordArtifact,
  compArtifact: CompetitorGapArtifact,
  configOverrides?: Partial<LLMConfig>
): Promise<GTMStrategistResult> {
  const systemPrompt = `You are the Lead GTM Strategist for DeepMarket Engine.
Synthesize the insights from Geo & Demand, SEO Arbitrage, and Competitor Gaps into an actionable Go-To-Market blueprint, unit economics, pricing strategy, and 30-60-90 day milestone roadmap.

Output strict JSON matching this schema:
{
  "artifact": {
    "value_proposition": "Core value proposition",
    "positioning_statement": "For [target] who [pain], our [product] is [category] that [benefit] unlike [competitors] because [moat].",
    "pricing_strategy": {
      "model": "Pricing model overview",
      "tiers": [
        {
          "tier_name": "Tier 1",
          "price_point": "$XX / unit",
          "billing_cadence": "Cadence",
          "target_segment": "Segment",
          "features": ["Feature 1", "Feature 2"]
        }
      ],
      "rationale": "Strategic justification"
    },
    "acquisition_channels": [
      {
        "channel": "Channel name",
        "cac_proxy": "$XX",
        "expected_conversion": "X.X%",
        "tactical_play": "Tactical execution detail"
      }
    ],
    "unit_economics": {
      "ltv_proxy": "$XXX",
      "cac_proxy": "$XX",
      "ltv_cac_ratio": "XX.Xx",
      "payback_period_months": 1.2,
      "gross_margin": "XX.X%"
    },
    "roadmap_30_60_90": {
      "day_30": { "focus": "Month 1 Focus", "milestones": ["Milestone 1", "Milestone 2"] },
      "day_60": { "focus": "Month 2 Focus", "milestones": ["Milestone 1", "Milestone 2"] },
      "day_90": { "focus": "Month 3 Focus", "milestones": ["Milestone 1", "Milestone 2"] }
    }
  },
  "metrics": {
    "market_opportunity_index": 88,
    "competition_density": "Low | Medium | High | Congested",
    "cac_proxy_overall": "$XX Blended",
    "time_to_first_revenue": "XX Days",
    "summary": "Executive summary paragraph"
  }
}
Return only JSON.`;

  const userContent = `Industry: ${entities.industry}
Geographies: ${entities.geographies.join(', ')}
Business Model: ${entities.business_model}
Objective: "${query}"
TAM/SAM/SOM: TAM ${geoArtifact.tam_sam_som.tam}, SAM ${geoArtifact.tam_sam_som.sam}, SOM ${geoArtifact.tam_sam_som.som}
Top Competitors: ${compArtifact.top_competitors.map((c) => c.name).join(', ')}
Key SEO Seed: ${seoArtifact.seed_keywords.slice(0, 3).join(', ')}`;

  const result = await callOpenAICompatible(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    configOverrides,
    22000
  );

  if (!result.isFallback && result.content) {
    try {
      const parsed = extractAndParseJSON<{
        artifact: GTMStrategyArtifact;
        metrics: ExecutiveMetrics;
      }>(result.content);
      if (parsed.artifact?.value_proposition && parsed.metrics?.market_opportunity_index) {
        return {
          artifact: parsed.artifact,
          metrics: parsed.metrics,
          isFallback: false,
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      // fallback
    }
  }

  const synthesized = generateSynthesizedGTM(
    query,
    entities,
    geoArtifact,
    seoArtifact,
    compArtifact
  );

  return {
    artifact: synthesized.artifact,
    metrics: synthesized.metrics,
    isFallback: true,
    modelUsed: result.modelUsed || 'GTM Strategy Engine',
  };
}
