export type AnkiNoteType = 'Basic' | 'Basic (and reversed card)' | 'Cloze';

export type MediaType = 'image' | 'video';

export interface MediaAttachment {
  data: string; // base64
  filename: string;
  fields: string[]; // which fields reference this media
  type: MediaType;
}

export interface Note {
  key: string;
  modelName: string;
  deckName: string;
  fields: Record<string, string>;
  tags: string[];
  created?: boolean;
  media?: MediaAttachment[];
}

export interface SuggestOptions {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
  noteType: AnkiNoteType;
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
