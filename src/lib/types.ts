import { LiveWebEvidenceBundle, RealCommunityThread, RealKeywordSignal, RealWebCompetitor } from './tools/web-intelligence';

export type { LiveWebEvidenceBundle, RealCommunityThread, RealKeywordSignal, RealWebCompetitor };

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';
export type OpportunityTag = 'High' | 'Medium' | 'Low';
export type AutocompleteSource = 'Google Autocomplete' | 'Bing Autosuggest' | 'google_suggest' | 'duckduckgo_autocomplete' | 'live_serp';
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
  modifier?: string;
}

export interface SEOKeywordCluster {
  cluster: string;
  keywords: string[];
  search_intent: SearchIntent | string;
  opportunity: OpportunityTag;
  source_verified?: boolean;
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
}

export interface CompetitorEntity {
  name: string;
  domain?: string;
  ranking_url?: string;
  opportunity_tier: OpportunityTag;
  strengths: string[];
  weaknesses: string[];
  pricing_model?: string;
  h1_headings?: string[];
  pricing_signals?: string[];
}

export interface PricingTeardownItem {
  segment: string;
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
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface AcquisitionChannel {
  channel: string;
  rationale: string;
  tactical_play: string;
  opportunity?: OpportunityTag;
}

export interface RoadmapMilestones {
  day_1_30: string[];
  day_31_60: string[];
  day_61_90: string[];
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
  live_evidence: LiveWebEvidenceBundle;
  llm_status: 'Connected & Synthesized' | 'Live Web Evidence Only (LLM Offline)';
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
  tavilyKey?: string;
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
