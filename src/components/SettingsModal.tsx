'use client';

import React, { useState, useEffect } from 'react';
import { LLMConfig } from '@/lib/types';
import { X, Server, Key, Cpu, Check, AlertCircle, RefreshCw, Terminal, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: Props) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || 'http://localhost:11434/v1');
  const [apiKey, setApiKey] = useState(config.apiKey || 'ollama_local');
  const [model, setModel] = useState(config.model || 'qwen2.5-coder:7b');
  const [tavilyKey, setTavilyKey] = useState(config.tavilyKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setBaseUrl(config.baseUrl || 'http://localhost:11434/v1');
    setApiKey(config.apiKey || 'ollama_local');
    setModel(config.model || 'qwen2.5-coder:7b');
    setTavilyKey(config.tavilyKey || '');
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestBrowserConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Test direct browser reachability
    const targetUrl = baseUrl.trim().replace(/\/+$/, '');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      // Attempt to probe /models or /tags
      const res = await fetch(`${targetUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        } as HeadersInit,
        signal: controller.signal,
      }).catch(async () => {
        // Fallback probe for ollama /api/tags
        return fetch(`${targetUrl.replace('/v1', '')}/api/tags`, {
          signal: controller.signal,
        });
      });

      clearTimeout(timeout);

      if (res && res.ok) {
        setTestResult({
          success: true,
          message: `Connected successfully from your browser to ${targetUrl}! Client-side Ollama bridge is active.`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Endpoint returned HTTP ${res?.status || 'network error'}. If using local Ollama, ensure 'launchctl setenv OLLAMA_ORIGINS "*"' is set.`,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: `Could not connect to ${targetUrl} directly. Ensure Ollama is running ('ollama serve') with OLLAMA_ORIGINS="*" or provide a cloud API key.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePreset = (presetBase: string, presetModel: string, presetKey: string) => {
    setBaseUrl(presetBase);
    setModel(presetModel);
    setApiKey(presetKey);
    setTestResult(null);
  };

  const handleSave = () => {
    onSave({
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
      tavilyKey: tavilyKey.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">LLM & Web Harvester Settings</h3>
              <p className="text-xs text-slate-400">Configure local Ollama bridge, Cloud LLM, or Tavily Search</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Model Endpoint Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('http://localhost:11434/v1', 'qwen2.5-coder:7b', 'ollama_local')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                💻 Local Ollama
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">qwen2.5-coder:7b</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile', '')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                ⚡ Groq Cloud
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Ultra Fast</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('https://api.openai.com/v1', 'gpt-4o', '')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                🌐 OpenAI / Remote
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Custom Endpoint</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                LLM Base URL (Local or Remote)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434/v1"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ollama_local or gsk_..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Model Name
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="qwen2.5-coder:7b"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Optional Tavily API Key */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                Optional Tavily Search Key
                <span className="text-[10px] text-slate-400 font-normal">(Free search booster)</span>
              </label>
              <input
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Local Mac Ollama Instructions */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Terminal className="w-3.5 h-3.5" />
              Direct Browser-to-Mac Ollama Bridge
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When accessing the Vercel site in your browser, your browser can directly connect to your Mac&rsquo;s local Ollama without sending data to third parties. Run this once in your Mac terminal:
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 select-all">
              launchctl setenv OLLAMA_ORIGINS &quot;*&quot;
            </div>
            <p className="text-[11px] text-slate-500">
              (Then restart Ollama). This allows your browser on Vercel to connect directly to <code className="text-slate-300">http://localhost:11434</code>.
            </p>
          </div>

          {/* Test Status */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={handleTestBrowserConnection}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
