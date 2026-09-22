import type { AppData, Settings } from '@/types';

const STORAGE_KEY = 'karrim-study-os-data';
const STORAGE_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  weekStart: 'monday',
  defaultPriority: 'medium',
  defaultTaskView: 'today',
  userName: 'Karrim',
};

export function createEmptyData(): AppData {
  return {
    version: STORAGE_VERSION,
    subjects: [],
    topics: [],
    tasks: [],
    notes: [],
    studySessions: [],
    settings: { ...DEFAULT_SETTINGS },
    seeded: false,
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return createEmptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== 'object') return createEmptyData();
    return {
      ...createEmptyData(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return createEmptyData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function validateImportedData(raw: string): AppData | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.subjects)) return null;
    if (!Array.isArray(parsed.topics)) return null;
    if (!Array.isArray(parsed.tasks)) return null;
    return {
      ...createEmptyData(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return null;
  }
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
