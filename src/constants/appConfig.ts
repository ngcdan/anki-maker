import { AppConfig } from '../types';

export const DEFAULT_APP_CONFIG: AppConfig = {
  ankiConnect: {
    url: 'http://localhost',
    port: 8765,
  },
  tts: {
    url: 'http://localhost:3000/dev/chatbot/tts/api',
    enabled: true,
    defaultDir: '/Users/linuss/Dev/resources/anki',
  },
  openai: {
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
  },
};

export const DEFAULT_SETTINGS = {
  deckName: 'Default',
  modelName: 'Basic',
  tags: [] as string[],
} as const;

export const STORAGE_KEYS = {
  OPENAI_KEY: 'openAIKey',
  DECK_NAME: 'deckName',
  TAGS: 'tags',
  APP_CONFIG: 'appConfig',
} as const;

export const QUERY_KEYS = {
  DECKS: 'decks',
  TAGS: 'tags',
  MODELS: 'models',
  MODEL_FIELDS: 'modelFields',
} as const;