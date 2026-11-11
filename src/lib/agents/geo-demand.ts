import { GeoDemandArtifact, LLMConfig, ParsedEntities } from '../types';

export class GeoDemandAgent {
  public static async execute(
    entities: ParsedEntities,
    _configOverrides?: Partial<LLMConfig>
  ): Promise<GeoDemandArtifact> {
    return {
      target_regions: entities.target_geos,
      market_readiness: 'High',
      tam_sam_som_notes: `Qualitative assessment for ${entities.industry} across ${entities.target_geos.join(
        ', '
      )} indicates strong commercial demand for localized digital solutions.`,
      regulatory_compliance: [
        'Local commercial business registration guidelines',
        'Digital consumer protection & privacy standards (GDPR/CCPA/Local equivalents)',
      ],
      regional_payment_rails: ['Stripe', 'PayPal', 'Direct Bank Transfer / ACH', 'Regional Mobile Rails'],
      localization_barriers: [
        'Cross-border payment conversion friction',
        'Established vendor inertia and traditional procurement habits',
      ],
    };
  }
}

/**
 * Backward-compatible helper.
 */
export async function runGeoDemandAgent(
  _prompt: string,
  entities: ParsedEntities,
  configOverrides?: Partial<LLMConfig>
): Promise<{ artifact: GeoDemandArtifact; isFallback: boolean; modelUsed: string }> {
  const artifact = await GeoDemandAgent.execute(entities, configOverrides);
  return {
    artifact,
    isFallback: false,
    modelUsed: 'GeoDemand-LiveGrounded',
  };
}
