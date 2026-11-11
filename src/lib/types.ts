export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface GeoDemandArtifact {
  tam_sam_som: {
    tam: string;
    sam: string;
    som: string;
    growth_rate_cagr?: string;
    rationale?: string;
  };
  consumer_behavior: string[];
  regulatory_flags: string[];
  regional_barriers: string[];
  localized_channels: string[];
}

export interface SEOKeywordCluster {
  cluster: string;
  keywords: string[];
  search_intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational' | string;
  volume_proxy: string;
  difficulty_score: number | string;
  cpc_proxy?: string;
}

export interface SEOKeywordArtifact {
  seed_keywords: string[];
  long_tail_clusters: SEOKeywordCluster[];
  search_intent_distribution: {
    informational: number;
    commercial: number;
    transactional: number;
    navigational: number;
  };
  content_gaps: string[];
  programmatic_angles: string[];
}

export interface CompetitorProfile {
  name: string;
  market_share_tier: string;
  strengths: string[];
  weaknesses: string[];
  pricing_model: string;
}

export interface PricingTeardownItem {
  segment: string;
  average_price_point: string;
  margin_gap: string;
  notes?: string;
}

export interface CompetitorGapArtifact {
  top_competitors: CompetitorProfile[];
  pricing_teardown: PricingTeardownItem[];
  critical_weaknesses: string[];
  unaddressed_customer_pain: string[];
}

export interface PricingTier {
  tier_name: string;
  price_point: string;
  billing_cadence: string;
  target_segment: string;
  features: string[];
}

export interface AcquisitionChannel {
  channel: string;
  cac_proxy: string;
  expected_conversion: string;
  tactical_play: string;
}

export interface UnitEconomics {
  ltv_proxy: string;
  cac_proxy: string;
  ltv_cac_ratio: string;
  payback_period_months: number | string;
  gross_margin: string;
}

export interface RoadmapMilestones {
  day_30: { focus: string; milestones: string[] };
  day_60: { focus: string; milestones: string[] };
  day_90: { focus: string; milestones: string[] };
}

export interface GTMStrategyArtifact {
  value_proposition: string;
  positioning_statement?: string;
  pricing_strategy: {
    model: string;
    tiers: PricingTier[];
    rationale: string;
  };
  acquisition_channels: AcquisitionChannel[];
  unit_economics: UnitEconomics;
  roadmap_30_60_90: RoadmapMilestones;
}

export interface ExtractedEntities {
  industry: string;
  geographies: string[];
  business_model: string;
  key_incumbents: string[];
}

export interface ExecutiveMetrics {
  market_opportunity_index: number; // 0-100
  competition_density: 'Low' | 'Medium' | 'High' | 'Congested';
  cac_proxy_overall: string;
  time_to_first_revenue: string;
  summary: string;
}

export interface ExecutiveDossier {
  id: string;
  query: string;
  timestamp: string;
  entities: ExtractedEntities;
  executive_metrics: ExecutiveMetrics;
  geo_demand: GeoDemandArtifact;
  seo_keywords: SEOKeywordArtifact;
  competitor_gaps: CompetitorGapArtifact;
  gtm_strategy: GTMStrategyArtifact;
  generation_mode?: 'live-llm' | 'synthesized-simulation';
  llm_model?: string;
}

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
  dossier?: ExecutiveDossier;
  warning?: string;
  error?: string;
}
