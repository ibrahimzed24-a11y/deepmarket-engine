'use client';

import React from 'react';
import { AgentState, AgentStatus } from '@/lib/types';
import { Compass, Search, Target, Rocket, Cpu, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface Props {
  state: AgentState;
  currentStep: number;
  totalSteps: number;
}

interface AgentCardConfig {
  key: keyof AgentState;
  title: string;
  role: string;
  icon: React.ElementType;
}

const AGENTS: AgentCardConfig[] = [
  {
    key: 'orchestrator',
    title: 'Orchestrator',
    role: 'Decomposition & Plan',
    icon: Cpu,
  },
  {
    key: 'geo',
    title: 'Geo & Demand Scout',
    role: 'TAM/SAM/SOM & Rails',
    icon: Compass,
  },
  {
    key: 'seo',
    title: 'SEO Planner',
    role: 'Search Intent & Gaps',
    icon: Search,
  },
  {
    key: 'competitor',
    title: 'Gap Hunter',
    role: 'Incumbent Teardown',
    icon: Target,
  },
  {
    key: 'gtm',
    title: 'GTM Strategist',
    role: 'Unit Economics & 30-60-90',
    icon: Rocket,
  },
];

export default function AgentWorkflowVisualizer({ state }: Props) {
  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3" />
            Waiting
          </span>
        );
    }
  };

  const getCardBorder = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.25)] bg-slate-900/90 ring-1 ring-cyan-500/40';
      case 'completed':
        return 'border-emerald-500/40 bg-slate-900/60';
      case 'error':
        return 'border-rose-500/40 bg-slate-900/60';
      default:
        return 'border-slate-800/80 bg-slate-950/60 opacity-70 hover:opacity-100';
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AGENTS.map((agent) => {
          const info = state[agent.key];
          const Icon = agent.icon;
          const status = info?.status || 'idle';

          return (
            <div
              key={agent.key}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 backdrop-blur-sm ${getCardBorder(
                status
              )}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    status === 'running'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {getStatusBadge(status)}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-100 tracking-tight">{agent.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{agent.role}</p>
              </div>

              {info?.message && (
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic border-t border-slate-800/70 pt-1.5">
                  &ldquo;{info.message}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
