import { ENDPOINTS, ERROR_MESSAGES } from '../../constants';
import { SuggestOptions, Note, ExtractedSections } from '../../types';
import { messages } from '../../vocab_prompt';
import { PromptConfig } from '../../config/promptConfigs';
import { getFormatFunctions } from '../../utils/cardFormatters';

class OpenAIService {
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
    try {
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          ...messages,
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

      const noteContent = data.choices[0].message.content;
      const sections = this.extractSections(noteContent, prompt);

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
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Generate cards using configurable prompt system
   */
  async generateCardsWithConfig(options: SuggestOptions, config: PromptConfig): Promise<Note[]> {
    const { deckName, modelName, prompt, tags } = options;

    // Create dynamic messages based on config
    const configMessages = [
      {
        role: 'system' as const,
        content: config.systemPrompt
      },
      {
        role: 'user' as const,
        content: config.exampleCard
      },
      {
        role: 'assistant' as const,
        content: config.exampleCard
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const rawKey = localStorage.getItem('openAIKey') ?? '';
    // Clean the key: trim, remove quotes, remove extra spaces
    const openaiKey = rawKey.trim().replace(/^["']|["']$/g, '');
    if (!openaiKey) {
      throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
    }

    try {
      const response = await fetch(ENDPOINTS.OPENAI_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: configMessages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse response based on config format
      const sections = this.extractConfigSections(content, config);

      // Use config-specific formatting functions
      const formatFunctions = getFormatFunctions(config);
      const styledFront = formatFunctions.front(sections.front);
      const styledBack = formatFunctions.back(sections.back);

      return [{
        key: crypto.randomUUID(),
        deckName,
        modelName,
        fields: {
          Front: styledFront,
          Question: styledFront,
          Ans: sections.ans || sections.back,
          Back: styledBack,
          Audio: sections.audio || '',
        },
        tags: [...tags, config.id, config.cardType]
      }];

    } catch (error) {
      throw error;
    }
  }

  /**
   * Extract sections based on prompt config format
   */
  private extractConfigSections(content: string, config: PromptConfig): ExtractedSections {
    const sections: ExtractedSections = {
      front: '',
      back: '',
      ans: '',
      audio: ''
    };

    // Split by **FRONT** and **BACK** markers
    const frontMatch = content.match(/\*\*FRONT\*\*\n([\s\S]*?)(?=\n\*\*BACK\*\*)/);
    const backMatch = content.match(/\*\*BACK\*\*\n([\s\S]*?)$/);

    sections.front = frontMatch ? frontMatch[1].trim() : content;
    sections.back = backMatch ? backMatch[1].trim() : content;

    // Extract answer based on config type
    if (config.cardType === 'conversation') {
      const ansMatch = sections.back.match(/🗣️\s*Trả lời ngay:\s*([^\n]+)/);
      sections.ans = ansMatch ? ansMatch[1].trim() : '';
    } else if (config.cardType === 'typing') {
      const ansMatch = sections.back.match(/✅\s*Câu đúng nhất:\s*([^\n]+)/);
      sections.ans = ansMatch ? ansMatch[1].trim() : '';
    } else if (config.cardType === 'sentence-building') {
      const ansMatch = sections.back.match(/🇺🇸\s*English:\s*([^\n]+)/);
      sections.ans = ansMatch ? ansMatch[1].trim() : '';
    }

    // For typing practice, extract audio hint
    if (config.cardType === 'typing') {
      const audioMatch = sections.front.match(/🎧\s*Bạn nghe:\s*["""]([^"""]+)["""]/);
      sections.audio = audioMatch ? audioMatch[1].trim() : '';
    }

    return sections;
  }
}

export const openaiService = new OpenAIService();