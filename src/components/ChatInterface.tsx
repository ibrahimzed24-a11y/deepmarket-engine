'use client';

import React, { useState } from 'react';
import { Search, MapPin, Loader2, Radio, Globe, MessageSquare, Zap, Target, Layers, FileText, Send, Sparkles } from 'lucide-react';
import { MARKETING_SKILLS, MarketingSkillMeta } from '@/lib/skills-registry';

interface ChatInterfaceProps {
  onSearch: (query: string, location: string, skillId?: string) => Promise<void>;
  isLoading: boolean;
  compact?: boolean;
  activeSkillId?: string;
  onSkillChange?: (skillId: string) => void;
}

const PRIMARY_SKILL_PILLS = [
  { id: 'all-in-one', slash: '/full-campaign', label: '⚡ Full Campaign Composer' },
  { id: 'brand-context', slash: '/brand-context', label: '/brand-context' },
  { id: 'seo-research', slash: '/seo-research', label: '/seo-research' },
  { id: 'competitor-intel', slash: '/competitor-intel', label: '/competitor-intel' },
  { id: 'customer-research', slash: '/customer-research', label: '/customer-research' },
  { id: 'google-ads', slash: '/google-ads', label: '/google-ads' },
  { id: 'meta-ads', slash: '/meta-ads', label: '/meta-ads' },
  { id: 'tiktok-ads', slash: '/tiktok-ads', label: '/tiktok-ads' },
  { id: 'cold-email-outreach', slash: '/cold-email-outreach', label: '/cold-email-outreach' },
  { id: 'blog-generation', slash: '/blog-generation', label: '/blog-generation' },
];

export default function ChatInterface({
  onSearch,
  isLoading,
  compact = false,
  activeSkillId = 'all-in-one',
  onSkillChange,
}: ChatInterfaceProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(activeSkillId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), location.trim() || 'Global', selectedSkill);
  };

  const handleSkillPillClick = (skill: { id: string; slash: string; label: string }) => {
    if (isLoading) return;
    setSelectedSkill(skill.id);
    if (onSkillChange) onSkillChange(skill.id);

    // If query is present, re-run with this skill
    if (query.trim()) {
      onSearch(query.trim(), location.trim() || 'Global', skill.id);
    }
  };

  return (
    <section
      className={`w-full max-w-4xl mx-auto px-4 transition-all duration-300 print:hidden ${
        compact ? 'pt-4 pb-6' : 'pt-10 sm:pt-16 pb-12'
      }`}
    >
      {/* Top Status Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#1862F6] text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#1862F6] animate-pulse" />
          <span>24 HyperFX Marketing Skills + 5 Live Web Sources Active</span>
        </div>
      </div>

      {/* Hero Headline (When not compact) */}
      {!compact && (
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0B1221] mb-4">
            Run your next
            <span className="block text-[#1862F6]">marketing skill.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Execute autonomous SEO, competitor battlecards, Reddit VOC mining, paid ads,
            and cold outreach grounded in live web data.
          </p>
        </div>
      )}

      {/* Unified Pill Split Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-full p-2 pl-5 border border-slate-200/90 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-[#1862F6]/60 focus-within:ring-4 focus-within:ring-[#1862F6]/10 transition"
      >
        {/* Left Input: Niche, Brand URL, or /skill */}
        <div className="flex items-center gap-3 flex-1 min-w-0 py-1.5 sm:py-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Enter niche, brand URL, or /skill (e.g. /google-ads for Maldives eSIM)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none truncate"
          />
        </div>

        {/* Vertical Hairline Divider */}
        <div className="hidden sm:block w-px h-6 bg-[#E2E8F0]" />

        {/* Right Input: Location */}
        <div className="flex items-center gap-2 sm:w-44 py-1.5 sm:py-0 border-t sm:border-t-0 border-slate-100">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
            placeholder="Location (e.g. Global, US)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none truncate"
          />
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-full bg-[#1862F6] hover:bg-[#1554D6] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#1862F6]/20 transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            'Run Skill'
          )}
        </button>
      </form>

      {/* Interactive Skill Selector Pills (Matching Trending: row in search ref.png) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs max-w-3xl mx-auto">
        <span className="text-slate-400 font-medium">Skills:</span>
        {PRIMARY_SKILL_PILLS.map((pill) => {
          const isActive = selectedSkill === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleSkillPillClick(pill)}
              disabled={isLoading}
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer border shadow-sm ${
                isActive
                  ? 'bg-[#1862F6] text-white border-[#1862F6] shadow-blue-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-[#1862F6] border-slate-200'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 4-Column Separated Telemetry Strip (When not compact) */}
      {!compact && (
        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 sm:border-r border-slate-100 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1862F6] flex items-center justify-center mb-2">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Google &amp; Bing Suggest</span>
              <span className="text-[11px] text-slate-500 mt-0.5">40+ live autocomplete signals</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 sm:border-r border-slate-100 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Reddit &amp; HackerNews</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Verbatim VOC &amp; pain quotes</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 sm:border-r border-slate-100 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Live Scraped Competitors</span>
              <span className="text-[11px] text-slate-500 mt-0.5">DOM headings &amp; price inspection</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">25 HyperFX Skills</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Grounded execution engine</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
