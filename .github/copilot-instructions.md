# Anki Maker AI Coding Instructions

## Project Overview
Frontend-only React app that generates Anki flashcards from user prompts using OpenAI GPT.
Integrates with local Anki desktop via AnkiConnect plugin and optional TTS service for audio generation.

## Architecture & Key Components

### Core Data Flow
1. **User Entry** → `Home.tsx` (landing + bookmarklet) → `/suggest` route → `AppModern.tsx` (main app)
2. **AI Generation** → `useOpenAI` hook → `services/openai/openaiService.ts` → `prompts/vocab_prompt.ts` template
3. **Anki Integration** → `useAnki` hooks → `services/anki/ankiService.ts` → AnkiConnect (`localhost:8765`) → Local Anki desktop
4. **State Management** → React Query (server state) + Context API (OpenAI key) + `hooks/useLocalStorage` (user preferences)### Critical Integration Points
- **AnkiConnect**: Must be running on `localhost:8765` - all card operations fail without it
- **TTS Service**: Uses OpenAI TTS API (`/v1/audio/speech`) - requires same OpenAI key as GPT
- **OpenAI API**: Key managed via `contexts/OpenAIKeyContext.tsx`, used for both GPT and TTS, stored in localStorage
- **Bookmarklet**: Browser extension for text selection → direct navigation with `?prompt=` param

### Modern Architecture (Services Layer)
```typescript
// Modern services layer - all API operations consolidated
src/services/
├── ankiService.ts       // Class-based AnkiConnect wrapper
├── openaiService.ts     // OpenAI API with streaming
└── ttsService.ts        // Audio generation service

// React Context & Shared Utilities
src/contexts/            // React context providers (OpenAI key)
src/shared/              // Consolidated utilities (types, constants, utils, prompts)
src/hooks/               // Custom React hooks (useAnki, useOpenAI, etc.)
tests/                   // All test files
```

### Note Structure (Basic_cloze Model)
```typescript
interface Note {
  modelName: "Basic_cloze";     // Fixed model type
  deckName: string;             // Target Anki deck
  fields: {
    Front: string;              // Context + explanation (markdown → HTML)
    Question: string;           // Cloze deletion: "{{c1::answer}}"
    Ans: string;               // Plain text answer
    Back: string;              // Detailed analysis + examples
    Audio?: string;            // Text for TTS generation
  };
  tags: string[];
  key: string;                 // Unique ID for deduplication
  trashed?: boolean;           // User rejected this card
  created?: boolean;           // Successfully added to Anki
}
```

## Development Workflows

### Setup & Commands
```bash
pnpm dev                    # Vite dev server
pnpm build                  # TypeScript + Vite build
pnpm lint                   # ESLint check
pnpm preview               # Test production build
```

### Testing Strategy (API-focused)
- **Focus**: Only test external API integrations (Anki, OpenAI)
- **MSW**: Mock AnkiConnect API calls (see `anki.test.ts` pattern)
- **Setup**: `tests/setup.js` configures testing-library matchers for API tests
- **Test Location**: All tests consolidated in `tests/` directory
- **Pattern**: Mock external services, test data transformations, avoid UI component tests

### Environment Requirements
1. **Anki Desktop** + **AnkiConnect plugin** (essential for functionality)
2. **OpenAI API key** - via Settings UI or `.env` file as `OPENAI_API_KEY` (used for both GPT and TTS)

## Project-Specific Patterns

### State Management Layers
- **React Query**: External APIs (Anki, OpenAI) with caching/retries
- **Context API**: OpenAI key + theme state
- **useLocalStorage**: User preferences (deck, tags) with automatic persistence (located in `hooks/`)
- **Component State**: Form inputs, UI interactions, pending notes list

### Prompt Engineering Architecture
- **prompts/vocab_prompt.ts**: Vietnamese English learners (A2 level) - conversation-based cards
- **System Context**: Includes user's previous card decisions (created/trashed) to improve suggestions

### Data Processing Pipeline
1. User prompt → OpenAI streaming API → Raw markdown response
2. Parse markdown → Extract sections (Front, Question, Ans, Back, Audio)
3. Markdown → HTML conversion via `marked` library
4. Optional: Audio text → TTS service → File attachment to Anki media folder
5. Note object → AnkiConnect JSON-RPC → Anki desktop app

### Component Architecture Patterns
- **Lazy Loading**: `LazyLoader.tsx` with React.lazy() for code splitting
- **Error Boundaries**: `RouterErrorBoundary.tsx` + `ErrorBoundary.tsx`
- **Material-UI**: Consistent theming via `ThemeProvider.tsx`
- **Custom Hooks**: Business logic extracted to `src/hooks/` (useAnki, useOpenAI, useNoteManagement)

## Key Files for Common Tasks

### Adding New Features
- **New card types**: `src/shared/types.ts` + `docs/anki-basic-cloze-format.md` (comprehensive format spec)
- **AI behavior**: Edit prompt templates in `src/shared/vocab_prompt.ts` + modify parsing in `src/services/openaiService.ts`
- **Anki operations**: Extend `src/services/ankiService.ts` class methods
- **UI components**: Material-UI based, main logic in `AppModern.tsx`, organized in `src/components/` with index exports

### Configuration & Constants
- **Shared utilities**: `src/shared/` (constants, types, utils, queryClient, prompts)
- **Custom hooks**: `src/hooks/` (includes useLocalStorage)
- **Tests**: `tests/` (all test files)

## External Dependencies & Gotchas

### AnkiConnect Integration
- **Port**: Always `localhost:8765` (AnkiConnect standard)
- **Error handling**: Network failures vs. AnkiConnect API errors handled differently
- **Required plugin**: Must be installed and enabled in Anki desktop

### TTS Service (OpenAI TTS API)
- **Service**: OpenAI TTS API (`/v1/audio/speech`)
- **Authentication**: Uses same OpenAI API key as GPT models
- **Optional feature**: App works without audio generation, gracefully degrades
- **Audio format**: MP3 files generated and embedded directly in Anki cards

### Browser Integration
- **Bookmarklet**: `Home.tsx` contains browser bookmarklet for text selection
- **URL params**: `?prompt=` parameter for direct navigation to card creation via `/suggest` route
- **Routing**: `Home.tsx` (landing) → `/suggest` or `/app` → `AppModern.tsx` (unified main app)
- **CORS**: Frontend-only, relies on external services accepting requests