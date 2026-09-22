import type { AppData, Task, StudySession } from '@/types';
import { todayISO, getLast7Days, getDayKey } from '@/lib/date';

export function getStreak(tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => t.completedAt!.slice(0, 10))
  );
  if (completedDates.size === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  // If today not completed yet, don't break streak — start from yesterday
  if (!completedDates.has(getDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completedDates.has(getDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getTodayProgress(tasks: Task[]): { completed: number; total: number; pct: number } {
  const today = todayISO();
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.completed).length;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getWeeklyActivity(tasks: Task[]): { day: string; completed: number; created: number }[] {
  const days = getLast7Days();
  return days.map((dayKey) => ({
    day: dayKey,
    completed: tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === dayKey).length,
    created: tasks.filter((t) => t.createdAt.slice(0, 10) === dayKey).length,
  }));
}

export function getWeeklyStudyTime(sessions: StudySession[]): number {
  const days = getLast7Days();
  return sessions
    .filter((s) => days.includes(s.date))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function getStudyTimeBySubject(sessions: StudySession[]): { subjectId: string; minutes: number }[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.subjectId, (map.get(s.subjectId) || 0) + s.durationMinutes);
  }
  return Array.from(map.entries())
    .map(([subjectId, minutes]) => ({ subjectId, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function getSubjectProgress(tasks: Task[], subjectId: string): { completed: number; total: number; pct: number } {
  const subjectTasks = tasks.filter((t) => t.subjectId === subjectId);
  const total = subjectTasks.length;
  const completed = subjectTasks.filter((t) => t.completed).length;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getTopicProgress(tasks: Task[], topicId: string): { completed: number; total: number; pct: number } {
  const topicTasks = tasks.filter((t) => t.topicId === topicId);
  const total = topicTasks.length;
  const completed = topicTasks.filter((t) => t.completed).length;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getStreakDays(tasks: Task[], count = 7): { date: string; active: boolean }[] {
  const completedDates = new Set(
    tasks.filter((t) => t.completed && t.completedAt).map((t) => t.completedAt!.slice(0, 10))
  );
  const days = getLast7Days();
  return days.map((date) => ({ date, active: completedDates.has(date) }));
}

export function getMostStudiedSubject(data: AppData): { subjectId: string; minutes: number } | null {
  const bySubject = getStudyTimeBySubject(data.studySessions);
  if (bySubject.length === 0 || bySubject[0].minutes === 0) return null;
  return { subjectId: bySubject[0].subjectId, minutes: bySubject[0].minutes };
}
