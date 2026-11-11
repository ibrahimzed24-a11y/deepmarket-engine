export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';
export type OpportunityTag = 'High' | 'Medium' | 'Low';
export type AutocompleteSource = 'google_suggest' | 'duckduckgo_autocomplete' | 'live_serp';
export type SearchIntent = 'Transactional' | 'Commercial' | 'Informational' | 'Navigational';

export interface ParsedEntities {
  industry: string;
  target_geos: string[];
  business_model: string;
  seed_intent: string;
  target_audience?: string;
  key_incumbents?: string[];
}

export interface SEOVerifiedSuggestion {
  query: string;
  source: AutocompleteSource;
  opportunity: OpportunityTag;
  search_intent: SearchIntent;
}

export interface SEOKeywordCluster {
  cluster: string;
  keywords: string[];
  search_intent: SearchIntent | string;
  opportunity: OpportunityTag;
  source_verified?: boolean;
  volume_proxy?: string;
  difficulty_score?: number | string;
  cpc_proxy?: string;
}

export interface SEOKeywordArtifact {
  seed_queries: string[];
  verified_suggestions: SEOVerifiedSuggestion[];
  long_tail_clusters?: SEOKeywordCluster[];
  content_gaps: string[];
  programmatic_angles: string[];
  search_intent_distribution: {
    informational: number;
    commercial: number;
    transactional: number;
    navigational: number;
  };
  seed_keywords?: string[];
}

export interface CompetitorEntity {
  name: string;
  domain?: string;
  ranking_url?: string;
  opportunity_tier: OpportunityTag;
  strengths: string[];
  weaknesses: string[];
  pricing_model?: string;
}

export interface PricingTeardownItem {
  segment: string;
  average_price_point?: string;
  pricing_structure?: string;
  margin_gap: string;
  notes?: string;
}

export interface CompetitorGapArtifact {
  competitors: CompetitorEntity[];
  ranking_domains: string[];
  critical_weaknesses: string[];
  unaddressed_customer_pain: string[];
  pricing_teardown?: PricingTeardownItem[];
  top_competitors?: Array<{
    name: string;
    market_share_tier: string;
    strengths: string[];
    weaknesses: string[];
    pricing_model: string;
  }>;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  tier_name?: string;
  price_point?: string;
  billing_cadence?: string;
  target_segment?: string;
}

export interface AcquisitionChannel {
  channel: string;
  rationale: string;
  tactical_play: string;
  opportunity?: OpportunityTag;
  cac_proxy?: string;
  expected_conversion?: string;
}

export interface UnitEconomics {
  ltv_proxy: string;
  cac_proxy: string;
  ltv_cac_ratio: string;
  payback_period_months: number | string;
  gross_margin: string;
}

export interface RoadmapMilestones {
  day_1_30: string[];
  day_31_60: string[];
  day_61_90: string[];
  day_30?: { focus: string; milestones: string[] };
  day_60?: { focus: string; milestones: string[] };
  day_90?: { focus: string; milestones: string[] };
}

export interface GTMStrategyArtifact {
  value_proposition: string;
  positioning_statement: string;
  pricing_recommendation: {
    model: string;
    suggested_tiers: PricingTier[];
  };
  acquisition_channels: AcquisitionChannel[];
  roadmap_30_60_90: RoadmapMilestones;
  pricing_strategy?: {
    model: string;
    tiers: PricingTier[];
    rationale?: string;
  };
  unit_economics?: UnitEconomics;
}

export interface GeoDemandArtifact {
  target_regions: string[];
  market_readiness: OpportunityTag | string;
  tam_sam_som_notes: string;
  regulatory_compliance: string[];
  regional_payment_rails: string[];
  localization_barriers: string[];
}

export interface ComprehensiveDossier {
  meta: {
    query: string;
    entities: ParsedEntities;
    timestamp: string;
    engine_version: string;
  };
  geo: GeoDemandArtifact;
  seo: SEOKeywordArtifact;
  competitors: CompetitorGapArtifact;
  gtm: GTMStrategyArtifact;
}

// Backward-compatible alias
export type ExecutiveDossier = ComprehensiveDossier;

export interface AgentProgress {
  status: AgentStatus;
  message?: string;
  timestamp?: number;
}

export interface AgentState {
  orchestrator: AgentProgress;
  geo: AgentProgress;
  seo: AgentProgress;
  competitor: AgentProgress;
  gtm: AgentProgress;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export type StreamEventType =
  | 'step'
  | 'agent_update'
  | 'dossier_ready'
  | 'error'
  | 'warning'
  | 'ping';

export interface StreamPayload {
  type: StreamEventType;
  step?: number;
  totalSteps?: number;
  agent?: keyof AgentState;
  status?: AgentStatus;
  message?: string;
  state?: AgentState;
  dossier?: ComprehensiveDossier;
  warning?: string;
  error?: string;
}
