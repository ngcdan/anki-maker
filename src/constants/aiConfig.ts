// AI Configuration for optimal performance and cost efficiency
export const AI_CONFIG = {
  // Model configuration - optimized for speed and cost
  models: {
    // Fastest and cheapest for simple card generation
    TURBO: {
      name: 'gpt-3.5-turbo',
      maxTokens: 1500,
      temperature: 0.7,
      cost: 'lowest',
      speed: 'fastest',
    },
    // Balanced performance for complex vocabulary cards
    MINI: {
      name: 'gpt-4o-mini-2024-07-18',
      maxTokens: 2000,
      temperature: 0.8,
      cost: 'low',
      speed: 'fast',
    },
    // High quality for complex content
    GPT4: {
      name: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.7,
      cost: 'high',
      speed: 'slow',
    },
  },

  // Default model based on use case
  defaultModel: 'MINI', // Best balance of quality/speed/cost for vocabulary cards

  // Performance optimizations
  streaming: {
    enabled: true,
    chunkSize: 100, // Process in chunks for better UX
  },

  // Request optimization
  request: {
    timeout: 30000, // 30s timeout
    retries: 3,
    backoffMs: 1000,
  },

  // Caching configuration
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour TTL for similar prompts
    maxSize: 100, // Cache up to 100 responses
  },

  // Batch processing
  batch: {
    maxSize: 5, // Process up to 5 cards at once
    delayMs: 500, // Delay between batch requests
  },
} as const;

// Model selection helper
export function selectOptimalModel(complexity: 'simple' | 'medium' | 'complex' = 'medium') {
  switch (complexity) {
    case 'simple':
      return AI_CONFIG.models.TURBO;
    case 'complex':
      return AI_CONFIG.models.GPT4;
    default:
      return AI_CONFIG.models.MINI;
  }
}

// Token estimation helper (rough estimate)
export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}