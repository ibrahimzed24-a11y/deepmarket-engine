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

export interface BrandContextCard {
  brand_name: string;
  source_url?: string;
  positioning_statement: string;
  target_icp: {
    titles: string[];
    company_profiles: string[];
    core_triggers: string[];
  };
  buyer_personas: Array<{
    role: string;
    primary_goal: string;
    dealbreaker_pain: string;
  }>;
  verbatim_voc_language: string[];
  brand_voice_rules: string[];
  key_proof_points: string[];
}

export interface GoogleAdGroup {
  ad_group_name: string;
  exact_match_keywords: string[];
  phrase_match_keywords: string[];
  negative_keywords: string[];
  rsa_headlines: string[];
  rsa_descriptions: string[];
}

export interface MetaAdAngle {
  angle_name: string;
  target_audience: string;
  primary_text: string;
  headline: string;
  cta: string;
}

export interface TikTokHook {
  hook_type: string;
  script_hook_3s: string;
  visual_cue: string;
}

export interface PaidAdsCampaignBundle {
  target_industry: string;
  daily_budget_recommendation: string;
  google_search_ad_groups: GoogleAdGroup[];
  meta_advantage_angles: MetaAdAngle[];
  tiktok_hooks: TikTokHook[];
}

export interface ColdEmailStep {
  step_number: number;
  timing: string;
  subject_line: string;
  body: string;
}

export interface ColdEmailSequenceBundle {
  target_titles: string[];
  trigger_signals: string[];
  value_hook: string;
  sequence: ColdEmailStep[];
  reply_playbook: Array<{
    objection: string;
    counter_reply: string;
  }>;
}

export interface SEOBlogOutlineItem {
  heading: string;
  key_points: string[];
}

export interface SEOBlogBlueprint {
  article_title: string;
  target_primary_keyword: string;
  secondary_keywords: string[];
  meta_description: string;
  h2_h3_outline: SEOBlogOutlineItem[];
  information_gain_callout: string;
  ai_overview_citation_snippet: string;
}

export interface MarketingSkillOutputs {
  active_skill_id: string;
  brand_context_card?: BrandContextCard;
  paid_ads_campaigns?: PaidAdsCampaignBundle;
  cold_email_sequence?: ColdEmailSequenceBundle;
  seo_blog_blueprint?: SEOBlogBlueprint;
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
  active_skill?: string;
  skill_outputs?: MarketingSkillOutputs;
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
