import { CompetitorGapArtifact, ExtractedEntities, LLMConfig } from '../types';
import { callOpenAICompatible, extractAndParseJSON } from '../llm-client';

export interface CompetitorGapResult {
  artifact: CompetitorGapArtifact;
  isFallback: boolean;
  modelUsed: string;
}

function generateSynthesizedCompetitorGaps(query: string, entities: ExtractedEntities): CompetitorGapArtifact {
  const isTourism =
    query.toLowerCase().includes('resort') ||
    query.toLowerCase().includes('excursion') ||
    query.toLowerCase().includes('tour') ||
    query.toLowerCase().includes('travel') ||
    query.toLowerCase().includes('maldives') ||
    query.toLowerCase().includes('bali');

  if (isTourism) {
    return {
      top_competitors: [
        {
          name: 'Viator & GetYourGuide (Global Aggregators)',
          market_share_tier: 'Global Tier 1 (45% Online Market Share)',
          strengths: [
            'Dominant search engine authority and massive marketing budgets.',
            'Global consumer brand trust and multi-currency localized checkout.',
          ],
          weaknesses: [
            'Extremely steep merchant take-rates (22% to 30% commission squeezed from local operators).',
            'Zero direct communication between guest and local boat captain prior to departure.',
            'No real-time dynamic weather or sea condition rescheduling automated workflows.',
          ],
          pricing_model: '20-30% supplier take-rate tacked onto marked-up retail pricing.',
        },
        {
          name: 'Captive Resort Desk Concierges',
          market_share_tier: 'On-Island Monopolistic (35% Captured Spend)',
          strengths: [
            'Frictionless room-charge billing at check-out.',
            'Physical face-to-face lobby presence.',
          ],
          weaknesses: [
            'Excessive 300% - 500% price gouging on routine excursions (e.g., $180 for a $35 local boat trip).',
            'Inflexible rigid departure schedules with high minimum passenger quotas.',
            'Complete exclusion of independent guesthouses and boutique eco-stays.',
          ],
          pricing_model: 'Hyper-inflated luxury tier pricing with 70%+ gross margin.',
        },
        {
          name: 'Informal Local WhatsApp & Street Desks',
          market_share_tier: 'Fragmented Grassroots (20% Regional Cash Flow)',
          strengths: [
            'Ultra-low cash pricing and authentic local guide knowledge.',
            'High flexibility and spontaneous negotiation.',
          ],
          weaknesses: [
            'No digital payments, zero passenger insurance validation, and erratic cancellation safety.',
            'Unprofessional communications leading to missed transfers and stranded guests.',
            'No unified digital inventory or calendar sync.',
          ],
          pricing_model: 'Direct cash / local bank transfer with unstandardized quotes.',
        },
      ],
      pricing_teardown: [
        {
          segment: 'Full-Day Atoll Manta & Whale Shark Safari',
          average_price_point: '$220 - $350 / passenger (Resort Desk) vs $65 - $90 (Direct Local)',
          margin_gap: '240% gross markup capture opportunity via digital transparency',
          notes: 'Direct supplier contracting enables healthy 18% take-rate while pricing at $110 (50% under resort desks).',
        },
        {
          segment: 'Inter-Island Fast Speedboat Transfer',
          average_price_point: '$45 - $80 scheduled vs $450 - $900 private charter',
          margin_gap: '35% margin on aggregated dynamic seat pooling algorithm',
          notes: 'Unoccupied empty-leg return charters represent 42% lost operator revenue ripe for algorithmic yield management.',
        },
        {
          segment: 'Eco-Certified Diving Packages (5 Dives)',
          average_price_point: '$480 - $650 per guest',
          margin_gap: '25% margin gap between resort-managed dive centers vs PADI local boutiques',
          notes: 'Bundling equipment rental and marine park conservation passes creates sticky high-AOV cart checkouts.',
        },
      ],
      critical_weaknesses: [
        'Opaque transfer pricing: Travelers are frequently surprised by exorbitant hidden speed launch fees exceeding their hotel room rate.',
        'Total lack of unified real-time multi-island booking: Booking an eco-stay across 2 islands requires juggling 5 separate email/WhatsApp threads.',
        'Absence of verifiable sustainability credentials: Greenwashing is rampant; travelers lack verified carbon-neutral and reef-safe operational audits.',
      ],
      unaddressed_customer_pain: [
        'Guests stranded at international airport terminals due to miscoordinated domestic seaplane/speedboat timings.',
        'Suppliers forced to wait 30-45 days for payouts from global OTA giants, creating liquidity crises for small boat operators.',
        'Inability for eco-conscious travelers to directly tip or support indigenous conservation initiatives.',
      ],
    };
  }

  // Generic B2B / SaaS fallback
  return {
    top_competitors: [
      {
        name: 'Legacy Enterprise Monoliths',
        market_share_tier: 'Legacy Incumbent (50%+ Historical)',
        strengths: ['Established Fortune 500 vendor relationships', 'Broad feature suite'],
        weaknesses: [
          'Year-long implementation cycles and archaic UI/UX.',
          'Six-figure licensing fees inaccessible to fast-growing mid-market players.',
        ],
        pricing_model: 'Annual contracts with heavy upfront professional services fees ($50k+).',
      },
      {
        name: 'Unorganized Manual Workflows (Spreadsheets + Email)',
        market_share_tier: 'Status Quo Inertia (35% Market Default)',
        strengths: ['Zero software acquisition cost', 'Familiar to legacy staff'],
        weaknesses: [
          'Severe human error rate (estimated 4.8% invoice leakage).',
          'Zero real-time data visibility across supply partners.',
        ],
        pricing_model: 'Hidden operational cost in headcounts and reconciliation overhead.',
      },
    ],
    pricing_teardown: [
      {
        segment: 'Mid-Market SaaS Subscription',
        average_price_point: '$499 - $1,499 / month',
        margin_gap: '65% margin on self-serve product-led growth model',
        notes: 'Disrupting traditional 6-figure enterprise contracts with a modern consumption-based tier.',
      },
    ],
    critical_weaknesses: [
      'Lack of native multi-currency local settlement rails in emerging markets.',
      'Complex legacy APIs requiring expensive system integrators.',
    ],
    unaddressed_customer_pain: [
      'Operational delays caused by cross-border settlement friction.',
      'No unified single-pane-of-glass dashboard for multi-region operations.',
    ],
  };
}

export async function runCompetitorGapsAgent(
  query: string,
  entities: ExtractedEntities,
  configOverrides?: Partial<LLMConfig>
): Promise<CompetitorGapResult> {
  const systemPrompt = `You are the Lead Competitor & Gap Hunter for DeepMarket Engine.
Reverse-engineer incumbent competitors, dissect pricing mechanics, isolate customer pain points, and uncover exploitable moats.

Output strict JSON matching this schema:
{
  "top_competitors": [
    {
      "name": "Competitor Name",
      "market_share_tier": "Dominant | Challenger | Fragmented",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "pricing_model": "Pricing architecture breakdown"
    }
  ],
  "pricing_teardown": [
    {
      "segment": "Service or Product Tier",
      "average_price_point": "$XX - $YY details",
      "margin_gap": "X% margin arbitrage opportunity",
      "notes": "Exploitation tactical note"
    }
  ],
  "critical_weaknesses": ["Weakness 1", "Weakness 2"],
  "unaddressed_customer_pain": ["Pain 1", "Pain 2"]
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
      const parsed = extractAndParseJSON<CompetitorGapArtifact>(result.content);
      if (Array.isArray(parsed.top_competitors) && Array.isArray(parsed.pricing_teardown)) {
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
    artifact: generateSynthesizedCompetitorGaps(query, entities),
    isFallback: true,
    modelUsed: result.modelUsed || 'Competitor Gap Engine',
  };
}
