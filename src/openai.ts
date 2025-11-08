import { messages } from "./vocab_prompt";

export interface Note {
  modelName: string;
  deckName: string;
  fields: { Front: string, Back: string, Question: string, Ans: string, Audio?: string };
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}


function extractSections(htmlContent: string, prompt: string) {
  const sections: {
    front: string;
    audio: string;
    ans: string;
    back: string
  } = {
    front: '',
    ans: '',
    audio: '',
    back: ''
  };

  // Extract Front section (từ front-section)
  const frontMatch = htmlContent.match(/<div class="front-section">(.*?)<\/div>\s*<div class="back-section">/s);
  if (frontMatch) {
    sections.front = `<div class="front-section">${frontMatch[1]}</div>`;
  }

  // Extract Audio section (từ dialogue)
  const dialogueMatch = htmlContent.match(/<div class="dialogue">(.*?)<\/div>/s);
  if (dialogueMatch) {
    const dialogueContent = dialogueMatch[1];
    let answer = '';

    // Extract text from <p> tags and process for audio
    const pMatches = dialogueContent.match(/<p><strong>.*?<\/strong>(.*?)<\/p>/g);
    if (pMatches) {
      sections.audio = pMatches
        .map(pTag => {
          // Extract text after speaker name
          const textMatch = pTag.match(/<strong>.*?<\/strong>\s*(.*?)<\/p>/);
          if (textMatch) {
            const text = textMatch[1].trim();

            // Clean up any HTML entities and placeholder patterns
            const cleanText = text
              .replace(/{{.*?}}/g, prompt) // Replace placeholders with actual word
              .replace(/&[a-z]+;/gi, '') // Remove HTML entities
              .trim();

            // Extract answer if line contains keyword
            if (cleanText.toLowerCase().includes(prompt.toLowerCase())) {
              answer = cleanText;
            }

            // Add SSML break tag at the end
            return cleanText + ' <break time="0.4s"/>';
          }
          return '';
        })
        .filter(line => line.trim() !== '')
        .join('\n');

      sections.ans = answer;
    }
  }

  // Extract Back section (phần back-section)
  const backMatch = htmlContent.match(/<div class="back-section">(.*?)(?=<style>|$)/s);
  if (backMatch) {
    sections.back = `<div class="back-section">${backMatch[1]}</div>`;
  }

  return sections;
}

export async function suggestAnkiNotes(
  openAIKey: string, { deckName, modelName, prompt }: Options, _notes: Note[]): Promise<any> {
  console.log('-------------- suggestAnkiNotes ----------------');

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      ...messages,
      {
        role: 'user',
        content: prompt,
      }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('OpenAI API request failed');
  const data = await res.json();

  if (!data.choices || !data.choices.length) {
    throw new Error('No completion choices were returned from OpenAI');
  }

  const noteContent = data.choices[0].message.content;
  const sections = extractSections(noteContent, prompt);
  if (sections.audio.length === 0) {
    throw new Error('Audio list is empty! No audio available.');
  }

  const answer: string = sections.ans;
  // Replace placeholders and hide the answer in front section
  const hiddenAnswerAtFront: string = sections.front
    .replace(/{{.*?}}/g, '[...]') // Replace all placeholders with [...]
    .replace(new RegExp(prompt, 'gi'), '[...]'); // Also replace any remaining instances of the word

  console.log(sections);

  return [{
    key: crypto.randomUUID(),
    deckName,
    modelName,
    fields: {
      Front: hiddenAnswerAtFront,
      Question: `{{c1::${answer}}}`,
      Ans: answer,
      Back: sections.back,
      Audio: sections.audio,
    },
    tags: [] // Luôn trả về empty tags
  }];
}

