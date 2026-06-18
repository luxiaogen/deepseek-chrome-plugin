import { browser } from 'wxt/browser';
import type { AppState, Folder, Prompt, SavedChat, Settings } from './types';

const STORAGE_KEYS = {
  prompts: 'deepseekPlugin.prompts',
  folders: 'deepseekPlugin.folders',
  savedChats: 'deepseekPlugin.savedChats',
  settings: 'deepseekPlugin.settings',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  panelEnabled: true,
  visualEffect: 'off',
};

export function createId(prefix: string) {
  const value =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

export async function getAppState(): Promise<AppState> {
  const result = await browser.storage.local.get(Object.values(STORAGE_KEYS));
  const savedSettings = result[STORAGE_KEYS.settings];

  return {
    prompts: asArray<Prompt>(result[STORAGE_KEYS.prompts]),
    folders: asArray<Folder>(result[STORAGE_KEYS.folders]),
    savedChats: asArray<SavedChat>(result[STORAGE_KEYS.savedChats]),
    settings: {
      ...DEFAULT_SETTINGS,
      ...(isRecord(savedSettings) ? savedSettings : {}),
    },
  };
}

export async function setPrompts(prompts: Prompt[]) {
  await browser.storage.local.set({ [STORAGE_KEYS.prompts]: prompts });
}

export async function setFolders(folders: Folder[]) {
  await browser.storage.local.set({ [STORAGE_KEYS.folders]: folders });
}

export async function setSavedChats(savedChats: SavedChat[]) {
  await browser.storage.local.set({ [STORAGE_KEYS.savedChats]: savedChats });
}

export async function setSettings(settings: Settings) {
  await browser.storage.local.set({ [STORAGE_KEYS.settings]: settings });
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
