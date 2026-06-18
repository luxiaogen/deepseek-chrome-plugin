export type VisualEffect = 'off' | 'snow' | 'sakura' | 'rain';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedChat {
  id: string;
  title: string;
  url: string;
  folderId: string | null;
  tags: string[];
  preview: string;
  savedAt: string;
  updatedAt: string;
}

export interface Settings {
  panelEnabled: boolean;
  visualEffect: VisualEffect;
}

export interface AppState {
  prompts: Prompt[];
  folders: Folder[];
  savedChats: SavedChat[];
  settings: Settings;
}

export interface ChatMessage {
  id: string;
  index: number;
  role: 'user' | 'assistant' | 'system' | 'unknown';
  text: string;
}

export interface ChatSnapshot {
  title: string;
  url: string;
  exportedAt: string;
  messages: ChatMessage[];
}
