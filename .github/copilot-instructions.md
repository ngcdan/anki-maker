# Anki Maker AI Coding Instructions

## Project Overview
Frontend-only React app that generates Anki flashcards from user prompts using OpenAI GPT. Integrates with local Anki desktop via AnkiConnect plugin and optional TTS service for audio generation.

## Architecture & Key Components

### Core Data Flow
1. **User Input** → `Home.tsx` (entry point) → `App.tsx` (main card creation interface)
2. **AI Generation** → `openai.ts` (GPT API calls) → `vocab_prompt.ts`/`default_prompt.ts` (prompt templates)
3. **Anki Integration** → `anki.ts` (AnkiConnect API) → Local Anki desktop app (port 8765)
4. **State Management** → React Query for server state, Context API for OpenAI key, `useLocalStorage.tsx` for persistence

### Critical Dependencies
- **AnkiConnect**: Must be running on `localhost:8765` for card creation
- **TTS Service**: Optional external service on `localhost:3000/dev/chatbot/tts/api` for audio
- **OpenAI API**: Key stored in localStorage via `OpenAIKeyContext.tsx`

### Note Structure Convention
```typescript
interface Note {
  modelName: string;        // Anki card model type
  deckName: string;         // Target Anki deck
  fields: {                 // Card content
    Front: string;          // Question side (markdown → HTML)
    Back: string;           // Answer side (markdown → HTML)
    Question: string;       // Alternative field name
    Ans: string;            // Alternative field name
    Audio?: string;         // Text for TTS generation
  };
  tags: string[];           // Anki tags
  key: string;              // Unique identifier
  trashed?: boolean;        // User rejected
  created?: boolean;        // Successfully added to Anki
}
```

## Development Workflows

### Local Development
```bash
pnpm dev                  # Start dev server
pnpm build               # TypeScript compile + build
pnpm lint                # ESLint check
pnpm preview             # Preview production build
```

### Testing with Vitest
- Use MSW for mocking AnkiConnect API calls (see `anki.test.ts`)
- Tests require `jsdom` environment for React components
- Setup file: `tests/setup.js`

### Environment Setup
1. Install Anki desktop app + AnkiConnect plugin
2. Set OpenAI API key in Settings or `.env` as `OPENAI_API_KEY`
3. For audio: Configure TTS service endpoint in `App.tsx` (hardcoded path)

## Project-Specific Patterns

### State Management
- **React Query**: All external API calls (Anki, OpenAI)
- **Context + useLocalStorage**: OpenAI key persistence
- **Component State**: Form inputs and UI interactions

### API Integration
- **AnkiConnect**: JSON-RPC over HTTP to `localhost:8765`
- **OpenAI**: Direct API calls with streaming support
- **Error Handling**: Network errors bubble up from `ankiConnect()` wrapper

### Prompt Engineering
- `vocab_prompt.ts`: Specialized for Vietnamese English learners (A2 level)
- `default_prompt.ts`: General card creation with user feedback integration
- System prompts include user's previous card decisions (created/trashed)

### Card Processing Pipeline
1. Raw user prompt → OpenAI API call
2. AI response → Parse into Note objects
3. Markdown fields → HTML conversion via `marked`
4. Optional: Audio text → TTS service → File attachment
5. Final Note → AnkiConnect → Anki desktop

## Key Files for Common Tasks

- **Add new card types**: Modify `Note` interface + `App.tsx` form fields
- **Change AI behavior**: Edit prompt templates in `*_prompt.ts` files
- **Anki integration**: All functions in `anki.ts` (add/modify AnkiConnect calls)
- **UI components**: Material-UI based, main logic in `App.tsx`
- **Routing**: Simple React Router setup in `main.tsx`

## External Dependencies & Integration Points

- **AnkiConnect Plugin**: Required for Anki desktop integration
- **TTS Service**: Optional, hardcoded to specific localhost endpoint
- **OpenAI API**: Rate limits and token usage considerations
- **Bookmarklet**: Browser integration for quick text selection (see `Home.tsx`)

## Testing Strategy
- Mock external services (AnkiConnect, OpenAI) with MSW
- Focus on data transformation and state management
- Component testing with React Testing Library setup