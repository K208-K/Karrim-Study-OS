export type Priority = 'low' | 'medium' | 'high';

export type ThemeMode = 'dark' | 'light' | 'system';
export type WeekStart = 'monday' | 'sunday';
export type DefaultTaskView = 'all' | 'today' | 'upcoming' | 'completed';

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  lastStudiedAt: string | null;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  topicId: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Note {
  id: string;
  topicId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId: string | null;
  durationMinutes: number;
  date: string;
  createdAt: string;
}

export interface Settings {
  theme: ThemeMode;
  weekStart: WeekStart;
  defaultPriority: Priority;
  defaultTaskView: DefaultTaskView;
  userName: string;
}

export interface AppData {
  version: number;
  subjects: Subject[];
  topics: Topic[];
  tasks: Task[];
  notes: Note[];
  studySessions: StudySession[];
  settings: Settings;
  seeded: boolean;
}

export type EntityType = 'subject' | 'topic' | 'task' | 'note';

export interface SearchResult {
  type: EntityType;
  id: string;
  title: string;
  subtitle: string;
  subjectId?: string;
  topicId?: string;
}
