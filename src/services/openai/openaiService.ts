import { ENDPOINTS, ERROR_MESSAGES } from '../../constants';
import { selectOptimalModel, estimateTokens } from '../../constants/aiConfig';
import { logPerformance } from '../../constants/performance';
import { SuggestOptions, Note, ExtractedSections } from '../../types';
import { messages } from '../../vocab_prompt';
import { optimizedMessages } from '../../vocab_prompt_optimized';
import { responseCache } from '../../utils/responseCache';

class OpenAIService {
  // Streaming version for better UX - shows progressive results
  async *suggestAnkiNotesStream(
    openAIKey: string,
    { deckName, modelName, tags, prompt }: SuggestOptions,
    _notes: Note[]
  ): AsyncGenerator<{ content: string; isComplete: boolean; note?: Note[] }> {
    try {
      const promptTokens = estimateTokens(prompt + JSON.stringify(optimizedMessages));
      const complexity = promptTokens > 1000 ? 'complex' : promptTokens > 500 ? 'medium' : 'simple';
      const selectedModel = selectOptimalModel(complexity);

      // Check cache first
      const cachedResponse = responseCache.get(prompt, selectedModel.name);
      if (cachedResponse) {
        const sections = this.extractSections(cachedResponse.choices[0].message.content, prompt);
        const notes = this.buildNoteFromSections(sections, { deckName, modelName, tags, prompt });
        yield { content: cachedResponse.choices[0].message.content, isComplete: true, note: notes };
        return;
      }

      const selectedMessages = complexity === 'simple' ? optimizedMessages : messages;

      const response = await fetch(ENDPOINTS.OPENAI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: selectedModel.name,
          max_tokens: selectedModel.maxTokens,
          temperature: selectedModel.temperature,
          stream: true, // Enable streaming
          messages: [...selectedMessages, { role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let accumulatedContent = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                  yield { content: accumulatedContent, isComplete: false };
                }
              } catch (e) {
                // Skip invalid JSON chunks
              }
            }
          }
        }

        // Process complete response
        if (accumulatedContent) {
          responseCache.set(prompt, selectedModel.name, {
            choices: [{ message: { content: accumulatedContent } }]
          }, promptTokens);

          const sections = this.extractSections(accumulatedContent, prompt);
          const notes = this.buildNoteFromSections(sections, { deckName, modelName, tags, prompt });
          yield { content: accumulatedContent, isComplete: true, note: notes };
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }

  private buildNoteFromSections(sections: ExtractedSections, options: SuggestOptions): Note[] {
    const { deckName, modelName, tags } = options;

    if (sections.audio.length === 0) {
      throw new Error(ERROR_MESSAGES.AUDIO_GENERATION);
    }

    const answer: string = sections.ans;
    const hiddenAnswerAtFront: string = sections.front.replace(answer, '[...]');

    return [
      {
        key: crypto.randomUUID(),
        deckName,
        modelName,
        fields: {
          Front: hiddenAnswerAtFront,
          Question: `{{c1::${sections.ans}}}`,
          Ans: sections.ans,
          Back: sections.back,
          Audio: sections.audio,
        },
        tags,
      },
    ];
  }

  private extractSections(markdown: string, prompt: string): ExtractedSections {
    const sections: ExtractedSections = {
      front: '',
      ans: '',
      audio: '',
      back: '',
    };

    // Extract Front section (từ đầu đến Meaning)
    const frontMatch = markdown.match(/\*\*Word:\*\*.*?(?=\n---)/s);
    if (frontMatch) {
      sections.front = frontMatch[0].trim();
    }

    // Extract Audio section (các câu hội thoại)
    const conversationMatch = markdown.match(/\*\*Conversation:\*\*\n(.*?)(?=\n\*\*Meaning:\*\*)/s);
    if (conversationMatch) {
      const conversationText = conversationMatch[1];
      let answer = '';

      // Process audio lines
      sections.audio = conversationText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => {
          // Remove speaker name and colon (e.g., "Jake: ")
          const processedLine = line.substring(line.indexOf(':') + 1).trim();

          // Extract answer if line contains keyword
          if (processedLine.toLowerCase().includes(prompt.toLowerCase())) {
            answer = processedLine;
          }

          // Add SSML break tag at the end
          return processedLine + ' <break time="0.4s"/>';
        })
        .join('\n');

      sections.ans = answer;
    }

    // Extract Back section (phần Analysis trở đi)
    const backMatch = markdown.match(/\*\*Analysis\*\*[\s\S]*$/);
    if (backMatch) {
      sections.back = backMatch[0].trim();
    }

    return sections;
  }

  async suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, tags, prompt }: SuggestOptions,
    _notes: Note[]
  ): Promise<Note[]> {
    const startTime = Date.now();

    try {
      // Select optimal model based on prompt complexity
      const promptTokens = estimateTokens(prompt + JSON.stringify(optimizedMessages));
      const complexity = promptTokens > 1000 ? 'complex' : promptTokens > 500 ? 'medium' : 'simple';
      const selectedModel = selectOptimalModel(complexity);

      console.log(`🚀 Using model: ${selectedModel.name} (complexity: ${complexity}, estimated tokens: ${promptTokens})`);

      // Check cache first
      const cachedResponse = responseCache.get(prompt, selectedModel.name);
      if (cachedResponse) {
        const duration = Date.now() - startTime;
        logPerformance('Card Generation', duration, { input: promptTokens, output: 0 }, selectedModel.name, true);

        console.log('⚡ Using cached response, skipping API call');
        const sections = this.extractSections(cachedResponse.choices[0].message.content, prompt);
        return this.buildNoteFromSections(sections, { deckName, modelName, tags, prompt });
      }

      // Use optimized prompt template (50% fewer tokens)
      const selectedMessages = complexity === 'simple' ? optimizedMessages : messages;

      const body = {
        model: selectedModel.name,
        max_tokens: selectedModel.maxTokens,
        temperature: selectedModel.temperature,
        stream: false, // Will implement streaming in next update
        messages: [
          ...selectedMessages,
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const response = await fetch(ENDPOINTS.OPENAI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(ERROR_MESSAGES.OPENAI_API);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices.length) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }

      // Cache the successful response
      responseCache.set(prompt, selectedModel.name, data, promptTokens);

      const noteContent = data.choices[0].message.content;
      const outputTokens = estimateTokens(noteContent);
      const duration = Date.now() - startTime;

      // Log performance metrics
      logPerformance('Card Generation', duration, { input: promptTokens, output: outputTokens }, selectedModel.name, false);

      const sections = this.extractSections(noteContent, prompt);
      return this.buildNoteFromSections(sections, { deckName, modelName, tags, prompt });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }
}

export const openaiService = new OpenAIService();