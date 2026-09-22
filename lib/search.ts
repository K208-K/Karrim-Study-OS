import type { AppData, SearchResult } from '@/types';

export function globalSearch(data: AppData, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const s of data.subjects) {
    if (s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) {
      results.push({
        type: 'subject',
        id: s.id,
        title: s.name,
        subtitle: s.description || 'Subject',
        subjectId: s.id,
      });
    }
  }

  for (const t of data.topics) {
    const subject = data.subjects.find((s) => s.id === t.subjectId);
    if (t.name.toLowerCase().includes(q)) {
      results.push({
        type: 'topic',
        id: t.id,
        title: t.name,
        subtitle: subject?.name || 'Topic',
        subjectId: t.subjectId,
        topicId: t.id,
      });
    }
  }

  for (const task of data.tasks) {
    if (task.title.toLowerCase().includes(q)) {
      const subject = data.subjects.find((s) => s.id === task.subjectId);
      const topic = data.topics.find((t) => t.id === task.topicId);
      results.push({
        type: 'task',
        id: task.id,
        title: task.title,
        subtitle: [subject?.name, topic?.name].filter(Boolean).join(' · ') || 'Task',
        subjectId: task.subjectId,
        topicId: task.topicId,
      });
    }
  }

  for (const note of data.notes) {
    const topic = data.topics.find((t) => t.id === note.topicId);
    const subject = topic ? data.subjects.find((s) => s.id === topic.subjectId) : null;
    if (note.content.toLowerCase().includes(q)) {
      const preview = note.content.slice(0, 60);
      results.push({
        type: 'note',
        id: note.id,
        title: topic?.name || 'Note',
        subtitle: [subject?.name, preview].filter(Boolean).join(' · ') || 'Note',
        subjectId: subject?.id,
        topicId: note.topicId,
      });
    }
  }

  return results.slice(0, 20);
}
