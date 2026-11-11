import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const llmBaseUrl = process.env.LLM_BASE_URL || 'http://localhost:11434/v1';
  let llmReachable = false;
  let llmLatencyMs: number | null = null;
  let probeMessage = '';

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    // Probe the models endpoint
    const normalized = llmBaseUrl.replace(/\/+$/, '');
    const probeUrl = `${normalized}/models`;
    const res = await fetch(probeUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    llmLatencyMs = Date.now() - startTime;
    llmReachable = res.ok;
    probeMessage = res.ok ? 'LLM endpoint responsive' : `Endpoint returned HTTP ${res.status}`;
  } catch (err: unknown) {
    llmLatencyMs = Date.now() - startTime;
    probeMessage = err instanceof Error ? err.message : 'Connection refused / offline';
  }

  return NextResponse.json({
    status: 'healthy',
    application: 'DeepMarket Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    organization: {
      author: 'Nile Supplies',
      contact: 'contact@nilesupplies.com',
    },
    llm_runtime: {
      configured_base_url: llmBaseUrl,
      reachable: llmReachable,
      latency_ms: llmLatencyMs,
      diagnostics: probeMessage,
      fallback_engine: 'Synthesized Autonomous Strategic Simulation (Always Available)',
      connection_instructions:
        'When running on Vercel or cloud environments, connect your local Ollama via ngrok (ngrok http 11434) or Cloudflare Tunnel and input the HTTPS URL in Settings.',
    },
  });
}
