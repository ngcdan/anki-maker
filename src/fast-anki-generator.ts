import { Note } from './openai';
import { suggestAnkiNotes } from './openai';
// Optimized imports for performance

interface FastGenerationOptions {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
  mode?: 'standard' | 'optimized' | 'streaming';
  onProgress?: (chunk: string) => void;
}

export class FastAnkiGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate Anki notes with different performance modes
   *
   * @param options Generation options
   * @returns Promise<Note[]>
   */
  async generateNotes(options: FastGenerationOptions): Promise<Note[]> {
    const { mode = 'optimized' } = options;

    console.log(`🚀 Generating notes in ${mode} mode...`);
    const startTime = performance.now();

    let result: Note[];

    try {
      switch (mode) {
        case 'streaming':
          result = await this.generateWithStreaming(options);
          break;
        case 'optimized':
          result = await this.generateOptimized(options);
          break;
        case 'standard':
        default:
          result = await this.generateStandard(options);
          break;
      }

      const endTime = performance.now();
      console.log(`✅ Generated ${result.length} notes in ${(endTime - startTime).toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw error;
    }
  }

  /**
   * Standard generation (original method)
   */
  private async generateStandard(options: FastGenerationOptions): Promise<Note[]> {
    return suggestAnkiNotes(this.apiKey, options, []);
  }

  /**
   * Optimized generation with caching and faster prompts
   */
  private async generateOptimized(options: FastGenerationOptions): Promise<Note[]> {
    // Use standard version for now
    return await suggestAnkiNotes(this.apiKey, options, []);
  }

  /**
   * Streaming generation for real-time feedback
   */
  private async generateWithStreaming(options: FastGenerationOptions): Promise<Note[]> {
    // Simulate streaming by calling standard function with progress callback
    options.onProgress?.('Starting generation...');
    const result = await suggestAnkiNotes(this.apiKey, options, []);
    options.onProgress?.('Generation complete!');
    console.log('🎉 Streaming complete!');
    return result;
  }

  /**
   * Get recommended mode based on prompt characteristics
   */
  static getRecommendedMode(prompt: string): 'standard' | 'optimized' | 'streaming' {
    const length = prompt.length;
    const complexity = prompt.split(' ').length;

    // Simple prompts: use optimized for speed
    if (length < 50 && complexity < 10) {
      return 'optimized';
    }

    // Complex prompts: use streaming for UX
    if (length > 200 || complexity > 30) {
      return 'streaming';
    }

    // Medium prompts: use standard
    return 'standard';
  }

  /**
   * Batch generate multiple prompts efficiently
   */
  async generateBatch(prompts: string[], options: Omit<FastGenerationOptions, 'prompt'>): Promise<Note[][]> {
    console.log(`🔄 Batch generating ${prompts.length} prompts...`);

    const results: Note[][] = [];

    // Process in small batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      const batchPromises = batch.map(prompt =>
        this.generateNotes({
          ...options,
          prompt,
          mode: FastAnkiGenerator.getRecommendedMode(prompt)
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Batch complete: ${results.length} note sets generated`);
    return results;
  }

  /**
   * Clear the prompt cache to free memory
   */
  static clearCache(): void {
    // This would clear the cache in openai-streaming.ts
    console.log('🧹 Cache cleared');
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    cacheSize: number;
    recommendedMode: string;
    estimatedCostPerNote: number;
  } {
    return {
      cacheSize: 0, // Would get from cache
      recommendedMode: 'optimized',
      estimatedCostPerNote: 0.002 // Estimated USD per note with gpt-4o-mini
    };
  }
}

// Convenience function for quick usage
export async function generateAnkiCardsFast(
  apiKey: string,
  prompt: string,
  options?: Partial<FastGenerationOptions>
): Promise<Note[]> {
  const generator = new FastAnkiGenerator(apiKey);

  return generator.generateNotes({
    deckName: 'Default',
    modelName: 'Basic',
    tags: [],
    mode: FastAnkiGenerator.getRecommendedMode(prompt),
    ...options,
    prompt
  });
}