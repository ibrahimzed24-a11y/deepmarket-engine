'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AgentState,
  ExecutiveDossier,
  LLMConfig,
  StreamPayload,
} from '@/lib/types';
import AgentWorkflowVisualizer from './AgentWorkflowVisualizer';
import ResearchDossierView from './ResearchDossierView';
import {
  Send,
  Sparkles,
  Loader2,
  Terminal,
  History,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface Props {
  llmConfig: LLMConfig;
  onOpenSettings: () => void;
}

const INITIAL_AGENT_STATE: AgentState = {
  orchestrator: { status: 'idle' },
  geo: { status: 'idle' },
  seo: { status: 'idle' },
  competitor: { status: 'idle' },
  gtm: { status: 'idle' },
};

const SUGGESTED_PROMPTS = [
  'B2B SaaS for Island Guesthouses in Southeast Asia',
  'Travel eSIM Marketplace for Asia Tourists',
  'Specialty Agro-Food Export from Egypt to Maldives Resorts',
];

interface LogEntry {
  timestamp: string;
  agent?: string;
  message: string;
  type?: 'info' | 'success' | 'warn' | 'error';
}

export default function ChatInterface({ llmConfig, onOpenSettings }: Props) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentState, setAgentState] = useState<AgentState>(INITIAL_AGENT_STATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDossier, setCurrentDossier] = useState<ExecutiveDossier | null>(null);
  const [history, setHistory] = useState<ExecutiveDossier[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, agent?: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agent,
        message,
        type,
      },
    ]);
  };

  const handleStartResearch = async (targetPrompt?: string) => {
    const query = (targetPrompt || inputPrompt).trim();
    if (!query || isRunning) return;

    setIsRunning(true);
    setErrorMessage(null);
    setCurrentStep(1);
    setAgentState({
      orchestrator: { status: 'running', message: 'Decomposing market target...' },
      geo: { status: 'idle' },
      seo: { status: 'idle' },
      competitor: { status: 'idle' },
      gtm: { status: 'idle' },
    });
    setLogs([]);
    addLog(`Initiating autonomous market intelligence pipeline for: "${query}"`, 'System', 'info');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          config: llmConfig,
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(`Server returned error ${response.status}: ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6);
          try {
            const payload = JSON.parse(jsonStr) as StreamPayload;

            if (payload.step) {
              setCurrentStep(payload.step);
            }

            if (payload.agent && payload.status) {
              setAgentState((prev) => ({
                ...prev,
                [payload.agent!]: {
                  status: payload.status!,
                  message: payload.message || prev[payload.agent!]?.message,
                },
              }));
            }

            if (payload.message) {
              addLog(payload.message, payload.agent, payload.status === 'completed' ? 'success' : 'info');
            }

            if (payload.type === 'dossier_ready' && payload.dossier) {
              setCurrentDossier(payload.dossier);
              setHistory((prev) => [payload.dossier!, ...prev.filter((d) => d.id !== payload.dossier!.id)]);
              addLog('Executive Intelligence Dossier generated successfully.', 'System', 'success');
            }

            if (payload.type === 'error' && payload.error) {
              setErrorMessage(payload.error);
              addLog(payload.error, 'Error', 'error');
            }
          } catch {
            // ignore non-json line
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      addLog(`Execution halted: ${msg}`, 'Error', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartResearch();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Workflow Visualizer */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Autonomous Agent Swarm
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isRunning ? `Phase ${currentStep} of 5 Active` : currentDossier ? 'Execution Complete' : 'Swarm Standby'}
          </span>
        </div>

        <AgentWorkflowVisualizer state={agentState} currentStep={currentStep} totalSteps={5} />
      </div>

      {/* Real-time Execution Terminal (Visible while running or when logs exist) */}
      {logs.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-semibold uppercase text-slate-300">Agent Stream Logs</span>
            </div>
            {isRunning && (
              <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Live Execution
              </span>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                {log.agent && (
                  <span className="text-cyan-400 font-semibold shrink-0 text-[11px]">[{log.agent}]</span>
                )}
                <span
                  className={
                    log.type === 'error'
                      ? 'text-rose-400'
                      : log.type === 'success'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Execution Notice</p>
            <p>{errorMessage}</p>
            <p className="text-[11px] text-rose-400/80">
              Tip: You can change the LLM endpoint or connect local Ollama in Settings.
            </p>
          </div>
        </div>
      )}

      {/* Dossier Workspace */}
      {currentDossier ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ResearchDossierView dossier={currentDossier} />
        </div>
      ) : (
        /* Empty State / Welcome Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              DeepMarket Autonomous Research Engine
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Input any market entry, product expansion, or regional venture query. Specialized AI agents will
              simultaneously analyze regional TAM, reverse-engineer competitors, uncover high-intent SEO arbitrage, and
              build a 30-60-90 day GTM execution blueprint.
            </p>
          </div>

          {/* Preset Suggestion Pills */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Select an example query to launch immediately:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTED_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(promptText);
                    handleStartResearch(promptText);
                  }}
                  disabled={isRunning}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-left shadow-sm disabled:opacity-50"
                >
                  ⚡ {promptText}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Drawer if multiple runs exist */}
      {history.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <History className="w-3.5 h-3.5" /> Previous Runs:
          </span>
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => setCurrentDossier(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                currentDossier?.id === h.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {h.query.slice(0, 32)}...
            </button>
          ))}
        </div>
      )}

      {/* Bottom Sticky Chat & Input Bar */}
      <div className="sticky bottom-4 z-20">
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                rows={2}
                placeholder="Describe your venture, target region, or market entry thesis (e.g. 'We want to launch an eco-resort booking & excursion desk in Maldives and Bali')..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-none disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStartResearch()}
              disabled={isRunning || !inputPrompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[52px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Executing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Run Swarm</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Targeting:</span>
              <span className="font-mono text-cyan-400/90">{llmConfig.model}</span>
              <span>at</span>
              <span className="font-mono text-slate-400 truncate max-w-[200px]">{llmConfig.baseUrl}</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="hover:text-cyan-400 underline transition-colors"
            >
              Configure Endpoint / API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
