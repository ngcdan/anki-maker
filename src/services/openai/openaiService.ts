import { ENDPOINTS, ERROR_MESSAGES } from '../../constants';
import { selectOptimalModel, estimateTokens } from '../../constants/aiConfig';
import { logPerformance } from '../../constants/performance';
import { SuggestOptions, Note, ExtractedSections } from '../../types';
import { messages } from '../../vocab_prompt';
import { responseCache } from '../../utils/responseCache';

class OpenAIService {
  // Streaming version for better UX - shows progressive results
  async *suggestAnkiNotesStream(
    openAIKey: string,
    { deckName, modelName, tags, prompt }: SuggestOptions,
    _notes: Note[]
  ): AsyncGenerator<{ content: string; isComplete: boolean; note?: Note[] }> {
    try {
      const promptTokens = estimateTokens(prompt + JSON.stringify(messages));
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

      const selectedMessages = messages;

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

    // Validate required fields
    if (!sections.front && !sections.back) {
      throw new Error('Không thể trích xuất nội dung thẻ từ phản hồi AI');
    }

    const answer: string = sections.ans || '';
    const front = sections.front || 'Nội dung phía trước';
    const hiddenAnswerAtFront: string = answer ? front.replace(answer, '[...]') : front;

    return [
      {
        key: crypto.randomUUID(),
        deckName,
        modelName,
        fields: {
          Front: hiddenAnswerAtFront,
          Ans: answer,
          Back: sections.back || 'Nội dung phía sau',
          Audio: sections.audio || '',
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

    // Extract Front section (between FRONT_START and FRONT_END)
    const frontMatch = markdown.match(/=== FRONT_START ===(.*?)=== FRONT_END ===/s);
    if (frontMatch) {
      sections.front = frontMatch[1].trim();
    }

    // Extract Back section (between BACK_START and BACK_END)
    const backMatch = markdown.match(/=== BACK_START ===(.*?)=== BACK_END ===/s);
    if (backMatch) {
      sections.back = backMatch[1].trim();
    }

    // Extract Audio section (between AUDIO_START and AUDIO_END)
    const audioMatch = markdown.match(/=== AUDIO_START ===(.*?)=== AUDIO_END ===/s);
    if (audioMatch) {
      sections.audio = audioMatch[1].trim();
    }

    // Extract Ans section (between ANS_START and ANS_END)
    const ansMatch = markdown.match(/=== ANS_START ===(.*?)=== ANS_END ===/s);
    if (ansMatch) {
      sections.ans = ansMatch[1].trim();
    }

    // Fallback: extract conversation for audio if AUDIO section not found
    if (!sections.audio && sections.back) {
      const conversationMatch = sections.back.match(/--- CONVERSATION_START ---(.*?)--- CONVERSATION_END ---/s);
      if (conversationMatch) {
        const conversationText = conversationMatch[1];

        // Process audio lines
        sections.audio = conversationText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('- '))
          .map(line => {
            // Remove speaker name and colon (e.g., "Jake: ")
            const colonIndex = line.indexOf(':');
            const processedLine = colonIndex > 0 ? line.substring(colonIndex + 1).trim() : line.substring(2).trim();

            // Add SSML break tag at the end
            return processedLine + ' <break time="0.4s"/>';
          })
          .join('\n');
      }
    }

    // Fallback: extract ans from conversation if ANS section not found
    if (!sections.ans && sections.back) {
      const conversationMatch = sections.back.match(/--- CONVERSATION_START ---(.*?)--- CONVERSATION_END ---/s);
      if (conversationMatch) {
        const conversationText = conversationMatch[1];

        // Find line containing the prompt word
        const lines = conversationText.split('\n').filter(line => line.trim().startsWith('- '));
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          const sentence = colonIndex > 0 ? line.substring(colonIndex + 1).trim() : line.substring(2).trim();

          if (sentence.toLowerCase().includes(prompt.toLowerCase())) {
            sections.ans = sentence;
            break;
          }
        }
      }
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
      const promptTokens = estimateTokens(prompt + JSON.stringify(messages));
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

      // Use original prompt template
      const selectedMessages = messages;

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