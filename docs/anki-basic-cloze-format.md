# Anki Basic_cloze Card Format Guide

## Overview
This document describes the format for creating `Basic_cloze` cards in Anki, designed for various learning domains including vocabulary, history, science, mathematics, and other subjects. The format supports rich content with context, explanations, and multimedia elements.

## Card Template Structure

### Front Template
```html
{{Front}}
<br/>
{{cloze:Question}}
<hr/>
<p>Type your answer</p>
{{type:Ans}}
```

### Back Template
```html
{{Front}}
<hr/>
<div>{{type:Ans}}</div>
{{cloze:Question}}
<hr/>
{{Back}}
```

## Field Specifications

### 1. Front Field
Contains the complete learning context including:
- **Topic/Concept**: Main subject, key terms, definitions
- **Context**: Background information, examples, or scenarios
- **Explanation**: Clear explanation of the concept or usage
- **Media file**: Optional audio, image, or other media files

**Example:**
```
Word: reservation (noun) (/ˌrɛzərˈveɪʃən/) - (/đặt chỗ/)

Conversation:

Amy: [...]
Tom: Yeah, I called them yesterday.
Amy: Awesome! What time?
Tom: 7 PM, I hope it's not too crowded.
Meaning:

Reservation here refers to an arrangement to have a table set aside at a restaurant for a specific time.
[sound:20250611_HEY_6dgccb.mp3]
```

### 2. Question Field
Contains the cloze deletion sentence with `{{c1::text}}` format:

**Example:**
```
{{c1::Hey, did you make a reservation for dinner?}}
```

**Note:** The deleted text should be the key information, concept, or complete statement that students need to recall.

### 3. Ans Field
Contains the complete answer without cloze markup:

**Example:**
```
Hey, did you make a reservation for dinner?
```

### 4. Back Field
Contains detailed analysis including:
- **Detailed breakdown**: Step-by-step explanation or analysis
- **Key concepts**: Important definitions and meanings
- **Related information**: Similar concepts, alternatives, or connections
- **Practical examples**: Real-world applications and usage scenarios

**Example:**
```
Analysis

Amy: Hey, did you make a reservation for dinner?
- Ê, mày đã đặt chỗ cho bữa tối chưa?

Tom: Yeah, I called them yesterday.
- Ừ, tao đã gọi cho họ hôm qua.

Amy: Awesome! What time?
- Tuyệt quá! Mấy giờ?

Tom: 7 PM, I hope it's not too crowded.
- 7 giờ tối, tao hy vọng không đông người quá.

Meaning in Vietnamese: "đặt chỗ"

English Synonyms: booking, appointment, arrangement

"Reservation" thường được sử dụng khi bạn muốn có một chỗ ngồi ở nhà hàng hoặc khách sạn. Ví dụ, khi bạn đi ăn với bạn bè, bạn có thể phải gọi điện để đặt chỗ, và câu hỏi "Did you make a reservation?" (Mày đã đặt chỗ chưa?) rất phổ biến trong các tình huống như thế. Khi bạn đặt chỗ trước, bạn sẽ không phải chờ lâu và chắc chắn có chỗ ngồi cho mình!
```

## Additional Examples for Different Domains

### Example 2: History - World War II

**Front Field:**
```
Event: Battle of Stalingrad (1942-1943) - Turning Point of WWII

Context:

The Battle of Stalingrad was a major battle on the Eastern Front of World War II where Nazi Germany and its allies unsuccessfully fought the Soviet Union for control of the city of Stalingrad in Southern Russia.

Timeline:
- August 1942: German forces begin assault
- September 1942: Urban warfare intensifies
- November 1942: Soviet counteroffensive begins
- February 1943: German surrender

Significance:

This battle marked the turning point of the war on the Eastern Front. The German defeat at Stalingrad was devastating and marked the beginning of Germany's retreat from the Soviet Union.
```

**Question Field:**
```
{{c1::The Battle of Stalingrad marked the turning point of World War II on the Eastern Front}}
```

**Ans Field:**
```
The Battle of Stalingrad marked the turning point of World War II on the Eastern Front
```

**Back Field:**
```
Analysis

Key Facts:
- Duration: August 1942 - February 1943 (6 months)
- Location: Stalingrad (now Volgograd), Soviet Union
- Result: Decisive Soviet victory
- Casualties: Over 2 million total (both sides)

Why it was a turning point:
1. First major German defeat on the Eastern Front
2. Massive loss of German manpower and equipment
3. Boosted Soviet morale and confidence
4. Marked beginning of German retreat from Soviet territory

Consequences:
- Germany never recovered from the losses
- Soviet Union gained momentum for further offensives
- International recognition of Soviet military capability
- Beginning of the end for Nazi Germany

Related Events: Operation Barbarossa, Battle of Kursk, Siege of Leningrad
```

### Example 3: Science - Photosynthesis

**Front Field:**
```
Process: Photosynthesis - Energy Conversion in Plants

Definition:
Photosynthesis is the process by which plants and other organisms use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.

Chemical Equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Stages:
1. Light-dependent reactions (in thylakoids)
2. Light-independent reactions/Calvin cycle (in stroma)

Importance:
Photosynthesis is essential for life on Earth as it produces oxygen and serves as the foundation of most food chains.
```

**Question Field:**
```
{{c1::Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen}}
```

**Ans Field:**
```
Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen
```

**Back Field:**
```
Analysis

Detailed Process:

Light Reactions:
- Occur in thylakoid membranes
- Chlorophyll absorbs light energy
- Water molecules are split (photolysis)
- Oxygen is released as byproduct
- ATP and NADPH are produced

Dark Reactions (Calvin Cycle):
- Occur in stroma
- CO₂ is fixed into organic compounds
- Uses ATP and NADPH from light reactions
- Produces glucose (C₆H₁₂O₆)

Key Components:
- Chloroplasts: Site of photosynthesis
- Chlorophyll: Light-absorbing pigment
- Thylakoids: Where light reactions occur
- Stroma: Where Calvin cycle occurs

Global Impact:
- Produces ~70% of Earth's oxygen
- Foundation of food webs
- Removes CO₂ from atmosphere
- Enables existence of aerobic life

Related Concepts: Cellular respiration, chloroplasts, light spectrum, carbon cycle
```

## Implementation for Client Applications

### 1. Data Structure
When creating cards programmatically, use this structure:

```typescript
interface BasicClozeNote {
  modelName: "Basic_cloze";
  deckName: string;
  fields: {
    Front: string;     // Complete learning context and background
    Question: string;  // Cloze deletion statement or question
    Ans: string;       // Complete answer or key concept
    Back: string;      // Detailed analysis and explanations
  };
  tags: string[];
}
```

### 2. Field Content Guidelines

#### Front Field Format
```
Topic: {main_topic} - {brief_description}

Context:

{background_information}
{examples_or_scenarios}
{relevant_details}

Explanation:

{detailed_explanation}
[media:{media_filename}]
```

**Alternative formats for different domains:**
- **Historical events**: Event: {name} ({date}) - {significance}
- **Scientific concepts**: Process/Law: {name} - {definition}
- **Mathematical theorems**: Theorem: {name} - {statement}
- **Literature**: Work: {title} by {author} - {theme/analysis}

#### Question Field Format
```
{{c1::{complete_sentence_to_recall}}}
```

#### Ans Field Format
```
{complete_sentence_without_cloze_markup}
```

#### Back Field Format
```
Analysis

{detailed_breakdown_or_explanation}

Key Concepts: {important_definitions}

Related Information: {connections}, {alternatives}, {similar_concepts}

{practical_examples_and_applications}
```

**Domain-specific formats:**
- **Language learning**: Include translations, phonetics, synonyms
- **History**: Timeline, causes, effects, significance
- **Science**: Process steps, formulas, applications
- **Mathematics**: Proofs, examples, special cases

### 3. AnkiConnect API Example

```javascript
// Example 1: Language Learning
const createLanguageCard = {
  "action": "addNote",
  "version": 6,
  "params": {
    "note": {
      "deckName": "English Vocabulary",
      "modelName": "Basic_cloze",
      "fields": {
        "Front": "Word: reservation (noun) (/ˌrɛzərˈveɪʃən/) - (/đặt chỗ/)...",
        "Question": "{{c1::Hey, did you make a reservation for dinner?}}",
        "Ans": "Hey, did you make a reservation for dinner?",
        "Back": "Analysis\n\nAmy: Hey, did you make a reservation for dinner?..."
      },
      "tags": ["vocabulary", "restaurant", "conversation"]
    }
  }
}

// Example 2: History
const createHistoryCard = {
  "action": "addNote",
  "version": 6,
  "params": {
    "note": {
      "deckName": "World History",
      "modelName": "Basic_cloze",
      "fields": {
        "Front": "Event: Battle of Stalingrad (1942-1943) - Turning Point of WWII...",
        "Question": "{{c1::The Battle of Stalingrad marked the turning point of World War II on the Eastern Front}}",
        "Ans": "The Battle of Stalingrad marked the turning point of World War II on the Eastern Front",
        "Back": "Analysis\n\nKey Facts:\n- Duration: August 1942 - February 1943..."
      },
      "tags": ["wwii", "eastern-front", "turning-point"]
    }
  }
}

// Example 3: Science
const createScienceCard = {
  "action": "addNote",
  "version": 6,
  "params": {
    "note": {
      "deckName": "Biology",
      "modelName": "Basic_cloze",
      "fields": {
        "Front": "Process: Photosynthesis - Energy Conversion in Plants...",
        "Question": "{{c1::Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen}}",
        "Ans": "Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen",
        "Back": "Analysis\n\nDetailed Process:\n\nLight Reactions:..."
      },
      "tags": ["biology", "photosynthesis", "energy"]
    }
  }
}
```

## Best Practices

1. **Consistency**: Always follow the same format for each field within a domain
2. **Media Files**: Include relevant audio, images, or other media when available
3. **Clear Context**: Provide sufficient background information for understanding
4. **Cultural/Domain Context**: Include relevant context and real-world applications
5. **Related Information**: Always provide connections to similar concepts or alternatives
6. **Cloze Selection**: Choose key concepts, complete statements, or critical information for cloze deletion
7. **Domain Adaptation**: Adapt the format to suit the specific learning domain
8. **Progressive Difficulty**: Structure content from basic to advanced concepts

## Validation Checklist

### General Requirements
- [ ] Front field contains topic/concept, context, and explanation
- [ ] Question field uses proper cloze syntax `{{c1::text}}`
- [ ] Ans field matches the cloze deletion text exactly
- [ ] Back field includes detailed analysis and explanations
- [ ] Content is accurate and factually correct
- [ ] Media file references are included (if available)
- [ ] Card follows the consistent format structure for the domain
- [ ] Tags are relevant and help with organization

### Domain-Specific Validation
- [ ] **Language**: Include translations, pronunciations, usage examples
- [ ] **History**: Include dates, causes, effects, significance
- [ ] **Science**: Include formulas, processes, applications
- [ ] **Mathematics**: Include proofs, examples, special cases
- [ ] **Literature**: Include themes, analysis, historical context

## Notes for Developers

- Ensure HTML entities are properly escaped
- Audio files should be in the Anki media folder
- Cloze numbers should be consistent (start with c1)
- Test cards in Anki to ensure proper rendering
- Consider implementing validation for required field formats