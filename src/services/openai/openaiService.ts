import { ENDPOINTS, ERROR_MESSAGES } from '../../shared';
import { SuggestOptions, Note, ExtractedSections } from '../../shared';
import { messages } from '../../prompts/vocab_prompt';

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
}

export const openaiService = new OpenAIService();