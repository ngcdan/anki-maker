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


function extractSections(markdown: string, prompt: string) {
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
        const processedLine = line.substring(line.indexOf(':') + 1)
          .trim()

        // Extract answer if line contains keyword
        if (processedLine.toLowerCase().includes(prompt)) {
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

export async function suggestAnkiNotes(
  openAIKey: string, { deckName, modelName, tags, prompt }: Options, _notes: Note[]): Promise<any> {
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
  const hiddenAnswerAtFront: string = sections.front.replace(answer, '[...]');

  console.log(sections);

  return [{
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
    tags
  }];
}

