const VOCAB_ENGLISH_SYS = `
You are an assistant tasked with creating Anki cards.

The user provides English words, you create Anki cards for Vietnamese people.

If the user provides a list of words, you will create as many cards as there are words.
The list of words can be separated by commas or line breaks.

The cards must strictly follow the following structure:

\`\`\`
### Front:
  ##### Từ: **X (loại từ)** (/[phát âm]/)
  - If someone says, *Ví dụ câu sử dụng từ X*, they mean [giải thích ý nghĩa từ trong ngữ cảnh câu].

### Audio:
  - If someone says, *Ví dụ câu sử dụng từ X*, they mean [giải thích ý nghĩa từ trong ngữ cảnh câu].
  - [Ví dụ câu với từ X]

### Back:
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
\`\`\
`

const VOCAB_ENGLISH_ASSISTANT_2 = `
### Front:
##### Từ: **Figure (n, v)** /ˈfɪɡjər/  <br/>
  - If someone says, "I can't figure out this problem," they mean that they cannot understand or solve the problem.<br/>

### Audio:
  - If someone says, I can't figure out this problem, they mean that they cannot understand or solve the problem.  <br/>
  - She is an important figure in the company.<br/>

### Back:
  1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**  <br/>
    - **Danh từ (Noun):** A number, especially one that forms part of official statistics or relates to the financial performance of a company.<br/>
    - **Động từ (Verb):** To think or decide that something will happen or is true.<br/>

  2. **Ví dụ:**  <br/>
    - (Noun): She is an important figure in the company.
    - /ʃiː ɪz ən ɪmˈpɔːrtənt ˈfɪɡjər ɪn ðə ˈkʌmpəni/
    - Cô ấy là một nhân vật quan trọng trong công ty.
    <hr/>
    - (Verb):I can't figure out how to use this software.
    - ** /aɪ kænt ˈfɪɡjər aʊt haʊ tə juːz ðɪs ˈsɒftweər/
    - Tôi không thể hiểu cách sử dụng phần mềm này.

  3. **Từ đồng nghĩa:** <br/>
    - **Noun:** Number, statistic, person <br/>
    - **Verb:** Understand, solve, calculate <br/>

  4. **Nghĩa bằng tiếng Việt:** <br/>
    - **Noun:** "Con số, nhân vật" <br/>
    - **Verb:** "Hiểu ra, tìm ra" <br/>

  5. **Ghi chú:** <br/>
    - Từ "figure" có thể được sử dụng như một danh từ để chỉ một con số hoặc một nhân vật quan trọng, và như một động từ để chỉ hành động suy nghĩ, hiểu ra, hoặc tính toán điều gì đó.
`
const VOCAB_ENGLISH_ASSISTANT_3 = `
### Front:
  Từ: **Through (prep/adv)** (/θruː/)  <br/>
  - If someone says, "She walked through the park," they mean that she moved from one side of the park to the other, passing within its area.  <br/>

### Audio:  <br/>
  - If someone says, "She walked through the park," they mean that she moved from one side of the park to the other, passing within its area.  <br/>
  - The train travels through several countries on its route.  <br/>

### Back:
  1. Giải thích bằng tiếng Anh (theo Cambridge Dictionary):  <br/>
    - From one side of something to the other side.  <br/>
    - Continuing in time toward the end of a period.  <br/>

  2. **Ví dụ:**  <br/>
    - The train travels through several countries on its route.  <br/>
    - /ðə treɪn ˈtrævəlz θruː ˈsɛvrəl ˈkʌntriz ɒn ɪts ruːt/  <br/>
    - Tàu hỏa đi qua nhiều quốc gia trên lộ trình của nó.  <br/>

  3. **Từ đồng nghĩa:**  <br/>
    - Danh từ (Noun): Passage, corridor  <br/>
    - Trạng từ (Adverb): Across, throughout  <br/>

  4. **Nghĩa bằng tiếng Việt:**  <br/>
    - Giới từ (Preposition): Qua, xuyên qua.  <br/>
    - Trạng từ (Adverb): Liên tục.  <br/>

  5. **Ghi chú:**  <br/>
    - "Through" có thể được sử dụng để chỉ hành động di chuyển từ một bên của một vật thể, khu vực, hoặc thời gian đến bên kia. Nó cũng có thể diễn tả việc hoàn thành một khoảng thời gian hoặc giai đoạn. Từ này thường được dùng trong các ngữ cảnh liên quan đến chuyển động, hành trình, hoặc thời gian.
`

const VOCAB_ENGLISH_ASSISTANT_4 = `
### Front:
##### Từ: **Contagious (adj)** (/kənˈteɪdʒəs/)

  - If someone says, "The flu is contagious," they mean that the flu can be spread from one person to another.  <br/>

### Audio:
  - If someone says, "The flu is contagious," they mean that the flu can be spread from one person to another.  <br/>
  - Her laughter was contagious, and soon everyone was smiling.  <br/>

### Back:
  1. **Giải thích bằng tiếng Anh (theo Cambridge Dictionary):**  <br/>
    - A disease that can be spread by people to other people.  <br/>

  2. **Ví dụ:**  <br/>
    - Her laughter was contagious, and soon everyone was smiling.  <br/>
    - /hɜːr ˈlæftər wəz kənˈteɪdʒəs, ənd suːn ˈɛvriwʌn wəz ˈsmaɪlɪŋ/  <br/>
    - Nụ cười của cô ấy thật dễ lây lan, và chẳng mấy chốc mọi người đều mỉm cười.  <br/>

  3. **Từ đồng nghĩa:**  <br/>
    - Infectious, transmittable, catchy  <br/>

  4. **Nghĩa bằng tiếng Việt:**  <br/>
    - Lây lan, dễ lây.  <br/>

  5. **Ghi chú:**  <br/>
    - "Contagious" thường được dùng để chỉ các bệnh có thể truyền từ người này sang người khác. Tuy nhiên, từ này cũng có thể được sử dụng để mô tả những cảm xúc hoặc hành động lôi cuốn, như sự hài hước hay niềm vui, mà có thể ảnh hưởng đến người khác một cách tích cực.
`

export const messages: any = [
  {
    role: 'system',
    content: VOCAB_ENGLISH_SYS
  },
  {
    role: 'user',
    content: 'figure',
  },
  {
    role: 'assistant',
    content: VOCAB_ENGLISH_ASSISTANT_2
  },
  {
    role: 'user',
    content: 'figure',
  },
  {
    role: 'assistant',
    content: VOCAB_ENGLISH_ASSISTANT_2
  },
  {
    role: 'user',
    content: 'through',
  },
  {
    role: 'assistant',
    content: VOCAB_ENGLISH_ASSISTANT_3
  },
  {
    role: 'user',
    content: 'contagious',
  },
  {
    role: 'assistant',
    content: VOCAB_ENGLISH_ASSISTANT_4
  },
]
