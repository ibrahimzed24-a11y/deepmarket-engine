'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import SettingsModal from '@/components/SettingsModal';
import { LLMConfig } from '@/lib/types';
import { Settings, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama_local',
  model: 'qwen2.5-coder:7b',
};

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  // Load persisted settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deepmarket_llm_config');
      if (stored) {
        setLlmConfig(JSON.parse(stored));
      }
    } catch {
      // fallback to default
    }

    // Health ping
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        setIsHealthy(d?.status === 'healthy');
      })
      .catch(() => setIsHealthy(false));
  }, []);

  const handleSaveConfig = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    try {
      localStorage.setItem('deepmarket_llm_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">DeepMarket Engine</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Autonomous Intelligence by <span className="text-slate-300 font-medium">Nile Supplies</span>
              </p>
            </div>
          </div>

          {/* Right Status & Settings */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy === true
                    ? 'bg-emerald-400 animate-pulse'
                    : isHealthy === false
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-300">
                {isHealthy === true ? 'Orchestrator Online' : 'Simulation Ready'}
              </span>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/40 transition-colors shadow-sm"
              title="Configure LLM & Endpoint"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ChatInterface llmConfig={llmConfig} onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-400">Nile Supplies</strong> (
            <a href="mailto:contact@nilesupplies.com" className="text-cyan-400 hover:underline">
              contact@nilesupplies.com
            </a>
            ). All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Multi-Agent Market Research System</span>
          </p>
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
