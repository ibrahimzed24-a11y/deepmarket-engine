'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ResearchDossierView from '@/components/ResearchDossierView';
import SettingsModal from '@/components/SettingsModal';
import { ComprehensiveDossier, GTMStrategyArtifact, LLMConfig } from '@/lib/types';
import { Settings, Zap, Globe, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama_local',
  model: 'qwen2.5-coder:7b',
};

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentDossier, setCurrentDossier] = useState<ComprehensiveDossier | null>(null);
  const [history, setHistory] = useState<ComprehensiveDossier[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSkillId, setActiveSkillId] = useState<string>('all-in-one');

  // Load persisted settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deepmarket_llm_config');
      if (stored) {
        setLlmConfig(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSaveConfig = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    try {
      localStorage.setItem('deepmarket_llm_config', JSON.stringify(newConfig));
    } catch {}
  };

  /**
   * Client-side Local Ollama Bridge:
   * Directly calls localhost:11434 from the browser when Ollama is running on the user's Mac.
   */
  const tryClientSideOllamaSynthesis = async (
    dossier: ComprehensiveDossier
  ): Promise<ComprehensiveDossier> => {
    if (dossier.llm_status === 'Connected & Synthesized') return dossier;

    const targetUrl = (llmConfig.baseUrl || 'http://localhost:11434/v1').replace(/\/+$/, '');
    const endpoint = `${targetUrl}/chat/completions`;

    try {
      setStatusMessage('Local Ollama active — synthesizing tactical GTM strategy via browser bridge...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 16000);

      const systemPrompt = `You are an elite Go-To-Market Strategist for DeepMarket Engine.
Analyze the REAL live web evidence scraped for the user's objective:
- Scraped Google/Bing Autocomplete: ${dossier.live_evidence.keywords.map((k) => k.keyword).slice(0, 15).join(', ')}
- Real Reddit/HN Discussions: ${dossier.live_evidence.community_threads.map((t) => t.title).slice(0, 6).join(' | ')}
- Live Ranking Competitor Domains: ${dossier.live_evidence.web_competitors.map((c) => c.domain).slice(0, 6).join(', ')}

Synthesize a tactical 30-60-90 day GTM entry plan GROUNDED IN THIS REAL EVIDENCE.
CRITICAL RULES:
1. DO NOT use placeholder strings or invented generic phrases.
2. Reference actual competitor domains and real community pain points.
3. Output strict JSON with:
{
  "value_proposition": "string",
  "positioning_statement": "string",
  "pricing_recommendation": {
    "model": "string",
    "suggested_tiers": [{"name": "string", "price": "string", "features": ["string"]}]
  },
  "acquisition_channels": [{"channel": "string", "rationale": "string", "tactical_play": "string"}],
  "roadmap_30_60_90": {
    "day_1_30": ["string"],
    "day_31_60": ["string"],
    "day_61_90": ["string"]
  }
}
Return only JSON.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llmConfig.apiKey || 'ollama_local'}`,
        },
        body: JSON.stringify({
          model: llmConfig.model || 'qwen2.5-coder:7b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Objective: "${dossier.meta.query}"\nTarget Geos: ${dossier.meta.entities.target_geos.join(', ')}` },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned) as GTMStrategyArtifact;
          if (parsed.value_proposition && parsed.roadmap_30_60_90) {
            return {
              ...dossier,
              gtm: parsed,
              llm_status: 'Connected & Synthesized',
            };
          }
        }
      }
    } catch {}

    return dossier;
  };

  const handleSearch = async (query: string, location: string, skillId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const chosenSkill = skillId || activeSkillId || 'all-in-one';
    setStatusMessage(`Executing ${chosenSkill} with live web intelligence across Google, Bing, Reddit, and SERP...`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          location: location || 'Global',
          skillId: chosenSkill,
          config: llmConfig,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned error ${response.status}: ${errText}`);
      }

      let dossier = (await response.json()) as ComprehensiveDossier;

      // Attempt client-side Ollama bridge if server ran in offline evidence mode
      if (dossier.llm_status === 'Live Web Evidence Only (LLM Offline)') {
        dossier = await tryClientSideOllamaSynthesis(dossier);
      }

      setCurrentDossier(dossier);
      setHistory((prev) => [dossier, ...prev.filter((d) => d.meta.timestamp !== dossier.meta.timestamp)]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#0B1221] flex flex-col justify-between selection:bg-[#1862F6]/15 selection:text-[#1862F6]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1862F6] flex items-center justify-center text-white font-black shadow-md shadow-[#1862F6]/20">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#0B1221] tracking-tight">DeepMarket Engine</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1862F6] border border-[#DBEAFE]">
                  v4.0 25 HyperFX Skills
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded Intelligence by <span className="text-slate-600 font-semibold">Nile Supplies</span>
              </p>
            </div>
          </div>

          {/* Right Status & Settings */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>5-Source Harvester Online</span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
              title="Configure LLM & Endpoint"
            >
              <Settings className="w-3.5 h-3.5 text-[#1862F6]" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Hero (Split pill bar + skill selector pills) */}
        <ChatInterface
          onSearch={handleSearch}
          isLoading={isLoading}
          compact={Boolean(currentDossier)}
          activeSkillId={activeSkillId}
          onSkillChange={setActiveSkillId}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center space-y-3 shadow-sm animate-pulse">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EFF6FF] text-[#1862F6] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Running HyperFX Marketing Skill</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              {statusMessage || 'Querying Google Suggest, Bing Autosuggest, Reddit & live SERP competitors...'}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-xl mx-auto my-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-bold">Search notice: {errorMessage}</p>
            <p className="text-[11px] text-rose-600 mt-1">
              Please check your network connection or configure endpoints in Settings.
            </p>
          </div>
        )}

        {/* History Switcher (When previous runs exist) */}
        {history.length > 1 && currentDossier && (
          <div className="max-w-5xl mx-auto mb-4 flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
            <span className="text-xs font-bold text-slate-400 shrink-0">Previous:</span>
            {history.map((h, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentDossier(h)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition border cursor-pointer ${
                  currentDossier?.meta.timestamp === h.meta.timestamp
                    ? 'bg-[#1862F6] text-white border-[#1862F6] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {h.meta.query.slice(0, 28)}...
              </button>
            ))}
          </div>
        )}

        {/* Render Generated Dossier */}
        {currentDossier && !isLoading && (
          <div className="animate-in fade-in-50 duration-300">
            <ResearchDossierView dossier={currentDossier} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-6 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">DeepMarket Engine</span>
            <span>&middot;</span>
            <span>25-Skill Autonomous Growth Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Official Identity: <strong className="text-slate-700">Nile Supplies</strong></span>
            <span>&middot;</span>
            <a href="mailto:contact@nilesupplies.com" className="hover:text-[#1862F6] transition">
              contact@nilesupplies.com
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={llmConfig}
        onSave={handleSaveConfig}
      />
    </main>
  );
}
