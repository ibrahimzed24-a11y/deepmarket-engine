'use client';

import React, { useState } from 'react';
import { ComprehensiveDossier } from '@/lib/types';
import ExportToolbar from './ExportToolbar';
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
} from 'lucide-react';

interface Props {
  dossier: ComprehensiveDossier;
}

export default function ResearchDossierView({ dossier }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'keywords' | 'competitors' | 'community' | 'gtm'>('all');
  const [intentFilter, setIntentFilter] = useState<'All' | 'Transactional' | 'Commercial' | 'Informational'>('All');

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Verification Header Badge (Pure White Card) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#1862F6] border border-[#DBEAFE]">
              Live Web Intelligence Verified
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

        <div className="flex items-center gap-2 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            title="Print or Save as PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
          <ExportToolbar dossier={dossier} />
        </div>
      </div>

      {/* 4-Metric Verification Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Keywords</span>
            <Radio className="w-4 h-4 text-[#1862F6]" />
          </div>
          <div className="text-2xl font-black text-[#1862F6] tracking-tight">
            {dossier.live_evidence.keywords.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Google &amp; Bing Autocomplete</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Competitor Domains</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 tracking-tight">
            {dossier.live_evidence.web_competitors.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Live Scraped Metadata</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Community Threads</span>
            <MessageSquare className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-600 tracking-tight">
            {dossier.live_evidence.community_threads.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Reddit &amp; HackerNews Live</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Signals</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {dossier.live_evidence.web_competitors.reduce((acc, c) => acc + c.pricing_signals.length, 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Scraped On-Page Pricing</p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All Verifiable Signals
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'keywords'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Live Autocomplete ({dossier.live_evidence.keywords.length})
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'competitors'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Live Competitors ({dossier.live_evidence.web_competitors.length})
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'community'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Reddit &amp; HN Discussions ({dossier.live_evidence.community_threads.length})
        </button>
        <button
          onClick={() => setActiveTab('gtm')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'gtm'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          30-60-90 Playbook
        </button>
      </div>

      {/* 2. Live Search Autocomplete Table */}
      {(activeTab === 'all' || activeTab === 'keywords') && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1862F6]">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1221]">Live Search Autocomplete Signals</h3>
                <p className="text-xs text-slate-500">
                  Real user queries harvested from Google Suggest and Bing Autosuggest APIs
                </p>
              </div>
            </div>

            {/* Intent Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              {(['All', 'Transactional', 'Commercial', 'Informational'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setIntentFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    intentFilter === filter
                      ? 'bg-white text-[#1862F6] shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Real Search Keyword</th>
                  <th className="px-3 py-3 font-bold">Source</th>
                  <th className="px-3 py-3 font-bold">Classified Intent</th>
                  <th className="px-4 py-3 font-bold">Trigger Modifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredKeywords.map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-[#1862F6]">{k.keyword}</td>
                    <td className="px-3 py-3">{getSourceBadge(k.source)}</td>
                    <td className="px-3 py-3">{getIntentBadge(k.intent)}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{k.modifier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Live Inspected Web Competitors Grid */}
      {(activeTab === 'all' || activeTab === 'competitors') && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-[#1862F6]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1221]">Live Inspected Web Competitors</h3>
              <p className="text-xs text-slate-500">
                Discovered via public web search and directly inspected via HTTP for live headings and pricing signals
              </p>
            </div>
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
                      <span>Visit Live Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1221] line-clamp-1">{comp.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{comp.description}</p>

                  {/* Extracted H1 Headings */}
                  {comp.h1_headings.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Inspected &lt;H1&gt; Headings:
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

                  {/* Detected Pricing Signals */}
                  {comp.pricing_signals.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Price Signals:
                      </span>
                      {comp.pricing_signals.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono truncate">
                  Source query: &ldquo;{comp.source_query}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Voice of the Market: Live Reddit & HackerNews Community Discussions */}
      {(activeTab === 'all' || activeTab === 'community') && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1221]">Voice of the Market (Live Community Discussions)</h3>
              <p className="text-xs text-slate-500">
                Real customer feedback, unmet needs, and unfiltered pain points from Reddit &amp; HackerNews
              </p>
            </div>
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
                    className="text-[#1862F6] font-semibold hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    Open Thread <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GTM Strategy & 30-60-90 Day Playbook */}
      {(activeTab === 'all' || activeTab === 'gtm') && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1221]">GTM Strategy &amp; 30-60-90 Day Playbook</h3>
              <p className="text-xs text-slate-500">
                Actionable market entry plan directly synthesized from the harvested web evidence
              </p>
            </div>
          </div>

          {/* Positioning */}
          <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1862F6] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Strategic Positioning Statement
            </div>
            <p className="text-sm text-slate-900 leading-relaxed font-semibold">
              &ldquo;{dossier.gtm.positioning_statement}&rdquo;
            </p>
            <div className="text-xs text-slate-600 pt-1 border-t border-blue-200/60">
              Core Value Proposition: <span className="text-slate-900 font-medium">{dossier.gtm.value_proposition}</span>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pricing Recommendation: {dossier.gtm.pricing_recommendation.model}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dossier.gtm.pricing_recommendation.suggested_tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{tier.name}</h5>
                    <div className="text-lg font-black text-[#1862F6] my-1">{tier.price}</div>
                    <ul className="space-y-1.5 border-t border-slate-100 pt-2.5">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#1862F6] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acquisition Channels */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Customer Acquisition Channels
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Channel</th>
                    <th className="px-4 py-3 font-bold">Rationale</th>
                    <th className="px-4 py-3 font-bold">Tactical Play</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dossier.gtm.acquisition_channels.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1862F6]">{ch.channel}</td>
                      <td className="px-4 py-3 text-slate-700">{ch.rationale}</td>
                      <td className="px-4 py-3 text-slate-500">{ch.tactical_play}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 30-60-90 Day Milestones */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              30-60-90 Day Execution Milestones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1862F6] border border-blue-200">
                    Day 1 - 30
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Foundation</span>
                </div>
                <ul className="space-y-2">
                  {dossier.gtm.roadmap_30_60_90.day_1_30.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-slate-500">
                        {idx + 1}
                      </div>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Day 31 - 60
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Growth &amp; Launch</span>
                </div>
                <ul className="space-y-2">
                  {dossier.gtm.roadmap_30_60_90.day_31_60.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-slate-500">
                        {idx + 1}
                      </div>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Day 61 - 90
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Scale &amp; Flywheel</span>
                </div>
                <ul className="space-y-2">
                  {dossier.gtm.roadmap_30_60_90.day_61_90.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-slate-500">
                        {idx + 1}
                      </div>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
