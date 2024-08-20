interface Note {
  modelName: string;
  deckName: string;
  fields: { Front: string, Back: string };
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

const systemPrompt = (notes: Note[]) => {
  let outstandingCards = notes
    .filter(n => !n.trashed && !n.created)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');
  let trashedCards = notes
    .filter(n => n.trashed)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');
  let createdCards = notes
    .filter(n => n.created)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');

  return `You are an assistant assigned to create Anki cards.
Make cards concise but contextual.

Really, the questions and answers shouldn't be more than a sentence each.

${trashedCards.length > 0 && "The user already rejected these cards:" + trashedCards}

${createdCards.length > 0 && "The user created these cards: " + createdCards}

${outstandingCards.length > 0 && "The user hasn't taken an action on these suggested cards: " + outstandingCards}

Create 5 cards based on user's prompt.

Example:
Front: Which Roman emperor divided the Roman empire?
Back: Diocletian`;
};

const vocabEnglishPrompt = (_notes: Note[]) => {
  return `You are an assistant assigned to create Anki cards.
      Make cards concise but contextual.

      If the user provides a list of words, you will generate a number of tags corresponding to that number of words.
      The list of words can be separated by commas or line breaks.

      X.

      Front:
       ### Từ: **X (loại từ)** (/[phát âm]/)

       - If someone says, *Ví dụ câu sử dụng từ X*, they mean [giải thích ý nghĩa từ trong ngữ cảnh câu].

      Back:
      1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**
        - [Giải thích từ theo từ điển Cambridge].

      2. **Ví dụ:**
        - [Ví dụ câu với từ X]
        - /[phát âm câu]/
        - [Dịch nghĩa câu gốc]

      3. **Từ đồng nghĩa:**
        - [Danh sách các từ đồng nghĩa]

      4. **Nghĩa bằng tiếng Việt:**
        - [Nghĩa của từ trong tiếng Việt]

      5. **Ghi chú:**
        - [Thông tin bổ sung về cách sử dụng từ]

      Example:

      chaotic.

      Front:
      ### Từ: **Chaotic (adj)** ( /keɪˈɒtɪk/ )

      - If someone says, *The traffic was chaotic*, they mean that the traffic was in a state of complete confusion and disorder.

      Back:
      1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**
        - In a state of complete confusion and disorder.

      2. **Ví dụ:**
        - The traffic in the city center was chaotic during rush hour.
        - /ðə ˈtræfɪk ɪn ðə ˈsɪti ˈsɛntər wəz keɪˈɒtɪk ˈdjʊərɪŋ rʌʃ aʊər/
        - Giao thông ở trung tâm thành phố đã hỗn loạn trong giờ cao điểm.

      3. **Từ đồng nghĩa:**
        - Disorderly, disorganized, tumultuous

      4. **Nghĩa bằng tiếng Việt:**
        - Hỗn loạn, lộn xộn.

      5. **Ghi chú:**
        - Chaotic" thường được sử dụng để mô tả các tình huống hoặc môi trường thiếu tổ chức, có nhiều sự nhầm lẫn và không theo trật tự nào. Các từ đồng nghĩa như "chaos" và "disorder" là những danh từ dùng để chỉ tình trạng hỗn loạn
      `;
}


interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}

export async function suggestAnkiNotes(
  openAIKey: string,
  { deckName, modelName, prompt, tags }: Options,
  notes: Note[],
): Promise<any> {
  console.log('-------------- suggestAnkiNotes ----------------');

  console.log(openAIKey);

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: vocabEnglishPrompt(notes)
      },
      {
        role: 'user',
        content: prompt,
      }
    ],
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
  let result: any[] = [];

  const regex = /Front:([\s\S]*?)Back:([\s\S]*?)(?=Front|$)/g;
  let match: any;

  const audioRegex = /-\s*\*?(.*?)\*?\.\s*(.*?)(?=\s*[-\n]|$)/s;

  let audios: string[] = []
  while ((match = regex.exec(noteContent)) !== null) {
    const matchAudio = match[1].trim().match(audioRegex);

    if (matchAudio) {
      const sample = matchAudio[1].trim();
      audios.push(sample);
    } else {
      console.log('No match found.');
    }

    result.push({
      Front: match[1].trim(),
      Back: match[2].trim(),
      Audio: audios
    });
  }

  return result.map(fields =>
  ({
    key: crypto.randomUUID(),
    deckName,
    modelName,
    fields,
    tags
  }))
}
