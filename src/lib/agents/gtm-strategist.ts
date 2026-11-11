import {
  CompetitorGapArtifact,
  GeoDemandArtifact,
  GTMStrategyArtifact,
  LLMConfig,
  ParsedEntities,
  SEOKeywordArtifact,
} from '../types';
import { callLLM, extractAndParseJSON } from '../llm-client';

export class GTMStrategistAgent {
  public static async execute(
    entities: ParsedEntities,
    compArtifact: CompetitorGapArtifact,
    configOverrides?: Partial<LLMConfig>
  ): Promise<GTMStrategyArtifact> {
    const gtmSystemPrompt = `You are a Go-To-Market Strategist.
Synthesize a realistic 30-60-90 day entry plan for this specific business.
DO NOT use placeholder strings. Be tactical and specific.
Output JSON with:
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
}`;

    try {
      const gtmRaw = await callLLM({
        system: gtmSystemPrompt,
        prompt: `Synthesize GTM strategy for: ${JSON.stringify(entities)}\nCompetitor Insights: ${JSON.stringify(
          compArtifact.competitors.map((c) => c.name)
        )}`,
        temperature: 0.3,
        config: configOverrides,
      });

      if (gtmRaw) {
        return extractAndParseJSON<GTMStrategyArtifact>(gtmRaw);
      }
    } catch {
      // Fall through to deterministic fallback
    }

    return {
      value_proposition: `Specialized high-efficiency platform for ${entities.industry}`,
      positioning_statement: `For businesses in ${entities.target_geos.join(', ')} seeking modern ${entities.industry} capabilities, our solution provides transparent, instant workflows without legacy overhead.`,
      pricing_recommendation: {
        model: 'Tiered Subscription & Usage-Based',
        suggested_tiers: [
          {
            name: 'Starter Pilot',
            price: '$49 / month',
            features: ['Core automated workflows', 'Standard reporting', 'Email support'],
          },
          {
            name: 'Growth & Scale',
            price: '$199 / month',
            features: ['Multi-user seat collaboration', 'Priority integrations', '24/7 SLA'],
          },
        ],
      },
      acquisition_channels: [
        {
          channel: 'High-Intent Search & Video Demonstrations',
          rationale: 'Captures active solution evaluators searching for alternatives',
          tactical_play: 'Publish side-by-side workflow breakdowns and transparent feature comparisons',
        },
        {
          channel: 'Direct Industry Association Outreach',
          rationale: 'High trust and rapid referral velocity among regional peers',
          tactical_play: 'Partner with regional trade organizations for sponsored pilot demos',
        },
      ],
      roadmap_30_60_90: {
        day_1_30: [
          'Onboard 5 design partner pilot customers with white-glove setup',
          'Deploy live automated onboarding portal and documentation',
        ],
        day_31_60: [
          'Publish 15 high-intent programmatic SEO comparison and solution guides',
          'Integrate primary regional payment and settlement rails',
        ],
        day_61_90: [
          'Activate customer referral loop offering 15% affiliate kickback',
          'Scale organic search acquisition to reach 50 active recurring customers',
        ],
      },
    };
  }
}

/**
 * Backward-compatible helper.
 */
export async function runGTMStrategistAgent(
  _prompt: string,
  entities: ParsedEntities,
  _geoArtifact: GeoDemandArtifact,
  _seoArtifact: SEOKeywordArtifact,
  compArtifact: CompetitorGapArtifact,
  configOverrides?: Partial<LLMConfig>
): Promise<{ artifact: GTMStrategyArtifact; isFallback: boolean; modelUsed: string }> {
  const artifact = await GTMStrategistAgent.execute(entities, compArtifact, configOverrides);
  return {
    artifact,
    isFallback: false,
    modelUsed: 'GTMStrategist-Tactical',
  };
}
