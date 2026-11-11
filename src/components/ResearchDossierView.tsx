'use client';

import React, { useState } from 'react';
import { ComprehensiveDossier } from '@/lib/types';
import ExportToolbar, { generateBrandContextMarkdown } from './ExportToolbar';
import {
  Search,
  Target,
  Rocket,
  MessageSquare,
  Globe,
  Radio,
  Sparkles,
  Check,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  FileText,
  Mail,
  Megaphone,
  BookOpen,
  Users,
  Copy,
} from 'lucide-react';

interface Props {
  dossier: ComprehensiveDossier;
}

export type DossierTab =
  | 'overview'
  | 'seo'
  | 'competitors'
  | 'community'
  | 'paid-ads'
  | 'outbound';

export default function ResearchDossierView({ dossier }: Props) {
  const [activeTab, setActiveTab] = useState<DossierTab>('overview');
  const [intentFilter, setIntentFilter] = useState<'All' | 'Transactional' | 'Commercial' | 'Informational'>('All');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const bc = dossier.skill_outputs?.brand_context_card;
  const ads = dossier.skill_outputs?.paid_ads_campaigns;
  const coldEmail = dossier.skill_outputs?.cold_email_sequence;
  const seoBlog = dossier.skill_outputs?.seo_blog_blueprint;

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case 'Transactional':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Transactional
          </span>
        );
      case 'Commercial':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1862F6] border border-blue-200">
            Commercial
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Informational
          </span>
        );
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'Google Autocomplete') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
          Google Autocomplete
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-700 border border-teal-100 font-semibold">
        Bing Autosuggest
      </span>
    );
  };

  const filteredKeywords = dossier.live_evidence.keywords.filter((k) => {
    if (intentFilter === 'All') return true;
    return k.intent === intentFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Verification Header Badge (Pure White Card) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#1862F6] border border-[#DBEAFE]">
              HyperFX 25-Skill Engine Active
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                dossier.llm_status === 'Connected & Synthesized'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {dossier.llm_status === 'Connected & Synthesized' ? '● LLM Grounded' : '○ Live Web Scrape (Zero Mock)'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(dossier.live_evidence.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1221] tracking-tight">{dossier.meta.query}</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Target Vertical: <span className="text-slate-800 font-semibold">{dossier.meta.entities.industry}</span> &middot;
            Geos: <span className="text-[#1862F6] font-semibold">{dossier.meta.entities.target_geos.join(', ')}</span> &middot;
            Model: <span className="text-slate-800 font-semibold">{dossier.meta.entities.business_model}</span>
          </p>
        </div>

        <div className="shrink-0 print:hidden">
          <ExportToolbar dossier={dossier} />
        </div>
      </div>

      {/* 2. Top-Level Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1862F6] flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1221]">{dossier.live_evidence.keywords.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Autocomplete Keywords</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1221]">{dossier.live_evidence.community_threads.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Reddit &amp; HN VOC Threads</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1221]">{dossier.live_evidence.web_competitors.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Live Competitors Inspected</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1221]">30-60-90</div>
            <div className="text-[11px] text-slate-500 font-medium">Ready Execution GTM</div>
          </div>
        </div>
      </div>

      {/* 3. Pure-White 6-Tab Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm print:hidden">
        <nav className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview &amp; brand-context.md</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>SEO &amp; Blog Blueprint ({dossier.live_evidence.keywords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('competitors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'competitors'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Competitor Battlecards ({dossier.live_evidence.web_competitors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'community'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reddit &amp; VOC Mining ({dossier.live_evidence.community_threads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('paid-ads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'paid-ads'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Google, Meta &amp; TikTok Ads</span>
          </button>

          <button
            onClick={() => setActiveTab('outbound')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'outbound'
                ? 'bg-[#1862F6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1862F6] hover:bg-slate-50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Cold Email &amp; Lifecycle</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & BRAND-CONTEXT.MD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Canonical brand-context.md Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#0B1221]">Canonical brand-context.md</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1862F6] border border-[#BFDBFE]">
                    Foundation Skill
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Canonical positioning, buyer personas, and verbatim Reddit voice-of-customer rules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(generateBrandContextMarkdown(dossier), 'bc-full')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs"
                >
                  {copiedIndex === 'bc-full' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedIndex === 'bc-full' ? 'Copied' : 'Copy brand-context.md'}</span>
                </button>
              </div>
            </div>

            {/* Positioning & Value Prop */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Positioning Statement
              </span>
              <p className="text-base text-slate-900 font-medium leading-relaxed">
                &ldquo;{bc?.positioning_statement || dossier.gtm.positioning_statement}&rdquo;
              </p>
            </div>

            {/* ICP & Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-[#1862F6]" />
                  <span>Target ICP &amp; Decision Makers</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(bc?.target_icp.titles || ['Chief Executive Officer', 'Head of Growth', 'Operations Lead']).map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#1862F6] font-bold">&bull;</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Buying Triggers:
                  </span>
                  <p className="text-xs text-slate-600 italic">
                    {bc?.target_icp.core_triggers.join(' | ') || 'Inflexible legacy pricing and slow implementation'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Buyer Personas &amp; Goals</span>
                </div>
                <div className="space-y-2.5">
                  {(bc?.buyer_personas || []).map((p, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{p.role}</div>
                      <div className="text-slate-600"><strong className="text-slate-800">Goal:</strong> {p.primary_goal}</div>
                      <div className="text-slate-500 text-[11px]"><strong className="text-slate-700">Pain:</strong> {p.dealbreaker_pain}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verbatim VOC Language Bank */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                <span>Verbatim Voice-of-Customer Language (From Reddit &amp; HN)</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(bc?.verbatim_voc_language || dossier.live_evidence.community_threads.slice(0, 4).map(t => t.title)).map((v, i) => (
                  <div key={i} className="p-3 rounded-lg bg-orange-50/50 border border-orange-200/60 text-xs text-slate-700 italic leading-relaxed">
                    &ldquo;{v}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Voice Rules & Proof Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Brand Voice Directives</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(bc?.brand_voice_rules || ['Direct and authoritative', 'Never use fluffy adjectives']).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Defensible Proof Points</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(bc?.key_proof_points || ['Grounded in live search signals', 'Zero vendor lock-in']).map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&check;</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* GTM 30-60-90 Playbook Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-[#0B1221]">Tactical 30-60-90 Day Execution Roadmap</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Day 1 &ndash; 30</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#1862F6]">Pilot &amp; Baseline</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {dossier.gtm.roadmap_30_60_90.day_1_30.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">&rarr;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Day 31 &ndash; 60</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">Ad Channels &amp; Scale</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {dossier.gtm.roadmap_30_60_90.day_31_60.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">&rarr;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Day 61 &ndash; 90</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Programmatic Moat</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {dossier.gtm.roadmap_30_60_90.day_61_90.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&rarr;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & BLOG BLUEPRINT */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* SEO Blog Pillar Brief */}
          {seoBlog && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1862F6]" />
                  <h3 className="text-base font-bold text-[#0B1221]">/blog-generation — SEO Pillar Article Brief</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1862F6] border border-blue-200">
                  AI Overview Optimized
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Article Title:</span>
                <h4 className="text-lg font-bold text-slate-900">{seoBlog.article_title}</h4>
                <p className="text-xs text-slate-600">{seoBlog.meta_description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Google AI Overview Citation Snippet:</span>
                <p className="text-xs text-blue-900 leading-relaxed font-mono">
                  &ldquo;{seoBlog.ai_overview_citation_snippet}&rdquo;
                </p>
              </div>

              {/* H2/H3 Outline */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-900 block">Structured Article Outline:</span>
                <div className="space-y-2">
                  {seoBlog.h2_h3_outline.map((sec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-bold text-slate-900 mb-1">{sec.heading}</div>
                      <ul className="space-y-0.5 text-slate-600 pl-3 list-disc">
                        {sec.key_points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Autocomplete Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0B1221]">Live Autocomplete Search Signals</h3>
                <p className="text-xs text-slate-500">Harvested directly from Google &amp; Bing Suggest APIs</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['All', 'Transactional', 'Commercial', 'Informational'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setIntentFilter(filter)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      intentFilter === filter
                        ? 'bg-[#1862F6] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-1">Live Autocomplete Keyword</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Intent</th>
                    <th className="pb-3 text-right pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeywords.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 pl-1 font-mono text-slate-900 font-medium">{k.keyword}</td>
                      <td className="py-2.5">{getSourceBadge(k.source)}</td>
                      <td className="py-2.5">{getIntentBadge(k.intent)}</td>
                      <td className="py-2.5 text-right pr-1">
                        <button
                          onClick={() => handleCopyText(k.keyword, `kw-${idx}`)}
                          className="text-slate-400 hover:text-[#1862F6] transition cursor-pointer"
                          title="Copy keyword"
                        >
                          {copiedIndex === `kw-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPETITOR BATTLECARDS */}
      {activeTab === 'competitors' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0B1221]">Live Competitor Battlecards &amp; DOM Teardown</h3>
              <p className="text-xs text-slate-500">Directly inspected via HTTP for live headings, meta descriptions, and pricing</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {dossier.live_evidence.web_competitors.length} Verified Incumbents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossier.live_evidence.web_competitors.map((comp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {comp.domain}
                    </span>
                    <a
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1862F6] hover:underline"
                    >
                      <span>Live Site</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1221] line-clamp-1">{comp.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{comp.description}</p>

                  {/* Headings */}
                  {comp.h1_headings.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Inspected Headings:
                      </span>
                      <div className="space-y-1">
                        {comp.h1_headings.map((h1, hIdx) => (
                          <div
                            key={hIdx}
                            className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 line-clamp-1"
                          >
                            &ldquo;{h1}&rdquo;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Signals */}
                  {comp.pricing_signals.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-700 font-semibold font-mono">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>Live Pricing Detected: {comp.pricing_signals.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Sales Battlecard Angle */}
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    How To Win Against {comp.domain}:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Attack their opaque quotation barriers with instant self-serve onboarding and localized regional settlement.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REDDIT & COMMUNITY VOC */}
      {activeTab === 'community' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0B1221]">Reddit &amp; HackerNews Community Mining</h3>
              <p className="text-xs text-slate-500">Live practitioner discussions and verbatim customer pain points</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
              {dossier.live_evidence.community_threads.length} Verified Threads
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dossier.live_evidence.community_threads.map((thread, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-2.5 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        thread.source === 'Reddit'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {thread.source} &middot; {thread.author_or_sub}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{thread.created_at}</span>
                  </div>

                  <a
                    href={thread.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#0B1221] hover:text-[#1862F6] transition-colors line-clamp-2 block"
                  >
                    {thread.title}
                  </a>

                  {thread.snippet && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 italic border-l-2 border-slate-200 pl-2">
                      &ldquo;{thread.snippet}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <span>
                    Score: <strong className="text-slate-800">{thread.score}</strong> &middot; Comments:{' '}
                    <strong className="text-slate-800">{thread.comments_count}</strong>
                  </span>
                  <a
                    href={thread.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#1862F6] hover:underline font-bold"
                  >
                    <span>Read Thread</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAID ADS (GOOGLE, META, TIKTOK) */}
      {activeTab === 'paid-ads' && (
        <div className="space-y-6">
          {ads ? (
            <>
              {/* Google Search Ad Groups */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#1862F6]" />
                    <h3 className="text-base font-bold text-[#0B1221]">/google-ads — Ready-to-Launch Search Structure</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Budget: {ads.daily_budget_recommendation}
                  </span>
                </div>

                <div className="space-y-4">
                  {ads.google_search_ad_groups.map((group, gIdx) => (
                    <div key={gIdx} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{group.ad_group_name}</h4>
                        <button
                          onClick={() => handleCopyText(group.rsa_headlines.join('\n') + '\n\n' + group.rsa_descriptions.join('\n'), `ad-${gIdx}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          {copiedIndex === `ad-${gIdx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedIndex === `ad-${gIdx}` ? 'Copied' : 'Copy Copy'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-400 text-[10px] uppercase block">Exact Match Keywords:</span>
                          <div className="font-mono text-slate-800">{group.exact_match_keywords.join('  ')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-400 text-[10px] uppercase block">Negative Keywords:</span>
                          <div className="font-mono text-red-600">{group.negative_keywords.join('  ')}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-700 text-[11px] block">RSA Responsive Headlines:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.rsa_headlines.map((h, hIdx) => (
                            <span key={hIdx} className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700 text-[11px] block">RSA Descriptions:</span>
                        {group.rsa_descriptions.map((d, dIdx) => (
                          <p key={dIdx} className="p-2.5 rounded bg-white border border-slate-200 text-slate-600 leading-relaxed">
                            {d}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta & TikTok Paid Angles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meta Advantage+ */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Megaphone className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">/meta-ads — Advantage+ Angles</h3>
                  </div>

                  <div className="space-y-3">
                    {ads.meta_advantage_angles.map((m, mIdx) => (
                      <div key={mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="font-bold text-slate-900">{m.angle_name}</div>
                        <p className="text-slate-700 italic leading-relaxed">&ldquo;{m.primary_text}&rdquo;</p>
                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                          <span className="font-bold text-slate-800">Headline: {m.headline}</span>
                          <span className="text-[#1862F6] font-bold">{m.cta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TikTok Hooks */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <h3 className="text-sm font-bold text-slate-900">/tiktok-ads — 3-Second Hooks</h3>
                  </div>

                  <div className="space-y-3">
                    {ads.tiktok_hooks.map((t, tIdx) => (
                      <div key={tIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                          {t.hook_type}
                        </span>
                        <p className="text-slate-900 font-semibold">{t.script_hook_3s}</p>
                        <p className="text-slate-500 text-[11px]">Visual Cue: {t.visual_cue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">No paid ad campaigns generated for this query.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: OUTBOUND & LIFECYCLE */}
      {activeTab === 'outbound' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {coldEmail ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#1862F6]" />
                  <h3 className="text-base font-bold text-[#0B1221]">/cold-email-outreach — 3-Step B2B Sequence</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Target: {coldEmail.target_titles.slice(0, 2).join(', ')}
                </span>
              </div>

              {/* Sequence Steps */}
              <div className="space-y-4">
                {coldEmail.sequence.map((step) => (
                  <div key={step.step_number} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1862F6] text-white text-xs font-bold flex items-center justify-center">
                          {step.step_number}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{step.timing}</span>
                      </div>

                      <button
                        onClick={() => handleCopyText(`Subject: ${step.subject_line}\n\n${step.body}`, `em-${step.step_number}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                      >
                        {copiedIndex === `em-${step.step_number}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === `em-${step.step_number}` ? 'Copied' : 'Copy Email'}</span>
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      Subject: <span className="font-mono text-[#1862F6]">{step.subject_line}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {step.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Playbook */}
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Objection Handling &amp; Reply Playbook
                </h4>
                <div className="space-y-2 text-xs">
                  {coldEmail.reply_playbook.map((r, rIdx) => (
                    <div key={rIdx} className="p-3 rounded-lg bg-white border border-blue-200/60 space-y-1">
                      <div className="font-bold text-slate-800">When prospect says: {r.objection}</div>
                      <div className="text-slate-600 leading-relaxed">{r.counter_reply}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500">No cold email sequence generated for this query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
