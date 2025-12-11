export interface AudioFile {
  file: File;
  base64: string;
  mimeType: string;
  duration?: number;
  sampleRate?: number;
}

export type TranscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TranscriptionState {
  status: TranscriptionStatus;
  text: string | null;
  error: string | null;
  fromCache?: boolean;
}