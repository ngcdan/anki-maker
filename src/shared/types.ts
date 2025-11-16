export interface NoteFields {
  Front: string;
  Back: string;
  Question: string;
  Ans: string;
  Audio?: string;
}

export interface Note {
  id?: string;
  key: string;
  modelName: string;
  deckName: string;
  fields: NoteFields;
  tags: string[];
  trashed?: boolean;
  created?: boolean;
  createdAt?: Date;
  audio?: AudioAttachment[];
}

export interface AudioAttachment {
  path: string;
  filename: string;
  skipHash: string;
  fields: string[];
}

export interface AppConfig {
  ankiConnect: {
    url: string;
    port: number;
  };
  tts: {
    enabled: boolean;
  };
  openai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

export interface SuggestOptions {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}

export interface OpenAITTSRequest {
  model: 'tts-1' | 'tts-1-hd';
  input: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
  speed?: number; // 0.25 to 4.0
}

export interface OpenAITTSResponse {
  audioBuffer: ArrayBuffer;
  fileName: string;
  filePath?: string;
}

export interface AnkiConnectRequest {
  action: string;
  version: number;
  params?: any;
}

export interface AnkiConnectResponse<T = any> {
  result: T;
  error: string | null;
}

export type NoteStatus = 'pending' | 'created' | 'trashed';

export interface FormComponentProps {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export interface ExtractedSections {
  front: string;
  audio: string;
  ans: string;
  back: string;
}