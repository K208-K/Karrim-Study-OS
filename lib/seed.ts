import type { AppData } from '@/types';
import { createEmptyData, generateId } from '@/lib/storage';

export function createSeedData(): AppData {
  const data = createEmptyData();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const subjects = [
    { name: 'Machine Learning', icon: 'Brain', color: '#3b82f6', desc: 'Algorithms, models, and theory' },
    { name: 'Python', icon: 'Code2', color: '#10b981', desc: 'Programming and data' },
    { name: 'SQL', icon: 'Database', color: '#f59e0b', desc: 'Queries and databases' },
    { name: 'Power BI', icon: 'BarChart3', color: '#ef4444', desc: 'Dashboards and reporting' },
    { name: 'Statistics', icon: 'Sigma', color: '#8b5cf6', desc: 'Probability and inference' },
    { name: 'DSA', icon: 'Binary', color: '#06b6d4', desc: 'Data structures & algorithms' },
  ];

  const subjectIds: Record<string, string> = {};
  for (const s of subjects) {
    const id = generateId();
    subjectIds[s.name] = id;
    data.subjects.push({
      id,
      name: s.name,
      description: s.desc,
      icon: s.icon,
      color: s.color,
      createdAt: now,
      lastStudiedAt: today,
    });
  }

  const mlTopics = ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forest'];
  const sqlTopics = ['JOINs', 'Subqueries', 'Window Functions'];
  const pythonTopics = ['Pandas', 'NumPy', 'OOP'];

  const topicIdMap: Record<string, string> = {};
  for (const name of mlTopics) {
    const id = generateId();
    topicIdMap[`ML-${name}`] = id;
    data.topics.push({ id, subjectId: subjectIds['Machine Learning'], name, order: data.topics.length, createdAt: now, updatedAt: now });
  }
  for (const name of sqlTopics) {
    const id = generateId();
    topicIdMap[`SQL-${name}`] = id;
    data.topics.push({ id, subjectId: subjectIds['SQL'], name, order: data.topics.length, createdAt: now, updatedAt: now });
  }
  for (const name of pythonTopics) {
    const id = generateId();
    topicIdMap[`PY-${name}`] = id;
    data.topics.push({ id, subjectId: subjectIds['Python'], name, order: data.topics.length, createdAt: now, updatedAt: now });
  }

  const tasks: { title: string; subject: string; topicKey: string; priority: 'low' | 'medium' | 'high'; completed: boolean; dueOffset: number }[] = [
    { title: 'Watch lecture: Logistic Regression', subject: 'Machine Learning', topicKey: 'ML-Logistic Regression', priority: 'high', completed: false, dueOffset: 0 },
    { title: 'Read theory: Sigmoid function', subject: 'Machine Learning', topicKey: 'ML-Logistic Regression', priority: 'medium', completed: true, dueOffset: 0 },
    { title: 'Solve practice questions', subject: 'Machine Learning', topicKey: 'ML-Linear Regression', priority: 'medium', completed: true, dueOffset: -1 },
    { title: 'SQL JOIN Practice', subject: 'SQL', topicKey: 'SQL-JOINs', priority: 'high', completed: true, dueOffset: 0 },
    { title: 'Build Power BI Dashboard', subject: 'Power BI', topicKey: '', priority: 'medium', completed: false, dueOffset: 0 },
    { title: 'Pandas DataFrame exercises', subject: 'Python', topicKey: 'PY-Pandas', priority: 'low', completed: false, dueOffset: 1 },
    { title: 'Implement Decision Tree from scratch', subject: 'Machine Learning', topicKey: 'ML-Decision Trees', priority: 'high', completed: false, dueOffset: 2 },
    { title: 'Window Functions deep dive', subject: 'SQL', topicKey: 'SQL-Window Functions', priority: 'medium', completed: false, dueOffset: 1 },
  ];

  for (const t of tasks) {
    const due = new Date();
    due.setDate(due.getDate() + t.dueOffset);
    const dueStr = due.toISOString().slice(0, 10);
    const completedAt = t.completed ? new Date(due.getTime() - 3600000).toISOString() : null;
    data.tasks.push({
      id: generateId(),
      title: t.title,
      description: '',
      subjectId: subjectIds[t.subject],
      topicId: t.topicKey ? topicIdMap[t.topicKey] : '',
      completed: t.completed,
      priority: t.priority,
      dueDate: dueStr,
      dueTime: t.dueOffset === 0 && !t.completed ? '19:00' : null,
      createdAt: now,
      completedAt,
    });
  }

  // Notes for Logistic Regression
  const lrTopicId = topicIdMap['ML-Logistic Regression'];
  data.notes.push({
    id: generateId(),
    topicId: lrTopicId,
    content: `LOGISTIC REGRESSION

Logistic Regression is a supervised machine learning algorithm used for classification problems.

Key Concepts

- Sigmoid function
- Probability estimation
- Binary classification
- Decision boundary

Formula

P(y=1) = 1 / (1 + e^-z)

where z = w0 + w1*x1 + w2*x2 + ... + wn*xn

The sigmoid function maps any real value into the range (0, 1), making it suitable for probability output.`,
    createdAt: now,
    updatedAt: now,
  });

  // Study sessions
  const sessions = [
    { subject: 'Machine Learning', minutes: 95 },
    { subject: 'Python', minutes: 45 },
    { subject: 'SQL', minutes: 70 },
  ];
  for (const s of sessions) {
    const d = new Date();
    d.setDate(d.getDate() - (s.subject === 'Python' ? 1 : 0));
    data.studySessions.push({
      id: generateId(),
      subjectId: subjectIds[s.subject],
      topicId: null,
      durationMinutes: s.minutes,
      date: d.toISOString().slice(0, 10),
      createdAt: now,
    });
  }

  data.seeded = true;
  return data;
}
