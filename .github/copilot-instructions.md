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
````instructions
# Anki Maker — AI contributor instructions

Short, targeted guidance to get productive in this repo. Focus on where behaviour lives, where to change prompts/API calls, and how to run/build/tests locally.

Core facts
- Frontend-only React + TypeScript app. Entry: `src/main.tsx`, main UI variants: `src/pages/app/App.tsx`, `AppModern.tsx`, `AppSimple.tsx`.
- Main responsibilities: take a user prompt → call OpenAI → parse into Note objects → (optional) generate TTS → push notes to Anki via AnkiConnect.

Where to change AI behaviour
- Prompts: `src/default_prompt.ts` and `src/vocab_prompt.ts`.
- OpenAI wrapper: `src/openai.ts` and `src/services/openai/openaiService.ts` (streaming + parsing logic).

Anki integration
- Low-level: `src/anki.ts` implements the JSON-RPC wrapper to AnkiConnect (localhost:8765).
- Higher-level service: `src/services/anki/ankiService.ts` contains card creation flows and batching.
- Important: AnkiConnect must be running locally on port 8765 for add-note flows to succeed.

Note shape and processing
- Canonical shape is the `Note` used across the UI (see `src/types/index.ts` and uses in `src/components/NoteCardMemo.tsx`). Key fields: `modelName`, `deckName`, `fields` (Front/Back/Question/Ans/Audio), `tags`, `key`, `trashed`, `created`.
- Markdown → HTML conversion happens before sending notes to Anki (see `marked` usage in services/components).

State & app patterns to follow
- External calls use React Query (see `src/config/queryClient.ts` and hooks in `src/hooks/useOpenAI.ts`, `useAnki.ts`).
- OpenAI API key persistence: `src/OpenAIKeyContext.tsx` + `src/useLocalStorage.tsx`.
- Prefer using existing hooks/services rather than calling fetch directly so caching, error handling, and telemetry remain consistent.

Dev, build and test commands
- Start dev server: `pnpm dev`
- Build: `pnpm build` (TypeScript + Vite)
- Lint: `pnpm lint`
- Preview production build: `pnpm preview`
- Run tests: `pnpm test` (Vitest + jsdom). Tests use MSW to mock external services; see `src/anki.test.ts` and `tests/setup.js`.

Integration notes & gotchas
- TTS endpoint is hardcoded in the app (search `tts` or `src/services/tts/ttsService.ts` and `src/App.tsx`). If you change it, update both service and UI config.
- Network errors from AnkiConnect are thrown by `ankiConnect()`; callers usually display toasts (see `src/components/layout/ToastProvider/ToastProvider.tsx`).
- The app stores lightweight user decisions (created/trashed) and feeds them to the prompt for context — modifying prompt templates may require updating parsing logic and tests.

Where tests mock external integrations
- MSW handlers live next to tests (see `src/anki.test.ts`) and `tests/setup.js` config. Mock AnkiConnect on `http://localhost:8765` and OpenAI responses for deterministic tests.

When adding features
- Add small, focused unit tests for services (OpenAI parsing, Anki payload shaping). Follow existing test patterns in `src/*.test.ts`.
- Update `src/types/index.ts` for public data shape changes and run `pnpm test`.

If anything in these notes is unclear or you want more examples (e.g., a sample Note payload or walkthrough of the Anki RPC flow), tell me which section and I will expand.
````