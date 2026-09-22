'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AppData, Subject, Topic, Task, Note, StudySession, Settings, Priority } from '@/types';
import { loadData, saveData, createEmptyData, generateId, validateImportedData, exportData } from '@/lib/storage';
import { createSeedData } from '@/lib/seed';

interface DataContextValue {
  data: AppData;
  ready: boolean;

  // Subjects
  addSubject: (input: { name: string; description: string; icon: string; color: string }) => string;
  updateSubject: (id: string, patch: Partial<Pick<Subject, 'name' | 'description' | 'icon' | 'color'>>) => void;
  deleteSubject: (id: string) => void;
  touchSubject: (id: string) => void;

  // Topics
  addTopic: (input: { subjectId: string; name: string }) => string;
  updateTopic: (id: string, patch: Partial<Pick<Topic, 'name'>>) => void;
  deleteTopic: (id: string) => void;
  reorderTopics: (subjectId: string, orderedIds: string[]) => void;

  // Tasks
  addTask: (input: { title: string; description?: string; subjectId: string; topicId: string; priority: Priority; dueDate: string | null; dueTime: string | null }) => string;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Notes
  getNoteByTopic: (topicId: string) => Note | undefined;
  upsertNote: (topicId: string, content: string) => void;

  // Study sessions
  addStudySession: (input: { subjectId: string; topicId: string | null; durationMinutes: number; date?: string }) => void;

  // Settings
  updateSettings: (patch: Partial<Settings>) => void;

  // Data management
  exportJSON: () => void;
  importJSON: (raw: string) => boolean;
  resetAll: () => void;
  loadSeed: () => void;
  clearSeed: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(createEmptyData);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    const loaded = loadData();
    if (!loaded.seeded && loaded.subjects.length === 0) {
      const seed = createSeedData();
      setData(seed);
      saveData(seed);
    } else {
      setData(loaded);
    }
    setReady(true);
  }, []);

  // Debounced save
  const scheduleSave = useCallback((next: AppData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(next), 200);
  }, []);

  const mutate = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  // --- Subjects ---
  const addSubject = useCallback((input: { name: string; description: string; icon: string; color: string }) => {
    const id = generateId();
    mutate((prev) => ({
      ...prev,
      subjects: [...prev.subjects, {
        id,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        createdAt: new Date().toISOString(),
        lastStudiedAt: null,
      }],
    }));
    return id;
  }, [mutate]);

  const updateSubject = useCallback((id: string, patch: Partial<Pick<Subject, 'name' | 'description' | 'icon' | 'color'>>) => {
    mutate((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => s.id === id ? { ...s, ...patch } : s),
    }));
  }, [mutate]);

  const deleteSubject = useCallback((id: string) => {
    mutate((prev) => {
      const topicIds = prev.topics.filter((t) => t.subjectId === id).map((t) => t.id);
      return {
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== id),
        topics: prev.topics.filter((t) => t.subjectId !== id),
        tasks: prev.tasks.filter((t) => t.subjectId !== id),
        notes: prev.notes.filter((n) => !topicIds.includes(n.topicId)),
        studySessions: prev.studySessions.filter((s) => s.subjectId !== id),
      };
    });
  }, [mutate]);

  const touchSubject = useCallback((id: string) => {
    mutate((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => s.id === id ? { ...s, lastStudiedAt: new Date().toISOString().slice(0, 10) } : s),
    }));
  }, [mutate]);

  // --- Topics ---
  const addTopic = useCallback((input: { subjectId: string; name: string }) => {
    const id = generateId();
    const now = new Date().toISOString();
    mutate((prev) => {
      const order = prev.topics.filter((t) => t.subjectId === input.subjectId).length;
      return {
        ...prev,
        topics: [...prev.topics, { id, subjectId: input.subjectId, name: input.name, order, createdAt: now, updatedAt: now }],
      };
    });
    return id;
  }, [mutate]);

  const updateTopic = useCallback((id: string, patch: Partial<Pick<Topic, 'name'>>) => {
    mutate((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t),
    }));
  }, [mutate]);

  const deleteTopic = useCallback((id: string) => {
    mutate((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
      tasks: prev.tasks.filter((t) => t.topicId !== id),
      notes: prev.notes.filter((n) => n.topicId !== id),
    }));
  }, [mutate]);

  const reorderTopics = useCallback((subjectId: string, orderedIds: string[]) => {
    mutate((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => {
        if (t.subjectId !== subjectId) return t;
        const idx = orderedIds.indexOf(t.id);
        return idx >= 0 ? { ...t, order: idx } : t;
      }),
    }));
  }, [mutate]);

  // --- Tasks ---
  const addTask = useCallback((input: { title: string; description?: string; subjectId: string; topicId: string; priority: Priority; dueDate: string | null; dueTime: string | null }) => {
    const id = generateId();
    mutate((prev) => ({
      ...prev,
      tasks: [...prev.tasks, {
        id,
        title: input.title,
        description: input.description || '',
        subjectId: input.subjectId,
        topicId: input.topicId,
        completed: false,
        priority: input.priority,
        dueDate: input.dueDate,
        dueTime: input.dueTime,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }],
    }));
    return id;
  }, [mutate]);

  const updateTask = useCallback((id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    mutate((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => t.id === id ? { ...t, ...patch } : t),
    }));
  }, [mutate]);

  const toggleTask = useCallback((id: string) => {
    mutate((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => t.id === id ? {
        ...t,
        completed: !t.completed,
        completedAt: !t.completed ? new Date().toISOString() : null,
      } : t),
    }));
  }, [mutate]);

  const deleteTask = useCallback((id: string) => {
    mutate((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, [mutate]);

  // --- Notes ---
  const getNoteByTopic = useCallback((topicId: string) => {
    return data.notes.find((n) => n.topicId === topicId);
  }, [data.notes]);

  const upsertNote = useCallback((topicId: string, content: string) => {
    mutate((prev) => {
      const existing = prev.notes.find((n) => n.topicId === topicId);
      const now = new Date().toISOString();
      if (existing) {
        return { ...prev, notes: prev.notes.map((n) => n.topicId === topicId ? { ...n, content, updatedAt: now } : n) };
      }
      return { ...prev, notes: [...prev.notes, { id: generateId(), topicId, content, createdAt: now, updatedAt: now }] };
    });
  }, [mutate]);

  // --- Study sessions ---
  const addStudySession = useCallback((input: { subjectId: string; topicId: string | null; durationMinutes: number; date?: string }) => {
    mutate((prev) => ({
      ...prev,
      studySessions: [...prev.studySessions, {
        id: generateId(),
        subjectId: input.subjectId,
        topicId: input.topicId,
        durationMinutes: input.durationMinutes,
        date: input.date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      }],
      subjects: prev.subjects.map((s) => s.id === input.subjectId ? { ...s, lastStudiedAt: new Date().toISOString().slice(0, 10) } : s),
    }));
  }, [mutate]);

  // --- Settings ---
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    mutate((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, [mutate]);

  // --- Data management ---
  const exportJSON = useCallback(() => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karrim-study-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJSON = useCallback((raw: string) => {
    const validated = validateImportedData(raw);
    if (!validated) return false;
    setData(validated);
    saveData(validated);
    return true;
  }, []);

  const resetAll = useCallback(() => {
    const empty = createEmptyData();
    setData(empty);
    saveData(empty);
  }, []);

  const loadSeed = useCallback(() => {
    const seed = createSeedData();
    setData(seed);
    saveData(seed);
  }, []);

  const clearSeed = useCallback(() => {
    mutate((prev) => ({ ...prev, seeded: false }));
  }, [mutate]);

  return (
    <DataContext.Provider value={{
      data, ready,
      addSubject, updateSubject, deleteSubject, touchSubject,
      addTopic, updateTopic, deleteTopic, reorderTopics,
      addTask, updateTask, toggleTask, deleteTask,
      getNoteByTopic, upsertNote,
      addStudySession,
      updateSettings,
      exportJSON, importJSON, resetAll, loadSeed, clearSeed,
    }}>
      {children}
    </DataContext.Provider>
  );
}
