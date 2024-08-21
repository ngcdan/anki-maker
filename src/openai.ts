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

      -----------------------

      figure

      Front:
      ### Từ: **Figure (n, v)** /ˈfɪɡjər/

        - If someone says, "I can't figure out this problem," they mean that they cannot understand or solve the problem.

      Back:
      1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**
        - **Danh từ (Noun):** "A number, especially one that forms part of official statistics or relates to the financial performance of a company."
        - **Động từ (Verb):** "To think or decide that something will happen or is true."

      2. **Ví dụ:**
        - (Noun): She is an important figure in the company.
        - /ʃiː ɪz ən ɪmˈpɔːrtənt ˈfɪɡjər ɪn ðə ˈkʌmpəni/
        - Cô ấy là một nhân vật quan trọng trong công ty.

        - (Verb):I can't figure out how to use this software.
        - ** /aɪ kænt ˈfɪɡjər aʊt haʊ tə juːz ðɪs ˈsɒftweər/
        - Tôi không thể hiểu cách sử dụng phần mềm này.

      3. **Từ đồng nghĩa:**
        - **Noun:** Number, statistic, person
        - **Verb:** Understand, solve, calculate

      4. **Nghĩa bằng tiếng Việt:**
        - **Noun:** "Con số, nhân vật"
        - **Verb:** "Hiểu ra, tìm ra"

      5. **Ghi chú:**
        - Từ "figure" có thể được sử dụng như một danh từ để chỉ một con số hoặc một nhân vật quan trọng, và như một động từ để chỉ hành động suy nghĩ, hiểu ra, hoặc tính toán điều gì đó.

            Dưới đây là cấu trúc thẻ Anki cho từ "through":

      Front:
      ### Từ: **Through (prep/adv)** (/θruː/)

      - If someone says, "She walked through the park," they mean that she moved from one side of the park to the other, passing within its area.

      Back:
      1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**
        - From one side of something to the other side.
        - Continuing in time toward the end of a period.

      2. **Ví dụ:**
        - The train travels through several countries on its route.
        - /ðə treɪn ˈtrævəlz θruː ˈsɛvrəl ˈkʌntriz ɒn ɪts ruːt/
        - Tàu hỏa đi qua nhiều quốc gia trên lộ trình của nó.

      3. **Từ đồng nghĩa:**
        - Danh từ (Noun): Passage, corridor
        - Trạng từ (Adverb): Across, throughout

      4. **Nghĩa bằng tiếng Việt:**
        - Giới từ (Preposition): Qua, xuyên qua.
        - Trạng từ (Adverb): Liên tục.

      5. **Ghi chú:**
        - "Through" có thể được sử dụng để chỉ hành động di chuyển từ một bên của một vật thể, khu vực, hoặc thời gian đến bên kia. Nó cũng có thể diễn tả việc hoàn thành một khoảng thời gian hoặc giai đoạn. Từ này thường được dùng trong các ngữ cảnh liên quan đến chuyển động, hành trình, hoặc thời gian.
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
