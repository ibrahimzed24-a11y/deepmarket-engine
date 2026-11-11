import fs from 'fs';
import path from 'path';

export type SkillCategory =
  | 'Full Campaign Composer'
  | 'Foundation'
  | 'Research & SEO'
  | 'Paid Ads'
  | 'Creative & Content'
  | 'Outbound & Lifecycle'
  | 'Social & Analytics';

export interface MarketingSkillMeta {
  id: string;
  slash: string;
  name: string;
  category: SkillCategory;
  shortDescription: string;
  deliverables: string[];
}

export const MARKETING_SKILLS: MarketingSkillMeta[] = [
  {
    id: 'all-in-one',
    slash: '/full-campaign',
    name: 'Full-Stack Marketing Composer',
    category: 'Full Campaign Composer',
    shortDescription: 'Chains brand-context + seo-research + customer-research + competitor-intel + paid ads + outbound into one master dossier.',
    deliverables: ['Brand Context', 'Live SEO & Keywords', 'Reddit VOC & Pain Points', 'Competitor Battlecards', 'Google/Meta/TikTok Ad Plan', 'Cold Email Sequence'],
  },
  {
    id: 'brand-context',
    slash: '/brand-context',
    name: 'Brand Context & ICP Builder',
    category: 'Foundation',
    shortDescription: 'Builds brand-context.md — positioning, ICP, personas, verbatim customer language, voice, and proof points.',
    deliverables: ['Positioning Matrix', 'ICP & Buyer Personas', 'Verbatim Language Bank', 'Brand Voice & Proof Points'],
  },
  {
    id: 'seo-research',
    slash: '/seo-research',
    name: 'SEO & AI Search Research',
    category: 'Research & SEO',
    shortDescription: 'Live keyword research, SERP & AI Overview analysis, programmatic SEO angles, and content gap audits.',
    deliverables: ['Live Autocomplete Clusters', 'Search Intent Breakdown', 'Programmatic SEO URLs', 'SERP Content Gaps'],
  },
  {
    id: 'competitor-intel',
    slash: '/competitor-intel',
    name: 'Competitor Intelligence & Battlecards',
    category: 'Research & SEO',
    shortDescription: 'End-to-end competitor teardown — live site inspection, pricing signals, weaknesses, and sales battlecards.',
    deliverables: ['Live Competitor Domains', 'Pricing & Offer Teardown', 'Exploitable Weaknesses', '1-on-1 Sales Battlecards'],
  },
  {
    id: 'customer-research',
    slash: '/customer-research',
    name: 'Customer VOC & JTBD Research',
    category: 'Research & SEO',
    shortDescription: 'Mines live Reddit threads and community discussions to build verbatim VOC quote banks and Jobs-to-be-Done maps.',
    deliverables: ['Verbatim VOC Quote Bank', 'Jobs-To-Be-Done (JTBD) Map', 'Top Unsolved Frustrations', 'Buying Triggers'],
  },
  {
    id: 'reddit',
    slash: '/reddit',
    name: 'Reddit Subreddit & Sentiment Miner',
    category: 'Research & SEO',
    shortDescription: 'Researches active subreddits, high-upvote threads, questions, and community sentiment.',
    deliverables: ['Target Subreddits', 'Live High-Engagement Threads', 'Recurring Questions', 'Organic Reddit Playbook'],
  },
  {
    id: 'google-ads',
    slash: '/google-ads',
    name: 'Google Ads Campaign Architect',
    category: 'Paid Ads',
    shortDescription: 'Plans Google Search, Display, and Performance Max campaigns with exact/phrase match groups, negatives, and ad copy.',
    deliverables: ['Campaign & Ad Group Structure', 'Exact & Phrase Match Keywords', 'Negative Keyword List', 'RSA Headlines & Descriptions'],
  },
  {
    id: 'meta-ads',
    slash: '/meta-ads',
    name: 'Meta Ads (FB & IG) Planner',
    category: 'Paid Ads',
    shortDescription: 'Plans Meta Advantage+ and retargeting campaigns across Facebook and Instagram with creative hooks and angles.',
    deliverables: ['Ad Set & Targeting Architecture', '3 Primary Creative Angles', 'Primary Text, Headlines & CTAs', 'Budget & Testing Rules'],
  },
  {
    id: 'meta-ads-library',
    slash: '/meta-ads-library',
    name: 'Competitor Ad Creative Teardown',
    category: 'Paid Ads',
    shortDescription: 'Analyzes competitor ad messaging, hooks, value propositions, and landing page funnels.',
    deliverables: ['Winning Hook Patterns', 'Offer & CTA Breakdown', 'Creative Format Mix', 'Counter-Ad Angles'],
  },
  {
    id: 'tiktok-ads',
    slash: '/tiktok-ads',
    name: 'TikTok Ads & Viral Hook Planner',
    category: 'Paid Ads',
    shortDescription: 'Plans TikTok paid campaigns, UGC creator scripts, 3-second thumbstop hooks, and targeting.',
    deliverables: ['3-Second Thumbstop Hooks', 'UGC Video Script Breakdown', 'Audience & Objective Setup', 'Spark Ads Strategy'],
  },
  {
    id: 'reddit-ads',
    slash: '/reddit-ads',
    name: 'Reddit Promoted Posts Planner',
    category: 'Paid Ads',
    shortDescription: 'Plans native Reddit ad campaigns, subreddit targeting, conversation ads, and anti-corporate copy.',
    deliverables: ['Target Subreddit Clusters', 'Native Promoted Post Copy', 'Bid & Placement Setup', 'Comment Moderation Playbook'],
  },
  {
    id: 'ad-creative-generation',
    slash: '/ad-creative-generation',
    name: 'Ad Creative & Visual Prompt Studio',
    category: 'Creative & Content',
    shortDescription: 'Generates high-converting ad copy and detailed image/video generation prompts for Google, Meta, and TikTok.',
    deliverables: ['Direct-Response Copy Variants', 'Static Ad Visual Prompts', 'Video Storyboard Prompts', 'A/B Test Matrix'],
  },
  {
    id: 'blog-generation',
    slash: '/blog-generation',
    name: 'SEO & AI-Citation Blog Engine',
    category: 'Creative & Content',
    shortDescription: 'Generates comprehensive, non-repetitive blog posts and pillar outlines engineered for Google and AI search citations.',
    deliverables: ['SEO Title & Meta Specs', 'H2/H3 Structured Article Draft', 'Information Gain & Data Callouts', 'Internal Linking & FAQ Schema'],
  },
  {
    id: 'cold-email-outreach',
    slash: '/cold-email-outreach',
    name: 'B2B Cold Email Outreach Engine',
    category: 'Outbound & Lifecycle',
    shortDescription: 'Builds end-to-end B2B cold outreach: Apollo/LinkedIn targeting filters, personalization variables, and 4-step sequences.',
    deliverables: ['Prospecting & ICP Filters', 'Enrichment & Trigger Signals', '4-Step Cold Email Sequence', 'Objection & Reply Playbook'],
  },
  {
    id: 'email-lifecycle',
    slash: '/email-lifecycle',
    name: 'Lifecycle & Retention Email Flows',
    category: 'Outbound & Lifecycle',
    shortDescription: 'Designs welcome, nurture, abandoned cart, and win-back email sequences for Klaviyo, Resend, or Beehiiv.',
    deliverables: ['Flow Trigger & Delay Map', 'Welcome & Nurture Emails', 'Conversion & Win-Back Copy', 'Subject Line Test Variants'],
  },
  {
    id: 'analytics-insights',
    slash: '/analytics-insights',
    name: 'GA4, GTM & Search Console Architect',
    category: 'Social & Analytics',
    shortDescription: 'Designs conversion tracking plans, GA4 custom events, GTM triggers, and attribution KPIs.',
    deliverables: ['GA4 Event & Conversion Map', 'UTM Taxonomy Standard', 'North-Star KPI Dashboard Spec', 'Funnel Drop-Off Audit'],
  },
];

export function findSkill(identifier?: string): MarketingSkillMeta {
  if (!identifier) return MARKETING_SKILLS[0];
  const clean = identifier.trim().toLowerCase().replace(/^\//, '');
  const match = MARKETING_SKILLS.find(
    (s) => s.id === clean || s.slash.replace(/^\//, '') === clean
  );
  return match || MARKETING_SKILLS[0];
}

export function loadRawSkillMarkdown(skillId: string): string {
  try {
    if (skillId === 'all-in-one' || skillId === '/full-campaign') {
      const coreSkills = [
        'brand-context',
        'seo-research',
        'customer-research',
        'competitor-intel',
        'google-ads',
        'cold-email-outreach',
      ];
      return coreSkills
        .map((id) => {
          const p = path.join(process.cwd(), 'src', 'skills-library', id, 'SKILL.md');
          return fs.existsSync(p)
            ? `\n--- SKILL: ${id} ---\n` + fs.readFileSync(p, 'utf-8').slice(0, 2500)
            : '';
        })
        .join('\n');
    }

    const cleanId = skillId.replace(/^\//, '');
    const skillPath = path.join(process.cwd(), 'src', 'skills-library', cleanId, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, 'utf-8').slice(0, 6000);
    }
  } catch {}
  return '';
}
