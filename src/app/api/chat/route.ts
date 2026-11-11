import { NextRequest } from 'next/server';
import { runOrchestrator } from '@/lib/agents/orchestrator';
import { runGeoDemandAgent } from '@/lib/agents/geo-demand';
import { runSEOKeywordsAgent } from '@/lib/agents/seo-keywords';
import { runCompetitorGapsAgent } from '@/lib/agents/competitor-gaps';
import { runGTMStrategistAgent } from '@/lib/agents/gtm-strategist';
import { ExecutiveDossier, LLMConfig, StreamPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').trim();
    const config: Partial<LLMConfig> = body.config || {};

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: StreamPayload) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          // STEP 1: Orchestrator
          send({
            type: 'step',
            step: 1,
            totalSteps: 5,
            agent: 'orchestrator',
            status: 'running',
            message: 'Orchestrator: Parsing objective and planning research graph...',
          });

          const orchResult = await runOrchestrator(prompt, config);

          send({
            type: 'agent_update',
            step: 1,
            totalSteps: 5,
            agent: 'orchestrator',
            status: 'completed',
            message: `Identified Vertical: "${orchResult.entities.industry}" across ${orchResult.entities.geographies.join(', ')}`,
          });

          // STEP 2: Geo Scout
          send({
            type: 'step',
            step: 2,
            totalSteps: 5,
            agent: 'geo',
            status: 'running',
            message: 'Geo Scout: Analyzing regional demand & market size...',
          });

          const geoResult = await runGeoDemandAgent(prompt, orchResult.entities, config);

          send({
            type: 'agent_update',
            step: 2,
            totalSteps: 5,
            agent: 'geo',
            status: 'completed',
            message: `Regional TAM mapped at ${geoResult.artifact.tam_sam_som.tam.slice(0, 40)}...`,
          });

          // STEP 3: SEO Planner
          send({
            type: 'step',
            step: 3,
            totalSteps: 5,
            agent: 'seo',
            status: 'running',
            message: 'SEO Planner: Mapping intent clusters & keyword arbitrage...',
          });

          const seoResult = await runSEOKeywordsAgent(prompt, orchResult.entities, config);

          send({
            type: 'agent_update',
            step: 3,
            totalSteps: 5,
            agent: 'seo',
            status: 'completed',
            message: `Isolated ${seoResult.artifact.long_tail_clusters.length} high-intent search clusters and programmatic URL patterns.`,
          });

          // STEP 4: Gap Hunter
          send({
            type: 'step',
            step: 4,
            totalSteps: 5,
            agent: 'competitor',
            status: 'running',
            message: 'Gap Hunter: Reverse-engineering competitors...',
          });

          const compResult = await runCompetitorGapsAgent(prompt, orchResult.entities, config);

          send({
            type: 'agent_update',
            step: 4,
            totalSteps: 5,
            agent: 'competitor',
            status: 'completed',
            message: `Deconstructed ${compResult.artifact.top_competitors.length} incumbents and isolated pricing moats.`,
          });

          // STEP 5: GTM Strategist
          send({
            type: 'step',
            step: 5,
            totalSteps: 5,
            agent: 'gtm',
            status: 'running',
            message: 'GTM Strategist: Formulating 30-60-90 day playbook...',
          });

          const gtmResult = await runGTMStrategistAgent(
            prompt,
            orchResult.entities,
            geoResult.artifact,
            seoResult.artifact,
            compResult.artifact,
            config
          );

          send({
            type: 'agent_update',
            step: 5,
            totalSteps: 5,
            agent: 'gtm',
            status: 'completed',
            message: 'Synthesized 30-60-90 day executable market entry roadmap.',
          });

          // Synthesize full dossier
          const anyFallback =
            orchResult.isFallback ||
            geoResult.isFallback ||
            seoResult.isFallback ||
            compResult.isFallback ||
            gtmResult.isFallback;

          const dossier: ExecutiveDossier = {
            id: `dossier-${Date.now()}`,
            query: prompt,
            timestamp: new Date().toISOString(),
            entities: orchResult.entities,
            executive_metrics: gtmResult.metrics,
            geo_demand: geoResult.artifact,
            seo_keywords: seoResult.artifact,
            competitor_gaps: compResult.artifact,
            gtm_strategy: gtmResult.artifact,
            generation_mode: anyFallback ? 'synthesized-simulation' : 'live-llm',
            llm_model: gtmResult.modelUsed,
          };

          send({
            type: 'dossier_ready',
            dossier,
            message: 'Executive Intelligence Dossier successfully generated.',
          });

          controller.close();
        } catch (streamErr: unknown) {
          const errMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
          send({
            type: 'error',
            error: `Agent pipeline encountered an error: ${errMsg}`,
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
