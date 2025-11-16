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

    // Extract Front section (Word + Meaning until ---)
    const frontMatch = markdown.match(/\*\*Word:\*\*.*?\*\*Meaning:\*\*.*?(?=\n---)/s);
    if (frontMatch) {
      sections.front = frontMatch[0].trim();
    }

    // Extract conversation from Analysis section
    const analysisMatch = markdown.match(/\*\*Analysis\*\*([\s\S]*?)(?=- \*\*Meaning in Vietnamese:\*\*)/);
    if (analysisMatch) {
      const analysisContent = analysisMatch[1];
      let answer = '';

      // Find English conversation lines (start with "- " and have speaker format, not Vietnamese translations)
      const conversationLines = analysisContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Include lines that start with "- " and have speaker format but are NOT Vietnamese translations (not wrapped in *)
          return line.startsWith('- ') &&
                 line.includes(':') &&
                 !line.includes('*') && // Not Vietnamese translation
                 line.length > 0;
        });

      // Process audio lines and extract answer
      sections.audio = conversationLines
        .map(line => {
          // Remove leading "- "
          const cleanLine = line.replace(/^-\s*/, '');

          // Extract just the speech part after colon
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex > -1) {
            const speechPart = cleanLine.substring(colonIndex + 1).trim();

            // Extract answer if line contains the prompt keyword
            if (speechPart.toLowerCase().includes(prompt.toLowerCase())) {
              answer = speechPart;
            }

            // Add pause after each sentence
            return speechPart + ' <break time="1s"/>';
          }
          return cleanLine + ' <break time="1s"/>';
        })
        .join('\n');

      sections.ans = answer;
    }

    // Extract Back section (full Analysis section)
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