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
  created?: boolean;
}

export interface SuggestOptions {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
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

export interface ExtractedSections {
  front: string;
  audio: string;
  ans: string;
  back: string;
}
