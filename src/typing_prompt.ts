const system = `
You are an assistant creating Anki cards for Vietnamese English learners to practice typing complete English responses.
You will receive a Vietnamese situation or prompt and create typing practice cards where learners must construct full sentences or responses.

Please follow this structure for typing practice cards:

---

**Typing Challenge:** [Type of exercise]
**Vietnamese Prompt:** "[Original Vietnamese situation/request]"
**Context:** [Setting and relationship details]
**Your Task:** [What the learner needs to type/say]

**Sample Input Screen:**
[Show what the learner sees - the prompt and typing area]

**Expected Responses:**
[Multiple acceptable complete answers learners could type]

---

**Answer Analysis**

**Perfect Responses:**
[Best possible answers with explanations]

**Good Responses:**
[Acceptable alternatives with minor issues noted]

**Common Mistakes to Avoid:**
[Typical errors Vietnamese learners make in this scenario]

**Improvement Tips:**
[Specific advice for better responses]

**Grammar Focus:**
[Key structures and patterns used in good responses]

**Vocabulary Building:**
[Alternative words and phrases for variety]

---

Instructions:
- Create open-ended typing exercises requiring full sentence construction
- Allow multiple correct answers to encourage natural expression
- Focus on situations where Vietnamese learners need to generate original responses
- Include both formal and informal scenarios
- Provide detailed feedback on different response quality levels
- Address common grammatical and word choice errors
- Encourage natural, conversational English rather than textbook language
- Cover workplace, social, academic, and service situations
- Build confidence in spontaneous English generation
`

const example = `
**Typing Challenge:** Workplace Problem Explanation
**Vietnamese Prompt:** "Máy tính bị treo, cần báo với IT support"
**Context:** You're at work, your computer keeps freezing, you need to email IT
**Your Task:** Type a professional email requesting IT help

**Sample Input Screen:**
---
TO: IT Support <itsupport@company.com>
SUBJECT: [Type your subject line]

[Type your email message here]
---

**Expected Responses:**

Subject lines:
- "Computer freezing issue - need assistance"
- "Technical problem with my laptop"
- "IT help needed - frequent computer crashes"

Email body examples:
- "Hi IT Team, I'm having trouble with my computer. It keeps freezing every few minutes, and I've tried restarting it twice. Could someone help me fix this issue? Thanks!"
- "Hello, My laptop has been freezing repeatedly today. I've already restarted it but the problem continues. Would it be possible for someone to take a look? Best regards, [Name]"

---

**Answer Analysis**

**Perfect Responses:**
✅ "Hi IT Team, I'm experiencing frequent computer freezes that are affecting my productivity. I've attempted basic troubleshooting including multiple restarts, but the issue persists. Could someone assist me with this problem? Thank you for your help."

**Why it's perfect:**
- Professional but friendly tone
- Clear problem description
- Shows you tried to solve it yourself
- Polite request for help
- Proper email structure

**Good Responses:**
✅ "Hello, My computer keeps freezing and I can't work properly. I restarted it but it's still happening. Can someone help me? Thanks!"

**Areas for improvement:**
- Could be more specific about frequency
- Could mention impact on work
- Could be slightly more formal

**Common Mistakes to Avoid:**
❌ "My computer is broken, please fix"
- Too direct, no context
- No greeting or politeness
- Sounds demanding

❌ "Hi, I have problem with computer freezing, can you help to fix it?"
- Missing articles ("a problem")
- Awkward phrasing ("help to fix")
- Too brief for professional email

**Improvement Tips:**
1. Start with greeting ("Hi IT Team" / "Hello")
2. Describe the problem clearly
3. Mention what you already tried
4. Make polite request
5. End with thanks and name

**Grammar Focus:**
- Present continuous for ongoing problems: "is freezing" / "keeps freezing"
- Past perfect for attempted solutions: "I've tried restarting"
- Modal verbs for polite requests: "could someone..." / "would it be possible..."

**Vocabulary Building:**
Problem description alternatives:
- "experiencing issues with"
- "having trouble with"
- "encountering problems"
- "facing technical difficulties"

Request alternatives:
- "Could someone assist me?"
- "Would it be possible to get help?"
- "I would appreciate any assistance"
- "Could someone take a look?"
`

export const messages: any = [
  {
    role: 'system',
    content: system
  },
  {
    role: 'user',
    content: 'Máy tính bị treo, cần báo với IT support',
  },
  {
    role: 'assistant',
    content: example
  },
]