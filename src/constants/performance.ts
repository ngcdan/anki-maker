// Performance monitoring and optimization metrics
export const PERFORMANCE_CONFIG = {
  // Response time thresholds (ms)
  thresholds: {
    fast: 2000,      // Under 2s = fast
    acceptable: 5000, // Under 5s = acceptable
    slow: 10000,     // Over 10s = slow
  },

  // Token usage tracking
  tokenLimits: {
    inputWarning: 2000,    // Warn if input > 2k tokens
    outputMax: 3000,       // Max output tokens
    costAlert: 0.05,       // Alert if cost > $0.05 per request
  },

  // Cache effectiveness metrics
  cacheMetrics: {
    targetHitRate: 0.3,    // 30% cache hit rate target
    maxCacheSize: 100,     // Max cached responses
    ttl: 3600000,          // 1 hour TTL
  },
} as const;

// Model cost per 1k tokens (as of Nov 2024)
export const MODEL_COSTS = {
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o-mini-2024-07-18': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
} as const;

// Calculate estimated cost
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  modelName: string
): number {
  const costs = MODEL_COSTS[modelName as keyof typeof MODEL_COSTS];
  if (!costs) return 0;

  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}

// Performance logger
export function logPerformance(
  operation: string,
  duration: number,
  tokens: { input: number; output: number },
  modelName: string,
  cached: boolean = false
) {
  const cost = estimateCost(tokens.input, tokens.output, modelName);
  const status = duration < PERFORMANCE_CONFIG.thresholds.fast ? '🚀' :
    duration < PERFORMANCE_CONFIG.thresholds.acceptable ? '⚡' : '🐌';

  console.log(`${status} ${operation}:`, {
    duration: `${duration}ms`,
    tokens: `${tokens.input + tokens.output} total`,
    cost: `$${cost.toFixed(4)}`,
    model: modelName,
    cached: cached ? '💾' : '🌐'
  });
}