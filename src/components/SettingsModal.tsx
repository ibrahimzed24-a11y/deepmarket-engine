'use client';

import React, { useState, useEffect } from 'react';
import { LLMConfig } from '@/lib/types';
import { X, Server, Key, Cpu, Check, AlertCircle, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: Props) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setBaseUrl(config.baseUrl);
    setApiKey(config.apiKey);
    setModel(config.model);
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data?.llm_runtime?.reachable) {
        setTestResult({
          success: true,
          message: `Connected! Latency: ${data.llm_runtime.latency_ms}ms`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Endpoint offline or tunnel inactive (${data?.llm_runtime?.diagnostics || 'Unreachable'}). Synthesized autonomous mode will activate seamlessly.`,
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Could not test health endpoint. Check network connectivity.',
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
              <h3 className="text-base font-semibold text-slate-100">LLM Endpoint & Model Settings</h3>
              <p className="text-xs text-slate-400">Configure local Ollama, vLLM, or remote OpenAI-compatible provider</p>
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
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('http://localhost:11434/v1', 'qwen2.5-coder:7b', 'ollama_local')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                💻 Localhost Ollama
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">qwen2.5-coder:7b</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('https://your-tunnel.ngrok-free.app/v1', 'llama3.3', 'ollama_tunnel')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                🌐 Cloudflare/Ngrok
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Tunnel for Vercel</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('https://api.openai.com/v1', 'gpt-4o', '')}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors text-left"
              >
                ⚡ OpenAI / Groq
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Remote API</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                LLM Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434/v1 or https://api.openai.com/v1"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                API Key / Auth Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ollama_local (or sk-your-key)"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Model Identifier
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="qwen2.5-coder:7b, llama3.3, gpt-4o"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Cloud Tunnel Guidance for Vercel */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Terminal className="w-3.5 h-3.5" />
              Bridging Local Ollama with Cloud Vercel Deployment
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When accessing this web app on public Vercel production, localhost endpoints are inaccessible from serverless functions.
              Run one command to create an instant secure tunnel:
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 select-all">
              ngrok http 11434
            </div>
            <p className="text-[11px] text-slate-400">
              Then paste the forwarding URL (e.g. <code className="text-slate-300">https://xxxx.ngrok-free.app/v1</code>) above.
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
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connectivity'}
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
