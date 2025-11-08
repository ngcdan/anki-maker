// Enhanced OpenAI Service with user configuration support
import { openaiService } from '../openai/openaiService';
import { SuggestOptions, Note } from '../../types';
import { selectOptimalModel, estimateTokens } from '../../constants/aiConfig';
import { messages } from '../../vocab_prompt';
import { optimizedMessages } from '../../vocab_prompt_optimized';
import { responseCache } from '../../utils/responseCache';
import { logPerformance } from '../../constants/performance';

interface EnhancedSuggestOptions extends SuggestOptions {
  // User preferences
  preferredModel?: 'TURBO' | 'MINI' | 'GPT4' | 'AUTO';
  enableCaching?: boolean;
  enableStreaming?: boolean;
  useOptimizedPrompts?: boolean;
  enablePerformanceLogging?: boolean;
}

class EnhancedOpenAIService {
  async suggestAnkiNotes(
    openAIKey: string,
    options: EnhancedSuggestOptions,
    notes: Note[]
  ): Promise<Note[]> {
    const startTime = Date.now();
    const {
      deckName,
      modelName,
      tags,
      prompt,
      preferredModel = 'AUTO',
      enableCaching = true,
      useOptimizedPrompts = true,
      enablePerformanceLogging = true,
    } = options;

    try {
      // Select messages based on user preference
      const selectedMessages = useOptimizedPrompts ? optimizedMessages : messages;
      const promptTokens = estimateTokens(prompt + JSON.stringify(selectedMessages));

      // Model selection logic
      let selectedModel;
      if (preferredModel === 'AUTO') {
        // Auto-select based on complexity
        const complexity = promptTokens > 1000 ? 'complex' : promptTokens > 500 ? 'medium' : 'simple';
        selectedModel = selectOptimalModel(complexity);
      } else {
        // Use user preference
        const modelMap = {
          TURBO: selectOptimalModel('simple'),
          MINI: selectOptimalModel('medium'),
          GPT4: selectOptimalModel('complex'),
        };
        selectedModel = modelMap[preferredModel];
      }

      if (enablePerformanceLogging) {
        console.log(`🚀 Enhanced AI Service: ${selectedModel.name} (${preferredModel} mode, ${promptTokens} tokens)`);
      }

      // Check cache if enabled
      if (enableCaching) {
        const cachedResponse = responseCache.get(prompt, selectedModel.name);
        if (cachedResponse) {
          const duration = Date.now() - startTime;
          if (enablePerformanceLogging) {
            logPerformance('Card Generation', duration, { input: promptTokens, output: 0 }, selectedModel.name, true);
          }
          return this.extractNotesFromContent(cachedResponse.choices[0].message.content, {
            deckName,
            modelName,
            tags,
            prompt,
          });
        }
      }

      // Make API request using original service
      const result = await openaiService.suggestAnkiNotes(openAIKey, {
        deckName,
        modelName,
        tags,
        prompt,
      }, notes);

      const duration = Date.now() - startTime;
      if (enablePerformanceLogging) {
        const outputTokens = estimateTokens(JSON.stringify(result));
        logPerformance('Card Generation', duration, { input: promptTokens, output: outputTokens }, selectedModel.name, false);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (enablePerformanceLogging) {
        console.error(`❌ AI Service failed (${duration}ms):`, error);
      }
      throw error;
    }
  }

  // Streaming version with user configuration
  async *suggestAnkiNotesStream(
    openAIKey: string,
    options: EnhancedSuggestOptions,
    notes: Note[]
  ): AsyncGenerator<{ content: string; isComplete: boolean; note?: Note[] }> {
    const { enableStreaming = true } = options;

    if (!enableStreaming) {
      // Fall back to regular method if streaming disabled
      const result = await this.suggestAnkiNotes(openAIKey, options, notes);
      yield {
        content: JSON.stringify(result),
        isComplete: true,
        note: result,
      };
      return;
    }

    // Use streaming from original service
    yield* openaiService.suggestAnkiNotesStream(openAIKey, options, notes);
  }

  private extractNotesFromContent(content: string, options: SuggestOptions): Note[] {
    // Use the same extraction logic as the original service
    const sections = openaiService['extractSections'](content, options.prompt);
    return openaiService['buildNoteFromSections'](sections, options);
  }

  // Get performance statistics
  getStats() {
    return {
      cache: responseCache.getStats(),
      // Could add more metrics here
    };
  }

  // Clear cache manually
  clearCache() {
    responseCache.clear();
  }
}

export const enhancedOpenAIService = new EnhancedOpenAIService();