import { LLMConfig } from './types';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  baseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.LLM_API_KEY || 'ollama_local',
  model: process.env.DEFAULT_MODEL || 'qwen2.5-coder:7b',
};

/**
 * Robust JSON repair and extractor utility for local/remote LLM outputs.
 * Strips markdown code blocks, trims noisy preambles, and extracts top-level JSON objects.
 */
export function extractAndParseJSON<T = unknown>(rawOutput: string): T {
  if (!rawOutput || typeof rawOutput !== 'string') {
    throw new Error('Empty or invalid output received from LLM');
  }

  let cleaned = rawOutput.trim();

  // Strip ```json ... ``` or ``` ... ``` markdown fences
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // First direct attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Attempt to locate outermost curly braces { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch (err2) {
        // Try fixing common trailing comma syntax issues
        const fixed = candidate
          .replace(/,\s*([}\]])/g, '$1') // remove trailing commas before } or ]
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // quote unquoted keys
        try {
          return JSON.parse(fixed) as T;
        } catch {
          throw new Error(
            `Failed to parse repaired JSON from LLM: ${err2 instanceof Error ? err2.message : String(err2)}`
          );
        }
      }
    }

    // Attempt array brackets [ ... ]
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidateArray = cleaned.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(candidateArray) as T;
      } catch (err3) {
        throw new Error(
          `Failed to parse JSON array from LLM: ${err3 instanceof Error ? err3.message : String(err3)}`
        );
      }
    }

    throw new Error('No valid JSON structure found in LLM response');
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCallResult {
  content: string;
  isFallback: boolean;
  modelUsed: string;
  error?: string;
}

/**
 * Universal OpenAI-compatible chat completion caller.
 * Targets ${baseUrl}/chat/completions with automatic timeout and fallback detection.
 */
export async function callOpenAICompatible(
  messages: ChatMessage[],
  configOverrides?: Partial<LLMConfig>,
  timeoutMs: number = 25000,
  temperature: number = 0.2
): Promise<LLMCallResult> {
  const config: LLMConfig = {
    baseUrl: configOverrides?.baseUrl?.trim() || DEFAULT_LLM_CONFIG.baseUrl,
    apiKey: configOverrides?.apiKey?.trim() || DEFAULT_LLM_CONFIG.apiKey,
    model: configOverrides?.model?.trim() || DEFAULT_LLM_CONFIG.model,
  };

  const normalizedBase = config.baseUrl.replace(/\/+$/, '');
  const endpoint = `${normalizedBase}/chat/completions`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey || 'ollama_local'}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM endpoint responded with HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('LLM response contained no choices or content');
    }

    return {
      content,
      isFallback: false,
      modelUsed: config.model,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      content: '',
      isFallback: true,
      modelUsed: config.model,
      error: errorMsg,
    };
  }
}

/**
 * Direct callLLM helper function.
 */
export async function callLLM(options: {
  system?: string;
  prompt: string;
  temperature?: number;
  config?: Partial<LLMConfig>;
  timeoutMs?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [];
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  messages.push({ role: 'user', content: options.prompt });

  const result = await callOpenAICompatible(
    messages,
    options.config,
    options.timeoutMs || 25000,
    options.temperature !== undefined ? options.temperature : 0.2
  );

  return result.content;
}
