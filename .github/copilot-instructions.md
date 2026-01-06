# Anki Maker AI Coding Instructions

## Project Overview
React + TypeScript frontend that generates Anki flashcards from user prompts using OpenAI GPT-4o-mini. Features streaming AI responses, direct Anki desktop integration via AnkiConnect, optional TTS audio generation, and specialized Vietnamese English learning workflows.

## Architecture & Key Components

### Application Entry Points
- **Main**: `src/main.tsx` → Router with lazy-loaded pages
- **UI Variants**: `src/pages/app/App.tsx` (original), `AppModern.tsx`, `AppSimple.tsx`
- **Route Structure**: React Router with `/`, `/modern`, `/simple`, `/settings`, `/test-anki`, `/compare`

### Core Data Flow
1. **User Input** → App components → `useOpenAI` hook
2. **AI Generation** → `enhancedOpenAIService` (streaming) → `vocab_prompt.ts` (Vietnamese A2 learners)
3. **Anki Integration** → `ankiService` → AnkiConnect localhost:8765 → Local Anki desktop
4. **State Management** → React Query + Context API + localStorage persistence

### Note Data Structure
```typescript
interface Note {
  id?: string;
  key: string;              // Unique identifier
  modelName: string;        // Anki card model
  deckName: string;         // Target deck
  fields: NoteFields;       // Front/Back/Ans content + Audio
  tags: string[];           // Anki tags
  trashed?: boolean;        // User rejected
  created?: boolean;        // Successfully added to Anki
  createdAt?: Date;
  audio?: AudioAttachment[];
}
```

## Development Workflows

### Commands
```bash
pnpm dev      # Vite dev server
pnpm build    # TypeScript + Vite build
pnpm lint     # ESLint check
pnpm preview  # Preview production build
pnpm test     # Vitest + jsdom
```

### Testing Patterns
- **MSW**: Mock AnkiConnect on `localhost:8765` (see `src/anki.test.ts`)
- **Setup**: `tests/setup.js` configures testing-library matchers
- **Environment**: jsdom for React components in `vitest.config.ts`

## Service Layer Architecture

### AI Integration
- **Prompts**: `src/vocab_prompt.ts` (Vietnamese learners, structured conversation cards)
- **Services**: `src/services/openai/openaiService.ts` (streaming), `enhanced/enhancedOpenAIService.ts`
- **Hooks**: `src/hooks/useOpenAI.ts` (React Query mutations), `useOpenAIStream.ts`

### Anki Integration
- **Low-level**: `src/anki.ts` (JSON-RPC wrapper)
- **Service**: `src/services/anki/ankiService.ts` (batching, card creation)
- **Hooks**: `src/hooks/useAnki.ts` (decks, models, tags queries)

### State Management Patterns
- **External APIs**: React Query with caching (5min staleTime for Anki queries)
- **User Settings**: Context + localStorage via `useLocalStorage.tsx`
- **OpenAI Key**: `OpenAIKeyContext.tsx` with persistent storage

## Project-Specific Conventions

### Component Organization
- **UI Components**: `src/components/ui/` (NoteCard variants, AnkiPreview)
- **Forms**: `src/components/forms/` (PromptInput, DeckSelector, TagSelector)
- **Layout**: `src/components/layout/` (ErrorBoundary, ToastProvider)
- **Lazy Loading**: `src/components/LazyLoader.tsx` for code splitting

### Configuration & Constants
- **Endpoints**: `src/constants/endpoints.ts` (AnkiConnect 8765, TTS 3000, OpenAI API)
- **AI Config**: `src/constants/aiConfig.ts` (model selection, token estimation)
- **Error Messages**: Centralized in `src/constants/errorMessages.ts`

### Critical Integration Points
- **AnkiConnect**: Must be running on localhost:8765 for card creation
- **TTS Service**: Optional localhost:3000/dev/chatbot/tts/api (hardcoded in multiple places)
- **OpenAI**: Streaming via fetch with abort controllers for cancellation

### Vietnamese Learning Specialization
- **Prompt Template**: Structured conversations with IPA phonetics, cultural context
- **Card Format**: Front/Back with conversations, Vietnamese translations, usage notes
- **Target Audience**: A2-level Vietnamese speakers learning American English

## Common Modification Patterns

### Adding New AI Prompts
1. Create prompt template in `src/` (follow `vocab_prompt.ts` structure)
2. Update `openaiService.ts` to use new prompt
3. Modify parsing logic to handle response format
4. Add tests with MSW mocks

### Extending Note Fields
1. Update `NoteFields` interface in `src/types/index.ts`
2. Modify UI components (`NoteCard*` variants)
3. Update Anki service serialization
4. Run tests to ensure no breakage

### Testing External Services
- Mock AnkiConnect responses in test files using MSW
- Use `rest.post('http://localhost:8765')` handlers
- Test error scenarios (connection failures, invalid responses)