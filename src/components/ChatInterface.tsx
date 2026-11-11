'use client';

import React, { useState } from 'react';
import { Search, MapPin, Loader2, Radio, Globe, MessageSquare, Rocket } from 'lucide-react';

interface ChatInterfaceProps {
  onSearch: (query: string, location: string) => Promise<void>;
  isLoading: boolean;
  compact?: boolean;
}

const TRENDING_SEARCHES = [
  { label: 'High Ticket Affiliate', location: 'Global' },
  { label: 'Travel eSIM Portal', location: 'Maldives & Asia' },
  { label: 'B2B Resort Food Supply', location: 'Maldives' },
  { label: 'AI Booking Concierge', location: 'Bali, Indonesia' },
  { label: 'Boutique Dive Center SaaS', location: 'Southeast Asia' },
  { label: 'Remote Tech Talent Agency', location: 'United States' },
];

export default function ChatInterface({
  onSearch,
  isLoading,
  compact = false,
}: ChatInterfaceProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), location.trim() || 'Global');
  };

  const handleTrendingClick = (item: { label: string; location: string }) => {
    if (isLoading) return;
    setQuery(item.label);
    setLocation(item.location);
    onSearch(item.label, item.location);
  };

  return (
    <section
      className={`w-full max-w-4xl mx-auto px-4 transition-all duration-300 print:hidden ${
        compact ? 'pt-4 pb-6' : 'pt-10 sm:pt-16 pb-12'
      }`}
    >
      {/* Top Status Pill */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#1862F6] text-xs font-semibold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1862F6] animate-pulse" />
          <span>Live Web Autocomplete, SERP &amp; Reddit Indexing Active</span>
        </div>
      </div>

      {/* Two-Tone Display Headline */}
      {!compact && (
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0B1221] mb-4">
            Find your next
            <span className="block text-[#1862F6]">market opportunity.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Search live SEO keywords, real Reddit &amp; HackerNews demand,
            competitor gaps, and GTM playbooks across industries worldwide.
          </p>
        </div>
      )}

      {/* Unified Pill Split Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-full p-2 pl-5 border border-slate-200/90 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-[#1862F6]/60 focus-within:ring-4 focus-within:ring-[#1862F6]/10 transition"
      >
        {/* Left Input: Niche / Industry / Keyword */}
        <div className="flex items-center gap-3 flex-1 min-w-0 py-1.5 sm:py-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Niche, business model, or product..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none truncate"
          />
        </div>

        {/* Vertical Hairline Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200" />

        {/* Right Input: Location */}
        <div className="flex items-center gap-2 sm:w-44 py-1.5 sm:py-0 border-t sm:border-t-0 border-slate-100">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
            placeholder="Location / Region..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none truncate"
          />
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-full bg-[#1862F6] hover:bg-[#1554D6] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#1862F6]/20 transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Trending Pill Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
        <span className="text-slate-400 font-medium">Trending:</span>
        {TRENDING_SEARCHES.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleTrendingClick(item)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-[#1862F6] border border-slate-200 shadow-sm transition cursor-pointer"
          >
            {item.label} <span className="text-slate-400 font-normal">&middot; {item.location}</span>
          </button>
        ))}
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
              <span className="text-[11px] text-slate-500 mt-0.5">Real search autocomplete</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 sm:border-r border-slate-100 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Reddit &amp; HackerNews</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Live community discussions</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 sm:border-r border-slate-100 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Inspected Domains</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Live scraped headings &amp; pricing</span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-2 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">30-60-90 Playbooks</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Evidence-grounded strategy</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
